"""
Cron Jobs for Al-Reef Loyalty System
- Token refresh (every 55 minutes)
- Invoice sync (every 15 minutes)
- Points expiry check (daily)
"""
import asyncio
import sys
import os
from pathlib import Path
from datetime import datetime, timezone, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Add parent directory to path
sys.path.append(str(Path(__file__).parent))

from rewaa import rewaa_service
from models import Invoice, PointsTransaction
from utils import format_phone_for_twilio
from email_service import send_sync_failure_notification
import uuid

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

async def refresh_rewaa_token():
    """Refresh Rewaa API token every 55 minutes"""
    print(f"[{datetime.now()}] Refreshing Rewaa token...")
    success = await rewaa_service.authenticate()
    if success:
        print(f"[{datetime.now()}] Rewaa token refreshed successfully")
    else:
        print(f"[{datetime.now()}] Failed to refresh Rewaa token")
    return success

async def sync_invoices_once(db_instance):
    """Sync invoices from Rewaa - single run"""
    print(f"[{datetime.now()}] Starting invoice sync...")
    
    try:
        # Check if sync is enabled
        sync_enabled_setting = await db_instance.settings.find_one({"key": "sync_enabled"}, {"_id": 0})
        if not sync_enabled_setting or sync_enabled_setting.get("value") != "true":
            print(f"[{datetime.now()}] Sync is disabled, skipping...")
            return {"status": "disabled", "synced_count": 0}
        
        # Update sync status to running
        await db_instance.settings.update_one(
            {"key": "last_sync_status"},
            {"$set": {"value": "running", "updated_at": datetime.now(timezone.utc).isoformat()}},
            upsert=True
        )
        
        # Get last synced invoice number
        setting = await db_instance.settings.find_one({"key": "last_synced_invoice"}, {"_id": 0})
        last_invoice_number = int(setting.get("value", 160110)) if setting else 160110
        
        synced_count = 0
        failed_count = 0
        max_failures = 10
        
        # Start from next invoice
        current_invoice_number = last_invoice_number + 1
        
        while failed_count < max_failures:
            # Get invoice from Rewaa
            invoice_data = await rewaa_service.get_invoice_by_number(current_invoice_number)
            
            if not invoice_data:
                failed_count += 1
                print(f"Invoice {current_invoice_number} not found. Failed attempts: {failed_count}/{max_failures}")
                
                # Update last_synced_invoice even for missing invoices
                # This prevents getting stuck on non-existent invoice numbers
                await db_instance.settings.update_one(
                    {"key": "last_synced_invoice"},
                    {"$set": {"value": str(current_invoice_number), "updated_at": datetime.now(timezone.utc).isoformat()}},
                    upsert=True
                )
                
                current_invoice_number += 1
                continue
            
            # Reset failed count on success
            failed_count = 0
            
            # Extract invoice data - search in multiple places
            customer_phone = None
            
            # 1. Check for mobileNumber at root level
            if invoice_data.get('mobileNumber'):
                customer_phone = invoice_data.get('mobileNumber')
                print(f"   Found in: root.mobileNumber")
            
            # 2. Check Customer object
            elif invoice_data.get('Customer'):
                customer_data = invoice_data.get('Customer')
                customer_phone = customer_data.get('mobileNumber') or customer_data.get('mobile') or customer_data.get('phone')
                if customer_phone:
                    print(f"   Found in: Customer.{[k for k,v in customer_data.items() if v == customer_phone][0]}")
            
            # 3. Check customer (lowercase)
            elif invoice_data.get('customer'):
                customer_data = invoice_data.get('customer')
                customer_phone = customer_data.get('mobileNumber') or customer_data.get('mobile') or customer_data.get('phone')
                if customer_phone:
                    print(f"   Found in: customer.{[k for k,v in customer_data.items() if v == customer_phone][0]}")
            
            # 4. Check PayableInvoice
            if not customer_phone and invoice_data.get('PayableInvoice'):
                payable = invoice_data.get('PayableInvoice')
                customer_phone = payable.get('mobileNumber') or payable.get('customerMobile') or payable.get('customerPhone')
                if customer_phone:
                    print(f"   Found in: PayableInvoice")
            
            # 5. Check payments array
            if not customer_phone:
                payments = invoice_data.get('payments', [])
                for payment in payments:
                    customer_phone = payment.get('mobileNumber') or payment.get('customerMobile') or payment.get('customerPhone')
                    if customer_phone:
                        print(f"   Found in: payments[].{[k for k,v in payment.items() if v == customer_phone][0]}")
                        break
            
            total_amount = float(invoice_data.get('totalTaxInclusive') or invoice_data.get('total', 0))
            invoice_date_str = invoice_data.get('completeDate') or invoice_data.get('date')
            is_return_invoice = invoice_data.get('isReturnInvoice', False)
            
            print(f"\n📋 Invoice {current_invoice_number}:")
            print(f"   Total: {total_amount} SAR")
            print(f"   Is Return: {is_return_invoice}")
            print(f"   Customer phone: {customer_phone}")
            
            if not customer_phone:
                print(f"   ❌ No customer phone found, skipping")
                print(f"   Available fields: {list(invoice_data.keys())[:10]}...")
                
                # Update last_synced_invoice to skip this invoice in future
                await db_instance.settings.update_one(
                    {"key": "last_synced_invoice"},
                    {"$set": {"value": str(current_invoice_number), "updated_at": datetime.now(timezone.utc).isoformat()}},
                    upsert=True
                )
                
                current_invoice_number += 1
                continue
            
            # Format phone to international
            international_phone = format_phone_for_twilio(customer_phone)
            print(f"   Converted to: {international_phone}")
            
            # Find customer by phone - if not found, create from Rewaa
            customer = await db_instance.customers.find_one({"phone": international_phone}, {"_id": 0})
            
            if not customer:
                print(f"   ⚠️  Customer {international_phone} not in loyalty program")
                print(f"   → Fetching customer from Rewaa...")
                
                # Get customer from Rewaa
                rewaa_customer_data = await rewaa_service.get_customer_by_mobile(international_phone)
                
                if rewaa_customer_data:
                    # Create customer in loyalty program
                    from models import Customer
                    
                    # Handle email - may be None or empty from Rewaa
                    customer_email = rewaa_customer_data.get('email')
                    if not customer_email:
                        customer_email = None  # Keep as None if not provided
                    
                    # Handle rewaa_customer_id - convert to string if it's an int
                    rewaa_id = rewaa_customer_data.get('id')
                    if rewaa_id is not None:
                        rewaa_id = str(rewaa_id)
                    
                    new_customer = Customer(
                        name=rewaa_customer_data.get('name') or 'عميل',
                        email=customer_email,
                        phone=international_phone,
                        rewaa_customer_id=rewaa_id
                    )
                    
                    customer_doc = new_customer.model_dump()
                    customer_doc['created_at'] = customer_doc['created_at'].isoformat()
                    customer_doc['updated_at'] = customer_doc['updated_at'].isoformat()
                    
                    await db_instance.customers.insert_one(customer_doc)
                    print(f"   ✓ Customer auto-registered: {new_customer.name}")
                    
                    # Fetch the newly created customer
                    customer = await db_instance.customers.find_one({"phone": international_phone}, {"_id": 0})
                else:
                    print(f"   ❌ Customer not found in Rewaa either, skipping")
                    current_invoice_number += 1
                    continue
            
            print(f"   ✓ Customer found: {customer['name']}")
            
            # Calculate points
            setting = await db_instance.settings.find_one({"key": "points_multiplier"}, {"_id": 0})
            multiplier = float(setting.get("value", 10)) if setting else 10
            points_amount = total_amount / multiplier
            
            # For return invoices, points should be negative (deducted)
            if is_return_invoice:
                points_earned = -abs(points_amount)  # Ensure negative
                transaction_type = "returned"
                description_ar = f"رجيع فاتورة رقم {current_invoice_number}"
                description_en = f"Return Invoice #{current_invoice_number}"
                print(f"   🔴 Return invoice - Points to deduct: {abs(points_earned):.2f}")
            else:
                points_earned = abs(points_amount)  # Ensure positive
                transaction_type = "earned"
                description_ar = f"فاتورة رقم {current_invoice_number}"
                description_en = f"Invoice #{current_invoice_number}"
                print(f"   Points to earn: {points_earned:.2f}")
            
            # Check if invoice already exists
            existing_invoice = await db_instance.invoices.find_one({"invoice_number": current_invoice_number})
            if existing_invoice:
                print(f"   ⚠️  Already synced, skipping")
                
                # Still update last_synced_invoice to move forward
                await db_instance.settings.update_one(
                    {"key": "last_synced_invoice"},
                    {"$set": {"value": str(current_invoice_number), "updated_at": datetime.now(timezone.utc).isoformat()}},
                    upsert=True
                )
                
                current_invoice_number += 1
                continue
            
            # Save invoice
            invoice_doc = {
                "id": str(uuid.uuid4()),
                "invoice_number": current_invoice_number,
                "customer_id": customer["id"],
                "customer_phone": international_phone,
                "total_amount": total_amount,
                "points_earned": points_earned,
                "is_return": is_return_invoice,
                "payment_method": invoice_data.get('paymentMethod'),
                "invoice_date": invoice_date_str or datetime.now(timezone.utc).isoformat(),
                "synced_at": datetime.now(timezone.utc).isoformat()
            }
            
            await db_instance.invoices.insert_one(invoice_doc)
            
            # Create points transaction
            transaction_doc = {
                "id": str(uuid.uuid4()),
                "customer_id": customer["id"],
                "transaction_type": transaction_type,
                "points": points_earned,
                "description": f"{description_ar} | {description_en}",
                "invoice_id": invoice_doc["id"],
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
            
            # Only add expires_at for earned points (not for returns)
            if not is_return_invoice:
                transaction_doc["expires_at"] = (datetime.now(timezone.utc) + timedelta(days=365)).isoformat()
            
            await db_instance.points_transactions.insert_one(transaction_doc)
            
            # Update customer points
            await db_instance.customers.update_one(
                {"id": customer["id"]},
                {
                    "$inc": {
                        "total_points": points_earned,
                        "active_points": points_earned
                    },
                    "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
                }
            )
            
            # Update last synced invoice after successful save
            await db_instance.settings.update_one(
                {"key": "last_synced_invoice"},
                {"$set": {"value": str(current_invoice_number), "updated_at": datetime.now(timezone.utc).isoformat()}},
                upsert=True
            )
            
            if is_return_invoice:
                print(f"🔴 Return Invoice {current_invoice_number} synced: {total_amount} SAR = {points_earned:.2f} points deducted from {customer['name']}")
            else:
                print(f"✓ Invoice {current_invoice_number} synced: {total_amount} SAR = {points_earned:.2f} points for {customer['name']}")
            synced_count += 1
            
            current_invoice_number += 1
            
            # Small delay to avoid overwhelming the API
            await asyncio.sleep(0.5)
        
        # Update sync information
        await db_instance.settings.update_one(
            {"key": "last_sync_time"},
            {"$set": {"value": datetime.now(timezone.utc).isoformat(), "updated_at": datetime.now(timezone.utc).isoformat()}},
            upsert=True
        )
        await db_instance.settings.update_one(
            {"key": "last_sync_count"},
            {"$set": {"value": str(synced_count), "updated_at": datetime.now(timezone.utc).isoformat()}},
            upsert=True
        )
        await db_instance.settings.update_one(
            {"key": "last_sync_status"},
            {"$set": {"value": "success", "updated_at": datetime.now(timezone.utc).isoformat()}},
            upsert=True
        )
        await db_instance.settings.update_one(
            {"key": "last_sync_error"},
            {"$set": {"value": "", "updated_at": datetime.now(timezone.utc).isoformat()}},
            upsert=True
        )
        
        print(f"[{datetime.now()}] Invoice sync completed. Synced: {synced_count}, Last invoice: {current_invoice_number - 1}")
        
        return {
            "status": "success",
            "synced_count": synced_count,
            "last_invoice": current_invoice_number - 1
        }
    
    except Exception as e:
        error_message = str(e)
        print(f"[{datetime.now()}] Error during invoice sync: {error_message}")
        
        # Update sync status to failed
        await db_instance.settings.update_one(
            {"key": "last_sync_status"},
            {"$set": {"value": "failed", "updated_at": datetime.now(timezone.utc).isoformat()}},
            upsert=True
        )
        await db_instance.settings.update_one(
            {"key": "last_sync_error"},
            {"$set": {"value": error_message[:500], "updated_at": datetime.now(timezone.utc).isoformat()}},
            upsert=True
        )
        
        return {
            "status": "failed",
            "error": error_message,
            "synced_count": 0
        }

async def sync_invoices():
    """Wrapper for sync_invoices_once using global db"""
    return await sync_invoices_once(db)

async def check_expired_points():
    """Check and expire points daily"""
    print(f"[{datetime.now()}] Checking expired points...")
    
    try:
        # Find all expired transactions
        now = datetime.now(timezone.utc).isoformat()
        expired_transactions = await db.points_transactions.find({
            "transaction_type": "earned",
            "expires_at": {"$lte": now}
        }, {"_id": 0}).to_list(1000)
        
        expired_count = 0
        
        for trans in expired_transactions:
            customer_id = trans["customer_id"]
            points = trans["points"]
            
            # Update customer expired points
            await db.customers.update_one(
                {"id": customer_id},
                {
                    "$inc": {
                        "active_points": -points,
                        "expired_points": points
                    },
                    "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
                }
            )
            
            # Create expiry transaction
            expiry_doc = {
                "id": str(uuid.uuid4()),
                "customer_id": customer_id,
                "transaction_type": "expired",
                "points": -points,
                "description": "نقاط منتهية الصلاحية | Expired points",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            
            await db.points_transactions.insert_one(expiry_doc)
            
            # Mark original transaction as processed
            await db.points_transactions.update_one(
                {"id": trans["id"]},
                {"$set": {"transaction_type": "earned_expired"}}
            )
            
            expired_count += 1
        
        print(f"[{datetime.now()}] Expired points check completed. Expired: {expired_count} transactions")
        return expired_count
    
    except Exception as e:
        print(f"[{datetime.now()}] Error checking expired points: {e}")
        return 0

async def run_jobs():
    """Run all cron jobs"""
    print(f"[{datetime.now()}] Starting cron jobs...")
    
    # Initial token refresh
    await refresh_rewaa_token()
    
    while True:
        try:
            # Run invoice sync every 15 minutes
            await sync_invoices()
            
            # Wait 15 minutes
            await asyncio.sleep(15 * 60)
            
        except Exception as e:
            print(f"[{datetime.now()}] Error in cron jobs: {e}")
            await asyncio.sleep(60)  # Wait 1 minute before retrying

if __name__ == "__main__":
    asyncio.run(run_jobs())
