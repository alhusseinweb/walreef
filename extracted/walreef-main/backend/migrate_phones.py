"""
Script to migrate phone numbers from Saudi format (05...) to international format (+966...)
"""
from pymongo import MongoClient
import os
import sys

# Add parent directory to path
sys.path.append('/app/backend')
from utils import format_phone_for_twilio

def migrate_phone_numbers():
    # Connect to MongoDB
    mongo_url = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
    client = MongoClient(mongo_url)
    db = client['alreef_loyalty']
    
    print("🔄 بدء تحديث أرقام الجوال...")
    print("=" * 50)
    
    # Migrate customers
    customers = list(db.customers.find({}))
    updated_customers = 0
    
    for customer in customers:
        old_phone = customer.get('phone', '')
        new_phone = format_phone_for_twilio(old_phone)
        
        if old_phone != new_phone:
            print(f"\n✓ تحديث: {customer.get('name')}")
            print(f"  من: {old_phone}")
            print(f"  إلى: {new_phone}")
            
            db.customers.update_one(
                {"id": customer['id']},
                {"$set": {"phone": new_phone}}
            )
            updated_customers += 1
        else:
            print(f"✓ {customer.get('name')}: {old_phone} (لا يحتاج تحديث)")
    
    print("\n" + "=" * 50)
    print(f"✅ تم تحديث {updated_customers} من {len(customers)} حساب")
    
    # Migrate invoices
    invoices = list(db.invoices.find({}))
    updated_invoices = 0
    
    if invoices:
        print("\n🔄 تحديث أرقام الفواتير...")
        for invoice in invoices:
            old_phone = invoice.get('customer_phone', '')
            new_phone = format_phone_for_twilio(old_phone)
            
            if old_phone != new_phone:
                db.invoices.update_one(
                    {"id": invoice['id']},
                    {"$set": {"customer_phone": new_phone}}
                )
                updated_invoices += 1
        
        print(f"✅ تم تحديث {updated_invoices} من {len(invoices)} فاتورة")
    
    print("\n✨ اكتمل التحديث بنجاح!")
    client.close()

if __name__ == "__main__":
    migrate_phone_numbers()
