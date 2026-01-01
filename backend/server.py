from fastapi import FastAPI, APIRouter, HTTPException, Depends, BackgroundTasks, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List, Optional
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import uuid
import secrets

from models import *
from services import send_otp_sms, send_welcome_email, send_notification_email, generate_otp_code, verify_otp_twilio
from rewaa import rewaa_service
from utils import format_phone_for_twilio, format_phone_for_display
from rate_limiter import rate_limiter
from audit_log import AuditLogger, AuditActions
from email_service import send_sync_failure_notification, send_test_email, get_notification_email
from security_utils import (
    validate_password_strength, 
    validate_points_amount, 
    sanitize_input,
    generate_strong_secret
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
security = HTTPBearer()
JWT_SECRET = os.getenv('JWT_SECRET')

# Validate JWT_SECRET on startup
if not JWT_SECRET or JWT_SECRET == 'your_super_secret_jwt_key_change_in_production':
    raise ValueError("CRITICAL: JWT_SECRET must be set to a strong random value in .env file!")

if len(JWT_SECRET) < 32:
    raise ValueError("CRITICAL: JWT_SECRET must be at least 32 characters long!")

JWT_ALGORITHM = 'HS256'
MAX_POINTS_PER_OPERATION = float(os.getenv('MAX_POINTS_PER_OPERATION', 10000))

# Create the main app
app = FastAPI(title="Al-Reef Loyalty API")
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Helper Functions
def create_jwt_token(data: dict, expires_delta: timedelta = timedelta(hours=2)) -> str:
    """Create JWT token with 2-hour expiration (was 30 days - security fix)"""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_jwt_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_customer(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    payload = verify_jwt_token(credentials.credentials)
    if payload.get("type") != "customer":
        raise HTTPException(status_code=403, detail="Not authorized")
    return payload

async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    payload = verify_jwt_token(credentials.credentials)
    if payload.get("type") not in ["admin", "staff"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    return payload

async def get_current_admin_only(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Only allow admin role, not staff"""
    payload = verify_jwt_token(credentials.credentials)
    if payload.get("type") != "admin" or payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return payload

async def get_staff_or_admin(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Allow both admin and staff roles"""
    payload = verify_jwt_token(credentials.credentials)
    if payload.get("type") not in ["admin", "staff"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    return payload

async def calculate_points(amount: float) -> float:
    """Calculate points based on amount. Default: 10 SAR = 1 point"""
    setting = await db.settings.find_one({"key": "points_multiplier"}, {"_id": 0})
    multiplier = float(setting.get("value", 10)) if setting else 10
    return amount / multiplier

# API Routes

@api_router.get("/")
async def root():
    return {"message": "Al-Reef Loyalty API", "version": "1.0"}

# ================ Customer Authentication ================

@api_router.post("/auth/customer/send-otp")
async def send_customer_otp(request: Request, otp_request: SendOTPRequest):
    """Send OTP to customer phone - Rate limited"""
    # Rate limiting check
    await rate_limiter.check_rate_limit(request)
    
    try:
        international_phone = format_phone_for_twilio(otp_request.phone)
        
        # Check if customer exists
        customer = await db.customers.find_one({"phone": international_phone}, {"_id": 0})
        
        if not customer:
            # Auto-register new customer
            new_customer = Customer(
                name="عميل جديد",  # Temporary name
                phone=international_phone,
                email=None
            )
            customer_dict = new_customer.model_dump()
            customer_dict['created_at'] = customer_dict['created_at'].isoformat()
            customer_dict['updated_at'] = customer_dict['updated_at'].isoformat()
            await db.customers.insert_one(customer_dict)
            
            # Audit log
            await AuditLogger.log(
                db=db,
                action=AuditActions.CREATE_CUSTOMER,
                actor_id="system",
                actor_type="system",
                actor_name="Auto Registration",
                target_id=new_customer.id,
                target_type="customer",
                details={"phone": format_phone_for_display(international_phone), "source": "otp_login"},
                ip_address=rate_limiter._get_client_ip(request)
            )
        
        # Send OTP
        code = generate_otp_code()
        success = send_otp_sms(international_phone, code)
        
        if not success:
            # Audit log failed attempt
            await AuditLogger.log(
                db=db,
                action=AuditActions.OTP_FAILED,
                actor_id="system",
                actor_type="system",
                actor_name="SMS Service",
                details={"phone": format_phone_for_display(international_phone), "reason": "sms_send_failed"},
                ip_address=rate_limiter._get_client_ip(request),
                severity="warning"
            )
            raise HTTPException(status_code=500, detail="فشل إرسال رمز التحقق | Failed to send OTP")
        
        # Audit log
        await AuditLogger.log(
            db=db,
            action=AuditActions.OTP_SENT,
            actor_id="system",
            actor_type="system",
            actor_name="SMS Service",
            target_type="customer",
            details={"phone": format_phone_for_display(international_phone)},
            ip_address=rate_limiter._get_client_ip(request)
        )
        
        return {"message": "تم إرسال رمز التحقق | OTP sent successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending OTP: {str(e)[:100]}")  # Limit error message length
        raise HTTPException(status_code=500, detail="حدث خطأ، حاول مرة أخرى | An error occurred")

@api_router.post("/auth/customer/verify-otp", response_model=TokenResponse)
async def verify_customer_otp(request: Request, verify_request: VerifyOTPRequest):
    """Verify OTP - Rate limited"""
    # Rate limiting check
    await rate_limiter.check_rate_limit(request)
    
    try:
        from twilio.rest import Client
        
        # Convert to international format
        international_phone = format_phone_for_twilio(verify_request.phone)
        
        account_sid = os.getenv('TWILIO_ACCOUNT_SID')
        auth_token = os.getenv('TWILIO_AUTH_TOKEN')
        verify_service = os.getenv('TWILIO_VERIFY_SERVICE')
        
        if account_sid and auth_token and verify_service:
            # Verify with Twilio
            client = Client(account_sid, auth_token)
            verification_check = client.verify.v2.services(verify_service).verification_checks.create(
                to=international_phone,
                code=verify_request.code
            )
            
            if verification_check.status != 'approved':
                # Audit log failed attempt
                await AuditLogger.log(
                    db=db,
                    action=AuditActions.OTP_FAILED,
                    actor_id="unknown",
                    actor_type="customer",
                    actor_name="Unknown Customer",
                    details={"phone": format_phone_for_display(international_phone), "reason": "invalid_otp"},
                    ip_address=rate_limiter._get_client_ip(request),
                    severity="warning"
                )
                raise HTTPException(status_code=400, detail="رمز التحقق غير صحيح أو منتهي الصلاحية | Invalid or expired OTP code")
        
        # Find customer with international format
        customer = await db.customers.find_one({"phone": international_phone}, {"_id": 0})
        
        if not customer:
            raise HTTPException(status_code=404, detail="العميل غير موجود | Customer not found")
        
        # Check if account is suspended
        if not customer.get("is_active", True):
            suspension_reason = customer.get("suspension_reason", "لم يتم تحديد السبب")
            raise HTTPException(
                status_code=403, 
                detail=f"ACCOUNT_SUSPENDED|{suspension_reason}"
            )
        
        # Generate JWT
        token = create_jwt_token({
            "customer_id": customer["id"],
            "phone": customer["phone"],
            "type": "customer"
        })
        
        return TokenResponse(access_token=token)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error verifying OTP: {e}")
        raise HTTPException(status_code=500, detail="Failed to verify OTP")

@api_router.post("/auth/customer/register", response_model=TokenResponse)
async def register_customer(customer: CustomerCreate, background_tasks: BackgroundTasks):
    """Register new customer"""
    try:
        # Convert to international format
        international_phone = format_phone_for_twilio(customer.phone)
        
        # Check if customer exists
        existing = await db.customers.find_one({"phone": international_phone}, {"_id": 0})
        if existing:
            raise HTTPException(status_code=400, detail="Customer already registered")
        
        # Try to create customer in Rewaa (note: currently deprecated API)
        rewaa_customer_id = None
        logger.info(f"Attempting to create customer in Rewaa: {customer.name} ({international_phone})")
        
        try:
            rewaa_customer = await rewaa_service.create_customer(
                name=customer.name,
                mobile=international_phone,
                email=customer.email
            )
            if rewaa_customer:
                rewaa_customer_id = rewaa_customer.get("id")
                logger.info(f"✓ Customer created in Rewaa. ID: {rewaa_customer_id}")
            else:
                logger.warning(f"Could not create customer in Rewaa (API may be deprecated). Proceeding with loyalty registration only.")
        except Exception as e:
            logger.warning(f"Rewaa customer creation failed: {e}. Proceeding with loyalty registration only.")
        
        # Create customer in our DB
        customer_doc = Customer(
            name=customer.name,
            email=customer.email,
            phone=international_phone,
            rewaa_customer_id=rewaa_customer_id
        )
        
        doc = customer_doc.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        doc['updated_at'] = doc['updated_at'].isoformat()
        
        await db.customers.insert_one(doc)
        logger.info(f"✓ Customer registered in loyalty program: {customer.name}")
        
        # Send welcome email
        background_tasks.add_task(send_welcome_email, customer.email, customer.name)
        
        # Generate JWT
        token = create_jwt_token({
            "customer_id": customer_doc.id,
            "phone": customer_doc.phone,
            "type": "customer"
        })
        
        return TokenResponse(access_token=token)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error registering customer: {e}")
        raise HTTPException(
            status_code=500, 
            detail="حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى | Registration error. Please try again"
        )

# ================ Customer Profile ================

@api_router.get("/customer/profile")
async def get_customer_profile(current_customer: dict = Depends(get_current_customer)):
    """Get current customer profile"""
    try:
        customer = await db.customers.find_one({"id": current_customer["customer_id"]}, {"_id": 0})
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        # Calculate expiring points (< 30 days)
        thirty_days = datetime.now(timezone.utc) + timedelta(days=30)
        expiring_points_cursor = db.points_transactions.find({
            "customer_id": customer["id"],
            "transaction_type": "earned",
            "expires_at": {"$lte": thirty_days.isoformat(), "$gte": datetime.now(timezone.utc).isoformat()}
        }, {"_id": 0})
        
        expiring_points = 0
        async for trans in expiring_points_cursor:
            expiring_points += trans.get("points", 0)
        
        customer["expiring_points"] = expiring_points
        
        # Calculate points value in SAR (every 10 points = 1 SAR)
        reward_setting = await db.settings.find_one({"key": "points_reward_multiplier"}, {"_id": 0})
        reward_multiplier = float(reward_setting.get("value", 10)) if reward_setting else 10
        customer["points_value_sar"] = customer.get("active_points", 0) / reward_multiplier
        
        # Convert phone to display format (05xxxxxxxx)
        customer["phone"] = format_phone_for_display(customer.get("phone", ""))
        
        return customer
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting customer profile: {e}")
        raise HTTPException(status_code=500, detail="Failed to get profile")

@api_router.get("/customer/transactions")
async def get_customer_transactions(
    current_customer: dict = Depends(get_current_customer),
    limit: int = 50,
    offset: int = 0
):
    """Get customer points transactions"""
    try:
        transactions = await db.points_transactions.find(
            {"customer_id": current_customer["customer_id"]},
            {"_id": 0}
        ).sort("created_at", -1).skip(offset).limit(limit).to_list(limit)
        
        return {"transactions": transactions, "count": len(transactions)}
    except Exception as e:
        logger.error(f"Error getting transactions: {e}")
        raise HTTPException(status_code=500, detail="Failed to get transactions")

@api_router.get("/customer/invoices")
async def get_customer_invoices(
    current_customer: dict = Depends(get_current_customer),
    limit: int = 50,
    offset: int = 0
):
    """Get customer invoices"""
    try:
        customer = await db.customers.find_one({"id": current_customer["customer_id"]}, {"_id": 0})
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        invoices = await db.invoices.find(
            {"customer_phone": customer["phone"]},
            {"_id": 0}
        ).sort("invoice_date", -1).skip(offset).limit(limit).to_list(limit)
        
        return {"invoices": invoices, "count": len(invoices)}
    except Exception as e:
        logger.error(f"Error getting invoices: {e}")
        raise HTTPException(status_code=500, detail="Failed to get invoices")

# ================ Admin Authentication ================

# Constants for trusted devices
TRUSTED_DEVICE_DAYS = 90  # Device trust duration

@api_router.post("/auth/check-trusted-device")
async def check_trusted_device(request: CheckTrustedDeviceRequest):
    """Check if device is trusted and can skip OTP"""
    try:
        international_phone = format_phone_for_twilio(request.phone)
        
        # Check if this phone belongs to an admin/staff
        admin = await db.admins.find_one({"phone": international_phone}, {"_id": 0})
        
        if not admin:
            return {"trusted": False, "reason": "not_admin"}
        
        # Check for trusted device
        trusted_device = await db.trusted_devices.find_one({
            "phone": international_phone,
            "device_token": request.device_token,
            "expires_at": {"$gt": datetime.now(timezone.utc).isoformat()}
        }, {"_id": 0})
        
        if trusted_device:
            # Update last used
            await db.trusted_devices.update_one(
                {"id": trusted_device["id"]},
                {"$set": {"last_used_at": datetime.now(timezone.utc).isoformat()}}
            )
            
            # Check if also customer
            customer = await db.customers.find_one({"phone": international_phone}, {"_id": 0})
            
            return {
                "trusted": True,
                "is_admin": True,
                "is_also_customer": customer is not None,
                "role": admin.get("role", "admin"),
                "name": admin.get("name", ""),
                "customer_name": customer.get("name", "") if customer else ""
            }
        
        return {"trusted": False, "reason": "device_not_trusted"}
    except Exception as e:
        logger.error(f"Error checking trusted device: {e}")
        return {"trusted": False, "reason": "error"}

@api_router.post("/auth/login-trusted-device", response_model=TokenResponse)
async def login_with_trusted_device(request: CheckTrustedDeviceRequest):
    """Login using trusted device without OTP"""
    try:
        international_phone = format_phone_for_twilio(request.phone)
        
        # Check if this phone belongs to an admin/staff
        admin = await db.admins.find_one({"phone": international_phone}, {"_id": 0})
        
        if not admin:
            raise HTTPException(status_code=401, detail="غير مصرح | Unauthorized")
        
        # Verify trusted device
        trusted_device = await db.trusted_devices.find_one({
            "phone": international_phone,
            "device_token": request.device_token,
            "expires_at": {"$gt": datetime.now(timezone.utc).isoformat()}
        }, {"_id": 0})
        
        if not trusted_device:
            raise HTTPException(status_code=401, detail="الجهاز غير موثوق | Device not trusted")
        
        # Update last used
        await db.trusted_devices.update_one(
            {"id": trusted_device["id"]},
            {"$set": {"last_used_at": datetime.now(timezone.utc).isoformat()}}
        )
        
        # Get role
        role = admin.get("role", "admin")
        
        # Generate JWT with role
        token = create_jwt_token({
            "admin_id": admin["id"],
            "phone": admin["phone"],
            "name": admin.get("name", ""),
            "role": role,
            "type": "admin" if role == "admin" else "staff"
        })
        
        logger.info(f"Admin/Staff logged in via trusted device: {admin.get('name')} ({role})")
        return TokenResponse(access_token=token)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error login with trusted device: {e}")
        raise HTTPException(status_code=500, detail="Failed to login")

@api_router.post("/auth/check-admin-phone")
async def check_admin_phone(request: SendOTPRequest):
    """Check if phone belongs to admin/staff and send OTP"""
    try:
        international_phone = format_phone_for_twilio(request.phone)
        
        # Check if this phone belongs to an admin/staff
        admin = await db.admins.find_one({"phone": international_phone}, {"_id": 0})
        
        # Check if this phone also belongs to a customer
        customer = await db.customers.find_one({"phone": international_phone}, {"_id": 0})
        
        if admin:
            # Send OTP via Twilio
            code = generate_otp_code()
            success = send_otp_sms(international_phone, code)
            
            if not success:
                raise HTTPException(status_code=500, detail="فشل إرسال رمز التحقق | Failed to send OTP")
            
            return {
                "is_admin": True,
                "is_also_customer": customer is not None,
                "role": admin.get("role", "admin"),
                "name": admin.get("name", ""),
                "customer_name": customer.get("name", "") if customer else "",
                "message": "تم إرسال رمز التحقق | OTP sent"
            }
        
        return {"is_admin": False}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error checking admin phone: {e}")
        raise HTTPException(status_code=500, detail="Failed to check phone")

@api_router.post("/auth/admin/verify-otp", response_model=TokenResponse)
async def admin_verify_otp(request: VerifyOTPRequest):
    """Verify OTP for admin/staff login"""
    try:
        international_phone = format_phone_for_twilio(request.phone)
        
        # Check if this phone belongs to an admin/staff
        admin = await db.admins.find_one({"phone": international_phone}, {"_id": 0})
        
        if not admin:
            raise HTTPException(status_code=401, detail="غير مصرح | Unauthorized")
        
        # Verify OTP using Twilio
        is_valid = verify_otp_twilio(international_phone, request.code)
        
        if not is_valid:
            raise HTTPException(status_code=400, detail="رمز التحقق غير صحيح | Invalid OTP code")
        
        # Get role
        role = admin.get("role", "admin")
        
        # Generate JWT with role
        token = create_jwt_token({
            "admin_id": admin["id"],
            "phone": admin["phone"],
            "name": admin.get("name", ""),
            "role": role,
            "type": "admin" if role == "admin" else "staff"
        })
        
        # Handle device trust if requested
        device_token = None
        if request.trust_device:
            # Generate a secure device token
            device_token = secrets.token_urlsafe(48)
            
            # Calculate expiry date (90 days from now)
            expires_at = datetime.now(timezone.utc) + timedelta(days=TRUSTED_DEVICE_DAYS)
            
            # Store trusted device
            trusted_device_data = {
                "id": str(uuid.uuid4()),
                "phone": international_phone,
                "device_token": device_token,
                "device_info": None,  # Could add user agent info here
                "created_at": datetime.now(timezone.utc).isoformat(),
                "expires_at": expires_at.isoformat(),
                "last_used_at": datetime.now(timezone.utc).isoformat()
            }
            
            await db.trusted_devices.insert_one(trusted_device_data)
            logger.info(f"Trusted device added for: {admin.get('name')} ({role})")
        
        logger.info(f"Admin/Staff logged in via OTP: {admin.get('name')} ({role})")
        return TokenResponse(access_token=token, device_token=device_token)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error admin OTP login: {e}")
        raise HTTPException(status_code=500, detail="Failed to login")

@api_router.post("/auth/admin/login", response_model=TokenResponse)
async def admin_login(credentials: AdminLogin):
    """Admin/Staff login (legacy - email/password)"""
    try:
        admin = None
        
        # Try login by email if provided
        if credentials.email:
            admin = await db.admins.find_one({"email": credentials.email}, {"_id": 0})
        
        if not admin:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Verify password if hashed_password exists
        if admin.get("hashed_password") and credentials.password:
            if not bcrypt.checkpw(credentials.password.encode('utf-8'), admin["hashed_password"].encode('utf-8')):
                raise HTTPException(status_code=401, detail="Invalid credentials")
        else:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Get role (default to admin for backwards compatibility)
        role = admin.get("role", "admin")
        
        # Generate JWT with role
        token = create_jwt_token({
            "admin_id": admin["id"],
            "email": admin.get("email", ""),
            "phone": admin.get("phone", ""),
            "name": admin.get("name", ""),
            "role": role,
            "type": "admin" if role == "admin" else "staff"
        })
        
        return TokenResponse(access_token=token)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error admin login: {e}")
        raise HTTPException(status_code=500, detail="Failed to login")

# ================ Admin - Dashboard Stats ================

@api_router.get("/admin/stats")
async def get_admin_stats(current_admin: dict = Depends(get_current_admin)):
    """Get dashboard statistics"""
    try:
        # Total customers
        total_customers = await db.customers.count_documents({})
        
        # Total active points
        pipeline = [
            {"$group": {"_id": None, "total_active": {"$sum": "$active_points"}}}
        ]
        result = await db.customers.aggregate(pipeline).to_list(1)
        total_active_points = result[0]["total_active"] if result else 0
        
        # Total expired points
        pipeline = [
            {"$group": {"_id": None, "total_expired": {"$sum": "$expired_points"}}}
        ]
        result = await db.customers.aggregate(pipeline).to_list(1)
        total_expired_points = result[0]["total_expired"] if result else 0
        
        # Total points value in SAR
        total_points_value = total_active_points
        
        # New customers this month
        first_day_month = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        new_customers_month = await db.customers.count_documents({
            "created_at": {"$gte": first_day_month.isoformat()}
        })
        
        # Total invoices
        total_invoices = await db.invoices.count_documents({})
        
        return {
            "total_customers": total_customers,
            "new_customers_month": new_customers_month,
            "total_active_points": round(total_active_points, 2),
            "total_expired_points": round(total_expired_points, 2),
            "total_points_value_sar": round(total_points_value, 2),
            "total_invoices": total_invoices
        }
    except Exception as e:
        logger.error(f"Error getting stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to get stats")

@api_router.get("/admin/recent-transactions")
async def get_recent_transactions(current_admin: dict = Depends(get_current_admin), limit: int = 10):
    """Get recent transactions across all customers"""
    try:
        # Get recent transactions
        transactions = await db.points_transactions.find(
            {},
            {"_id": 0}
        ).sort("created_at", -1).limit(limit).to_list(limit)
        
        # Enrich with customer info
        enriched_transactions = []
        for trans in transactions:
            customer = await db.customers.find_one(
                {"id": trans.get("customer_id")}, 
                {"_id": 0, "name": 1, "phone": 1}
            )
            trans["customer_name"] = customer.get("name", "غير معروف") if customer else "غير معروف"
            trans["customer_phone"] = format_phone_for_display(customer.get("phone", "")) if customer else ""
            enriched_transactions.append(trans)
        
        return {"transactions": enriched_transactions}
    except Exception as e:
        logger.error(f"Error getting recent transactions: {e}")
        raise HTTPException(status_code=500, detail="Failed to get recent transactions")

# ================ Admin - Customer Management ================

@api_router.get("/admin/customers")
async def get_all_customers(
    current_admin: dict = Depends(get_current_admin),
    search: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
):
    """Get all customers with search"""
    try:
        query = {}
        if search:
            query = {
                "$or": [
                    {"name": {"$regex": search, "$options": "i"}},
                    {"phone": {"$regex": search, "$options": "i"}},
                    {"email": {"$regex": search, "$options": "i"}}
                ]
            }
        
        customers = await db.customers.find(query, {"_id": 0}).sort("created_at", -1).skip(offset).limit(limit).to_list(limit)
        total = await db.customers.count_documents(query)
        
        return {"customers": customers, "total": total}
    except Exception as e:
        logger.error(f"Error getting customers: {e}")
        raise HTTPException(status_code=500, detail="Failed to get customers")

@api_router.get("/admin/customers/{customer_id}")
async def get_customer_details(customer_id: str, current_admin: dict = Depends(get_current_admin)):
    """Get customer details by ID"""
    try:
        customer = await db.customers.find_one({"id": customer_id}, {"_id": 0})
        if not customer:
            raise HTTPException(status_code=404, detail="العميل غير موجود | Customer not found")
        return customer
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting customer: {e}")
        raise HTTPException(status_code=500, detail="Failed to get customer")

@api_router.put("/admin/customers/{customer_id}")
async def update_customer(customer_id: str, update_data: CustomerUpdate, current_admin: dict = Depends(get_current_admin)):
    """Update customer information"""
    try:
        customer = await db.customers.find_one({"id": customer_id})
        if not customer:
            raise HTTPException(status_code=404, detail="العميل غير موجود | Customer not found")
        
        update_fields = {"updated_at": datetime.now(timezone.utc).isoformat()}
        
        if update_data.name:
            update_fields["name"] = update_data.name
        
        if update_data.phone:
            new_phone = format_phone_for_twilio(update_data.phone)
            # Check if phone already exists for another customer
            existing = await db.customers.find_one({"phone": new_phone, "id": {"$ne": customer_id}})
            if existing:
                raise HTTPException(status_code=400, detail="رقم الجوال مستخدم لعميل آخر | Phone already used by another customer")
            update_fields["phone"] = new_phone
        
        if update_data.email is not None:
            update_fields["email"] = update_data.email if update_data.email else None
        
        await db.customers.update_one({"id": customer_id}, {"$set": update_fields})
        logger.info(f"Customer {customer_id} updated by {current_admin.get('name', current_admin.get('email', 'admin'))}")
        
        return {"message": "تم تحديث بيانات العميل | Customer updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating customer: {e}")
        raise HTTPException(status_code=500, detail="Failed to update customer")

@api_router.delete("/admin/customers/{customer_id}")
async def delete_customer(customer_id: str, current_admin: dict = Depends(get_current_admin_only)):
    """Delete a customer (admin only)"""
    try:
        customer = await db.customers.find_one({"id": customer_id})
        if not customer:
            raise HTTPException(status_code=404, detail="العميل غير موجود | Customer not found")
        
        # Delete customer
        await db.customers.delete_one({"id": customer_id})
        
        # Delete related transactions
        await db.points_transactions.delete_many({"customer_id": customer_id})
        
        # Delete related invoices
        await db.invoices.delete_many({"customer_id": customer_id})
        
        logger.info(f"Customer {customer['name']} ({customer_id}) deleted by {current_admin.get('name', 'admin')}")
        
        return {"message": "تم حذف العميل | Customer deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting customer: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete customer")

@api_router.post("/admin/customers/{customer_id}/suspend")
async def suspend_customer(customer_id: str, suspend_data: CustomerSuspend, current_admin: dict = Depends(get_current_admin)):
    """Suspend a customer account"""
    try:
        customer = await db.customers.find_one({"id": customer_id})
        if not customer:
            raise HTTPException(status_code=404, detail="العميل غير موجود | Customer not found")
        
        await db.customers.update_one(
            {"id": customer_id},
            {
                "$set": {
                    "is_active": False,
                    "suspension_reason": suspend_data.reason,
                    "suspended_at": datetime.now(timezone.utc).isoformat(),
                    "suspended_by": current_admin.get("name", current_admin.get("email", "admin")),
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        
        logger.info(f"Customer {customer['name']} ({customer_id}) suspended. Reason: {suspend_data.reason}")
        
        return {"message": "تم تعطيل حساب العميل | Customer account suspended"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error suspending customer: {e}")
        raise HTTPException(status_code=500, detail="Failed to suspend customer")

@api_router.post("/admin/customers/{customer_id}/activate")
async def activate_customer(customer_id: str, current_admin: dict = Depends(get_current_admin)):
    """Activate a suspended customer account"""
    try:
        customer = await db.customers.find_one({"id": customer_id})
        if not customer:
            raise HTTPException(status_code=404, detail="العميل غير موجود | Customer not found")
        
        await db.customers.update_one(
            {"id": customer_id},
            {
                "$set": {
                    "is_active": True,
                    "suspension_reason": None,
                    "suspended_at": None,
                    "suspended_by": None,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        
        logger.info(f"Customer {customer['name']} ({customer_id}) activated by {current_admin.get('name', 'admin')}")
        
        return {"message": "تم تفعيل حساب العميل | Customer account activated"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error activating customer: {e}")
        raise HTTPException(status_code=500, detail="Failed to activate customer")

@api_router.put("/admin/customers/{customer_id}")
async def update_customer(
    customer_id: str,
    customer_update: CustomerUpdate,
    current_admin: dict = Depends(get_current_admin)
):
    """Update customer details"""
    try:
        update_data = {k: v for k, v in customer_update.model_dump().items() if v is not None}
        if not update_data:
            raise HTTPException(status_code=400, detail="No data to update")
        
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        
        result = await db.customers.update_one(
            {"id": customer_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        return {"message": "Customer updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating customer: {e}")
        raise HTTPException(status_code=500, detail="Failed to update customer")

@api_router.delete("/admin/customers/{customer_id}")
async def delete_customer(
    customer_id: str,
    current_admin: dict = Depends(get_current_admin)
):
    """Delete customer"""
    try:
        result = await db.customers.delete_one({"id": customer_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        # Delete related transactions
        await db.points_transactions.delete_many({"customer_id": customer_id})
        
        return {"message": "Customer deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting customer: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete customer")

@api_router.post("/admin/customers/{customer_id}/add-points")
async def add_points_manually(
    customer_id: str,
    points: float,
    description: str,
    current_admin: dict = Depends(get_current_admin)
):
    """Manually add points to customer"""
    try:
        customer = await db.customers.find_one({"id": customer_id}, {"_id": 0})
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        # Create transaction
        transaction = PointsTransaction(
            customer_id=customer_id,
            transaction_type="manual_add",
            points=points,
            description=description,
            expires_at=datetime.now(timezone.utc) + timedelta(days=365)
        )
        
        trans_doc = transaction.model_dump()
        trans_doc['created_at'] = trans_doc['created_at'].isoformat()
        trans_doc['expires_at'] = trans_doc['expires_at'].isoformat()
        
        await db.points_transactions.insert_one(trans_doc)
        
        # Update customer points
        await db.customers.update_one(
            {"id": customer_id},
            {
                "$inc": {
                    "total_points": points,
                    "active_points": points
                },
                "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
            }
        )
        
        return {"message": "Points added successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding points: {e}")
        raise HTTPException(status_code=500, detail="Failed to add points")

# ================ Admin - Settings ================

@api_router.get("/admin/settings")
async def get_settings(current_admin: dict = Depends(get_current_admin)):
    """Get all settings"""
    try:
        settings = await db.settings.find({}, {"_id": 0}).to_list(100)
        return {"settings": settings}
    except Exception as e:
        logger.error(f"Error getting settings: {e}")
        raise HTTPException(status_code=500, detail="Failed to get settings")

@api_router.put("/admin/settings/{key}")
async def update_setting(
    key: str,
    value: str,
    current_admin: dict = Depends(get_current_admin_only)
):
    """Update a setting - Admin only"""
    try:
        # Sanitize input
        from security_utils import sanitize_input
        key = sanitize_input(key, max_length=100)
        value = sanitize_input(value, max_length=1000)
        
        # Validate key
        allowed_keys = [
            "points_multiplier", 
            "points_reward_multiplier", 
            "last_synced_invoice",
            "sync_enabled",
            "points_expiry_days",
            "store_name",
            "store_logo"
        ]
        
        if key not in allowed_keys:
            raise HTTPException(status_code=400, detail=f"Invalid setting key: {key}")
        
        # Special validation for numeric values
        if key in ["points_multiplier", "points_reward_multiplier", "last_synced_invoice", "points_expiry_days"]:
            try:
                float(value)  # Validate it's a number
            except ValueError:
                raise HTTPException(status_code=400, detail=f"{key} must be a valid number")
        
        await db.settings.update_one(
            {"key": key},
            {
                "$set": {
                    "value": value,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            },
            upsert=True
        )
        
        # Audit log
        await AuditLogger.log(
            db=db,
            action=AuditActions.UPDATE_SETTINGS,
            actor_id=current_admin.get("sub"),
            actor_type="admin",
            actor_name=current_admin.get("name", "Unknown"),
            details={"key": key, "value": value},
            severity="info"
        )
        
        return {"message": f"تم تحديث {key} بنجاح | Setting '{key}' updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating setting: {str(e)[:100]}")
        raise HTTPException(status_code=500, detail="فشل تحديث الإعداد | Failed to update setting")

# ================ Admin - Email System ================

@api_router.post("/admin/send-email")
async def send_bulk_email(
    recipients: List[str],
    subject: str,
    content: str,
    background_tasks: BackgroundTasks,
    current_admin: dict = Depends(get_current_admin)
):
    """Send email to customers"""
    try:
        for email in recipients:
            background_tasks.add_task(send_notification_email, email, subject, content)
        
        return {"message": f"Email queued for {len(recipients)} recipients"}
    except Exception as e:
        logger.error(f"Error sending emails: {e}")
        raise HTTPException(status_code=500, detail="Failed to send emails")

# ================ Admin - Sync Management ================

@api_router.post("/admin/sync/manual")
async def trigger_manual_sync(current_admin: dict = Depends(get_current_admin)):
    """Trigger manual invoice sync"""
    try:
        # Check if sync is enabled
        sync_enabled = await db.settings.find_one({"key": "sync_enabled"}, {"_id": 0})
        if not sync_enabled or sync_enabled.get("value") != "true":
            raise HTTPException(status_code=400, detail="Sync is disabled")
        
        # Import sync function
        from cron_jobs import sync_invoices_once
        
        # Run sync
        result = await sync_invoices_once(db)
        
        return {
            "message": "Sync completed",
            "synced_count": result.get("synced_count", 0),
            "last_invoice": result.get("last_invoice", 0),
            "status": result.get("status", "success")
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during manual sync: {e}")
        raise HTTPException(status_code=500, detail=f"Sync failed: {str(e)}")

@api_router.get("/admin/sync/status")
async def get_sync_status(current_admin: dict = Depends(get_current_admin)):
    """Get sync status and information"""
    try:
        settings_keys = [
            "sync_enabled",
            "last_sync_time", 
            "last_sync_count",
            "last_sync_status",
            "last_sync_error",
            "last_synced_invoice"
        ]
        
        sync_info = {}
        for key in settings_keys:
            setting = await db.settings.find_one({"key": key}, {"_id": 0})
            sync_info[key] = setting.get("value", "") if setting else ""
        
        return sync_info
    except Exception as e:
        logger.error(f"Error getting sync status: {e}")
        raise HTTPException(status_code=500, detail="Failed to get sync status")

@api_router.put("/admin/sync/toggle")
async def toggle_sync(enabled: bool, current_admin: dict = Depends(get_current_admin)):
    """Enable or disable automatic sync"""
    try:
        await db.settings.update_one(
            {"key": "sync_enabled"},
            {"$set": {"value": "true" if enabled else "false", "updated_at": datetime.now(timezone.utc).isoformat()}},
            upsert=True
        )
        
        return {"message": f"Sync {'enabled' if enabled else 'disabled'}", "enabled": enabled}
    except Exception as e:
        logger.error(f"Error toggling sync: {e}")
        raise HTTPException(status_code=500, detail="Failed to toggle sync")

# ================ Staff Management ================

@api_router.post("/admin/staff")
async def create_staff(staff: StaffCreate, current_admin: dict = Depends(get_current_admin_only)):
    """Create a new staff member (admin only)"""
    try:
        international_phone = format_phone_for_twilio(staff.phone)
        
        # Check if phone already exists
        existing = await db.admins.find_one({"phone": international_phone})
        if existing:
            raise HTTPException(status_code=400, detail="رقم الجوال مستخدم مسبقاً | Phone already exists")
        
        staff_doc = {
            "id": str(uuid.uuid4()),
            "name": staff.name,
            "phone": international_phone,
            "role": staff.role,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.admins.insert_one(staff_doc)
        logger.info(f"Staff member created: {staff.name} ({staff.role})")
        
        return {"message": "تم إنشاء الحساب بنجاح | Account created successfully", "id": staff_doc["id"]}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating staff: {e}")
        raise HTTPException(status_code=500, detail="Failed to create staff")

@api_router.get("/admin/staff")
async def get_staff_list(current_admin: dict = Depends(get_current_admin_only)):
    """Get all staff and admin members (admin only)"""
    try:
        # Get all admins and staff (excluding current admin for safety)
        staff_list = await db.admins.find({}, {"_id": 0, "hashed_password": 0}).to_list(100)
        return {"staff": staff_list}
    except Exception as e:
        logger.error(f"Error getting staff list: {e}")
        raise HTTPException(status_code=500, detail="Failed to get staff list")

@api_router.delete("/admin/staff/{staff_id}")
async def delete_staff(staff_id: str, current_admin: dict = Depends(get_current_admin_only)):
    """Delete a staff member (admin only)"""
    try:
        # Prevent deleting the main admin
        admin_to_delete = await db.admins.find_one({"id": staff_id})
        if admin_to_delete and admin_to_delete.get("email") == "admin@alreef.com":
            raise HTTPException(status_code=400, detail="لا يمكن حذف المدير الرئيسي | Cannot delete main admin")
        
        result = await db.admins.delete_one({"id": staff_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Staff not found")
        return {"message": "تم الحذف بنجاح | Deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting staff: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete staff")

# ================ Points Redemption ================

@api_router.get("/redeem/customer/{phone}")
async def get_customer_for_redemption(phone: str, current_user: dict = Depends(get_staff_or_admin)):
    """Get customer info for redemption (staff or admin)"""
    try:
        # Format phone number
        international_phone = format_phone_for_twilio(phone)
        
        customer = await db.customers.find_one({"phone": international_phone}, {"_id": 0})
        if not customer:
            raise HTTPException(status_code=404, detail="العميل غير موجود | Customer not found")
        
        # Get points value in SAR
        reward_setting = await db.settings.find_one({"key": "points_reward_multiplier"}, {"_id": 0})
        reward_multiplier = float(reward_setting.get("value", 10)) if reward_setting else 10
        points_value_sar = customer.get("active_points", 0) / reward_multiplier
        
        return {
            "id": customer.get("customer_id", customer.get("id", "")),
            "name": customer["name"],
            "phone": format_phone_for_display(customer["phone"]),
            "phone_international": customer["phone"],
            "active_points": customer.get("active_points", 0),
            "points_value_sar": points_value_sar
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting customer for redemption: {e}")
        raise HTTPException(status_code=500, detail="Failed to get customer")

@api_router.post("/redeem/send-otp")
async def send_redemption_otp(request: SendOTPRequest, current_user: dict = Depends(get_staff_or_admin)):
    """Send OTP to customer for redemption verification"""
    try:
        international_phone = format_phone_for_twilio(request.phone)
        
        # Check if customer exists
        customer = await db.customers.find_one({"phone": international_phone})
        if not customer:
            raise HTTPException(status_code=404, detail="العميل غير موجود | Customer not found")
        
        # Generate and send OTP
        code = generate_otp_code()
        
        # Save OTP to database
        otp_doc = {
            "id": str(uuid.uuid4()),
            "phone": international_phone,
            "code": code,
            "purpose": "redemption",
            "verified": False,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "expires_at": (datetime.now(timezone.utc) + timedelta(minutes=10)).isoformat()
        }
        
        await db.otp_codes.insert_one(otp_doc)
        
        # Send OTP via Twilio
        success = send_otp_sms(international_phone, code)
        if not success:
            raise HTTPException(status_code=500, detail="فشل إرسال رمز التحقق | Failed to send OTP")
        
        logger.info(f"Redemption OTP sent to {international_phone}")
        return {"message": "تم إرسال رمز التحقق | OTP sent successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending redemption OTP: {e}")
        raise HTTPException(status_code=500, detail="Failed to send OTP")

@api_router.post("/redeem/verify-and-redeem")
async def verify_and_redeem_points(request: RedeemPointsRequest, current_user: dict = Depends(get_staff_or_admin)):
    """Verify OTP and redeem points"""
    try:
        international_phone = format_phone_for_twilio(request.customer_phone)
        
        # Verify OTP using Twilio Verify API
        is_valid = verify_otp_twilio(international_phone, request.otp_code)
        
        if not is_valid:
            raise HTTPException(status_code=400, detail="رمز التحقق غير صحيح | Invalid OTP code")
        
        # Get customer
        customer = await db.customers.find_one({"phone": international_phone}, {"_id": 0})
        if not customer:
            raise HTTPException(status_code=404, detail="العميل غير موجود | Customer not found")
        
        # Check if customer has enough points
        if customer.get("active_points", 0) < request.points_to_redeem:
            raise HTTPException(status_code=400, detail="رصيد النقاط غير كافي | Insufficient points balance")
        
        # Calculate SAR value
        reward_setting = await db.settings.find_one({"key": "points_reward_multiplier"}, {"_id": 0})
        reward_multiplier = float(reward_setting.get("value", 10)) if reward_setting else 10
        sar_value = request.points_to_redeem / reward_multiplier
        
        # Create redemption transaction
        transaction_doc = {
            "id": str(uuid.uuid4()),
            "customer_id": customer["id"],
            "transaction_type": "redeemed",
            "points": -request.points_to_redeem,
            "description": f"استبدال {request.points_to_redeem:.0f} نقطة بقيمة {sar_value:.2f} ريال | Redeemed {request.points_to_redeem:.0f} points worth {sar_value:.2f} SAR",
            "redeemed_by": current_user.get("email", ""),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.points_transactions.insert_one(transaction_doc)
        
        # Update customer points
        await db.customers.update_one(
            {"id": customer["id"]},
            {
                "$inc": {
                    "active_points": -request.points_to_redeem,
                    "redeemed_points": request.points_to_redeem
                },
                "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
            }
        )
        
        logger.info(f"Points redeemed: {request.points_to_redeem} points for customer {international_phone} by {current_user.get('email')}")
        
        return {
            "message": "تم استبدال النقاط بنجاح | Points redeemed successfully",
            "points_redeemed": request.points_to_redeem,
            "sar_value": sar_value,
            "remaining_points": customer.get("active_points", 0) - request.points_to_redeem
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error redeeming points: {e}")
        raise HTTPException(status_code=500, detail="Failed to redeem points")

@api_router.get("/admin/me")
async def get_current_user_info(current_user: dict = Depends(get_staff_or_admin)):
    """Get current logged in user info"""
    return {
        "email": current_user.get("email"),
        "name": current_user.get("name"),
        "role": current_user.get("role", "admin"),
        "type": current_user.get("type")
    }


# ================ Advanced Reports & Analytics ================

@api_router.get("/admin/reports/customers")
async def get_customer_reports(
    current_admin: dict = Depends(get_current_admin),
    period: str = "month"  # day, week, month, year, all
):
    """Get comprehensive customer reports"""
    try:
        now = datetime.now(timezone.utc)
        
        # Calculate date range based on period
        if period == "day":
            start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        elif period == "week":
            start_date = now - timedelta(days=7)
        elif period == "month":
            start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        elif period == "year":
            start_date = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        else:  # all
            start_date = datetime(2000, 1, 1, tzinfo=timezone.utc)
        
        start_date_str = start_date.isoformat()
        
        # 1. Top 10 customers by points earned
        top_customers_by_points = await db.customers.find(
            {},
            {"_id": 0, "name": 1, "phone": 1, "total_points": 1}
        ).sort("total_points", -1).limit(10).to_list(10)
        
        for customer in top_customers_by_points:
            customer["phone"] = format_phone_for_display(customer.get("phone", ""))
        
        # 2. Top 10 customers by redemptions
        redemption_pipeline = [
            {
                "$match": {
                    "transaction_type": "redeemed",
                    "created_at": {"$gte": start_date_str}
                }
            },
            {
                "$group": {
                    "_id": "$customer_id",
                    "total_redeemed": {"$sum": {"$abs": "$points"}}
                }
            },
            {"$sort": {"total_redeemed": -1}},
            {"$limit": 10}
        ]
        
        redemption_results = await db.points_transactions.aggregate(redemption_pipeline).to_list(10)
        
        top_customers_by_redemption = []
        for result in redemption_results:
            customer = await db.customers.find_one({"id": result["_id"]}, {"_id": 0, "name": 1, "phone": 1})
            if customer:
                top_customers_by_redemption.append({
                    "name": customer["name"],
                    "phone": format_phone_for_display(customer.get("phone", "")),
                    "total_redeemed": round(result["total_redeemed"], 2)
                })
        
        # 3. New customers in period
        new_customers = await db.customers.count_documents({
            "created_at": {"$gte": start_date_str}
        })
        
        # 4. Inactive customers (no points earned in last 30 days)
        thirty_days_ago = (now - timedelta(days=30)).isoformat()
        
        # Get customers who have transactions
        active_customer_ids = await db.points_transactions.distinct(
            "customer_id",
            {"created_at": {"$gte": thirty_days_ago}, "transaction_type": "earned"}
        )
        
        total_customers = await db.customers.count_documents({})
        inactive_customers = total_customers - len(active_customer_ids)
        
        # 5. Customer distribution by points balance
        distribution_pipeline = [
            {
                "$bucket": {
                    "groupBy": "$active_points",
                    "boundaries": [0, 10, 50, 100, 500, 1000, 10000],
                    "default": "10000+",
                    "output": {
                        "count": {"$sum": 1}
                    }
                }
            }
        ]
        
        distribution_results = await db.customers.aggregate(distribution_pipeline).to_list(10)
        
        points_distribution = []
        ranges = ["0-10", "10-50", "50-100", "100-500", "500-1000", "1000+"]
        for i, result in enumerate(distribution_results):
            if i < len(ranges):
                points_distribution.append({
                    "range": ranges[i],
                    "count": result["count"]
                })
        
        return {
            "period": period,
            "top_customers_by_points": top_customers_by_points,
            "top_customers_by_redemption": top_customers_by_redemption,
            "new_customers": new_customers,
            "inactive_customers": inactive_customers,
            "total_customers": total_customers,
            "points_distribution": points_distribution
        }
    except Exception as e:
        logger.error(f"Error getting customer reports: {e}")
        raise HTTPException(status_code=500, detail="Failed to get customer reports")

@api_router.get("/admin/reports/points")
async def get_points_reports(
    current_admin: dict = Depends(get_current_admin),
    period: str = "month"
):
    """Get comprehensive points reports"""
    try:
        now = datetime.now(timezone.utc)
        
        # Calculate date range
        if period == "day":
            start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        elif period == "week":
            start_date = now - timedelta(days=7)
        elif period == "month":
            start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        elif period == "year":
            start_date = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        else:
            start_date = datetime(2000, 1, 1, tzinfo=timezone.utc)
        
        start_date_str = start_date.isoformat()
        
        # 1. Total points earned vs redeemed
        earned_pipeline = [
            {
                "$match": {
                    "transaction_type": {"$in": ["earned", "manual_add"]},
                    "created_at": {"$gte": start_date_str}
                }
            },
            {
                "$group": {
                    "_id": None,
                    "total_earned": {"$sum": "$points"}
                }
            }
        ]
        
        earned_result = await db.points_transactions.aggregate(earned_pipeline).to_list(1)
        total_earned = earned_result[0]["total_earned"] if earned_result else 0
        
        redeemed_pipeline = [
            {
                "$match": {
                    "transaction_type": "redeemed",
                    "created_at": {"$gte": start_date_str}
                }
            },
            {
                "$group": {
                    "_id": None,
                    "total_redeemed": {"$sum": {"$abs": "$points"}}
                }
            }
        ]
        
        redeemed_result = await db.points_transactions.aggregate(redeemed_pipeline).to_list(1)
        total_redeemed = redeemed_result[0]["total_redeemed"] if redeemed_result else 0
        
        # 2. Redemption rate
        redemption_rate = (total_redeemed / total_earned * 100) if total_earned > 0 else 0
        
        # 3. Expired points
        expired_pipeline = [
            {
                "$match": {
                    "transaction_type": "expired"
                }
            },
            {
                "$group": {
                    "_id": None,
                    "total_expired": {"$sum": {"$abs": "$points"}}
                }
            }
        ]
        
        expired_result = await db.points_transactions.aggregate(expired_pipeline).to_list(1)
        total_expired = expired_result[0]["total_expired"] if expired_result else 0
        
        # 4. Points expiring soon (next 30 days)
        thirty_days = (now + timedelta(days=30)).isoformat()
        
        expiring_pipeline = [
            {
                "$match": {
                    "transaction_type": {"$in": ["earned", "manual_add"]},
                    "expires_at": {
                        "$lte": thirty_days,
                        "$gte": now.isoformat()
                    }
                }
            },
            {
                "$group": {
                    "_id": None,
                    "total_expiring": {"$sum": "$points"}
                }
            }
        ]
        
        expiring_result = await db.points_transactions.aggregate(expiring_pipeline).to_list(1)
        points_expiring_soon = expiring_result[0]["total_expiring"] if expiring_result else 0
        
        # 5. Average points per customer
        customers_pipeline = [
            {
                "$group": {
                    "_id": None,
                    "avg_points": {"$avg": "$active_points"},
                    "total_active": {"$sum": "$active_points"}
                }
            }
        ]
        
        customers_result = await db.customers.aggregate(customers_pipeline).to_list(1)
        avg_points = customers_result[0]["avg_points"] if customers_result else 0
        total_active_points = customers_result[0]["total_active"] if customers_result else 0
        
        return {
            "period": period,
            "total_earned": round(total_earned, 2),
            "total_redeemed": round(total_redeemed, 2),
            "total_expired": round(total_expired, 2),
            "redemption_rate": round(redemption_rate, 2),
            "points_expiring_soon": round(points_expiring_soon, 2),
            "average_points_per_customer": round(avg_points, 2),
            "total_active_points": round(total_active_points, 2)
        }
    except Exception as e:
        logger.error(f"Error getting points reports: {e}")
        raise HTTPException(status_code=500, detail="Failed to get points reports")

@api_router.get("/admin/reports/performance")
async def get_performance_reports(
    current_admin: dict = Depends(get_current_admin),
    period: str = "month"
):
    """Get performance KPIs"""
    try:
        now = datetime.now(timezone.utc)
        
        # Calculate current and previous period
        if period == "month":
            current_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            if current_start.month == 1:
                previous_start = current_start.replace(year=current_start.year - 1, month=12)
            else:
                previous_start = current_start.replace(month=current_start.month - 1)
            previous_end = current_start
        elif period == "year":
            current_start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
            previous_start = current_start.replace(year=current_start.year - 1)
            previous_end = current_start
        else:  # week or day
            if period == "week":
                current_start = now - timedelta(days=7)
                previous_start = now - timedelta(days=14)
            else:  # day
                current_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
                previous_start = current_start - timedelta(days=1)
            previous_end = current_start
        
        # 1. Growth Rate (new customers)
        current_new = await db.customers.count_documents({
            "created_at": {"$gte": current_start.isoformat()}
        })
        
        previous_new = await db.customers.count_documents({
            "created_at": {"$gte": previous_start.isoformat(), "$lt": previous_end.isoformat()}
        })
        
        growth_rate = ((current_new - previous_new) / previous_new * 100) if previous_new > 0 else 0
        
        # 2. Retention Rate (customers who earned points in both periods)
        current_active = await db.points_transactions.distinct(
            "customer_id",
            {"created_at": {"$gte": current_start.isoformat()}, "transaction_type": "earned"}
        )
        
        previous_active = await db.points_transactions.distinct(
            "customer_id",
            {"created_at": {"$gte": previous_start.isoformat(), "$lt": previous_end.isoformat()}, "transaction_type": "earned"}
        )
        
        retained = len(set(current_active) & set(previous_active))
        retention_rate = (retained / len(previous_active) * 100) if len(previous_active) > 0 else 0
        
        # 3. ROI for Points (value given vs value redeemed)
        setting = await db.settings.find_one({"key": "points_reward_multiplier"}, {"_id": 0})
        multiplier = float(setting.get("value", 10)) if setting else 10
        
        earned_pipeline = [
            {
                "$match": {
                    "transaction_type": {"$in": ["earned", "manual_add"]},
                    "created_at": {"$gte": current_start.isoformat()}
                }
            },
            {"$group": {"_id": None, "total": {"$sum": "$points"}}}
        ]
        
        earned = await db.points_transactions.aggregate(earned_pipeline).to_list(1)
        total_earned = earned[0]["total"] if earned else 0
        value_given = total_earned / multiplier
        
        redeemed_pipeline = [
            {
                "$match": {
                    "transaction_type": "redeemed",
                    "created_at": {"$gte": current_start.isoformat()}
                }
            },
            {"$group": {"_id": None, "total": {"$sum": {"$abs": "$points"}}}}
        ]
        
        redeemed = await db.points_transactions.aggregate(redeemed_pipeline).to_list(1)
        total_redeemed = redeemed[0]["total"] if redeemed else 0
        value_redeemed = total_redeemed / multiplier
        
        roi = ((value_given - value_redeemed) / value_redeemed * 100) if value_redeemed > 0 else 0
        
        # 4. Customer Lifetime Value (CLV)
        invoice_pipeline = [
            {
                "$group": {
                    "_id": None,
                    "total_sales": {"$sum": "$total_amount"},
                    "count": {"$sum": 1}
                }
            }
        ]
        
        invoice_result = await db.invoices.aggregate(invoice_pipeline).to_list(1)
        total_sales = invoice_result[0]["total_sales"] if invoice_result else 0
        total_customers = await db.customers.count_documents({})
        
        clv = (total_sales / total_customers) if total_customers > 0 else 0
        
        return {
            "period": period,
            "growth_rate": round(growth_rate, 2),
            "new_customers_current": current_new,
            "new_customers_previous": previous_new,
            "retention_rate": round(retention_rate, 2),
            "retained_customers": retained,
            "roi_percentage": round(roi, 2),
            "value_given_sar": round(value_given, 2),
            "value_redeemed_sar": round(value_redeemed, 2),
            "customer_lifetime_value": round(clv, 2),
            "total_sales": round(total_sales, 2)
        }
    except Exception as e:
        logger.error(f"Error getting performance reports: {e}")
        raise HTTPException(status_code=500, detail="Failed to get performance reports")

@api_router.get("/admin/reports/charts")
async def get_chart_data(
    current_admin: dict = Depends(get_current_admin),
    period: str = "month"
):
    """Get data for charts and visualizations"""
    try:
        now = datetime.now(timezone.utc)
        
        # Determine number of data points based on period
        if period == "day":
            # Last 24 hours by hour
            data_points = 24
            interval = timedelta(hours=1)
        elif period == "week":
            # Last 7 days
            data_points = 7
            interval = timedelta(days=1)
        elif period == "year":
            # Last 12 months
            data_points = 12
            interval = timedelta(days=30)
        else:  # month
            # Last 30 days
            data_points = 30
            interval = timedelta(days=1)
        
        # 1. Customer growth over time
        customer_growth = []
        for i in range(data_points, 0, -1):
            point_date = now - (interval * i)
            count = await db.customers.count_documents({
                "created_at": {"$lte": point_date.isoformat()}
            })
            
            if period == "day":
                label = point_date.strftime("%H:00")
            elif period == "year":
                label = point_date.strftime("%b %Y")
            else:
                label = point_date.strftime("%d/%m")
            
            customer_growth.append({
                "date": label,
                "customers": count
            })
        
        # 2. Points earned vs redeemed over time
        points_comparison = []
        for i in range(data_points, 0, -1):
            start_point = now - (interval * i)
            end_point = start_point + interval
            
            # Earned
            earned = await db.points_transactions.aggregate([
                {
                    "$match": {
                        "transaction_type": {"$in": ["earned", "manual_add"]},
                        "created_at": {"$gte": start_point.isoformat(), "$lt": end_point.isoformat()}
                    }
                },
                {"$group": {"_id": None, "total": {"$sum": "$points"}}}
            ]).to_list(1)
            
            # Redeemed
            redeemed = await db.points_transactions.aggregate([
                {
                    "$match": {
                        "transaction_type": "redeemed",
                        "created_at": {"$gte": start_point.isoformat(), "$lt": end_point.isoformat()}
                    }
                },
                {"$group": {"_id": None, "total": {"$sum": {"$abs": "$points"}}}}
            ]).to_list(1)
            
            if period == "day":
                label = start_point.strftime("%H:00")
            elif period == "year":
                label = start_point.strftime("%b %Y")
            else:
                label = start_point.strftime("%d/%m")
            
            points_comparison.append({
                "date": label,
                "earned": round(earned[0]["total"], 2) if earned else 0,
                "redeemed": round(redeemed[0]["total"], 2) if redeemed else 0
            })
        
        # 3. Monthly sales chart
        sales_data = []
        for i in range(data_points, 0, -1):
            start_point = now - (interval * i)
            end_point = start_point + interval
            
            result = await db.invoices.aggregate([
                {
                    "$match": {
                        "invoice_date": {"$gte": start_point.isoformat(), "$lt": end_point.isoformat()}
                    }
                },
                {"$group": {"_id": None, "total": {"$sum": "$total_amount"}, "count": {"$sum": 1}}}
            ]).to_list(1)
            
            if period == "day":
                label = start_point.strftime("%H:00")
            elif period == "year":
                label = start_point.strftime("%b %Y")
            else:
                label = start_point.strftime("%d/%m")
            
            sales_data.append({
                "date": label,
                "sales": round(result[0]["total"], 2) if result else 0,
                "invoices": result[0]["count"] if result else 0
            })
        
        # 4. Customer distribution pie chart (by points balance)
        distribution = await db.customers.aggregate([
            {
                "$bucket": {
                    "groupBy": "$active_points",
                    "boundaries": [0, 10, 50, 100, 500, 1000, 10000],
                    "default": "1000+",
                    "output": {"count": {"$sum": 1}}
                }
            }
        ]).to_list(10)
        
        ranges = ["0-10", "10-50", "50-100", "100-500", "500-1000", "1000+"]
        customer_distribution = []
        for i, result in enumerate(distribution):
            if i < len(ranges):
                customer_distribution.append({
                    "name": ranges[i],
                    "value": result["count"]
                })
        
        return {
            "period": period,
            "customer_growth": customer_growth,
            "points_comparison": points_comparison,
            "sales_data": sales_data,
            "customer_distribution": customer_distribution
        }
    except Exception as e:
        logger.error(f"Error getting chart data: {e}")
        raise HTTPException(status_code=500, detail="Failed to get chart data")


# Include router
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize default admin and settings"""
    try:
        # Update or create admin with phone number
        admin_phone = "+966550755465"  # مصطفى الحسين
        admin_email = os.getenv('ADMIN_DEFAULT_EMAIL', 'admin@alreef.com')
        
        admin_exists = await db.admins.find_one({"$or": [{"email": admin_email}, {"phone": admin_phone}]})
        
        if not admin_exists:
            admin_password = os.getenv('ADMIN_DEFAULT_PASSWORD', 'Admin@123')
            hashed = bcrypt.hashpw(admin_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            admin_doc = {
                "id": str(uuid.uuid4()),
                "name": "مصطفى الحسين",
                "phone": admin_phone,
                "email": admin_email,
                "hashed_password": hashed,
                "role": "admin",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            
            await db.admins.insert_one(admin_doc)
            logger.info(f"Default admin created: مصطفى الحسين ({admin_phone})")
        else:
            # Update existing admin with name and phone if missing
            update_fields = {}
            if not admin_exists.get("phone"):
                update_fields["phone"] = admin_phone
            if not admin_exists.get("name") or admin_exists.get("name") == "Administrator":
                update_fields["name"] = "مصطفى الحسين"
            if "role" not in admin_exists:
                update_fields["role"] = "admin"
            
            if update_fields:
                await db.admins.update_one(
                    {"_id": admin_exists["_id"]},
                    {"$set": update_fields}
                )
                logger.info(f"Updated admin: {update_fields}")
        
        # Initialize default settings
        default_settings = [
            {"key": "points_multiplier", "value": "10"},
            {"key": "points_reward_multiplier", "value": "10"},
            {"key": "last_synced_invoice", "value": "160110"},
            {"key": "logo_url", "value": "https://customer-assets.emergentagent.com/job_alrif-points/artifacts/r9bwchf3_Al%20Reef%20logo-3.png"},
            {"key": "sync_enabled", "value": "true"},
            {"key": "last_sync_time", "value": ""},
            {"key": "last_sync_count", "value": "0"},
            {"key": "last_sync_status", "value": "pending"},
            {"key": "last_sync_error", "value": ""}
        ]
        
        for setting in default_settings:
            exists = await db.settings.find_one({"key": setting["key"]})
            if not exists:
                setting["id"] = str(uuid.uuid4())
                setting["updated_at"] = datetime.now(timezone.utc).isoformat()
                await db.settings.insert_one(setting)
        
        logger.info("Startup initialization completed")
    except Exception as e:
        logger.error(f"Error during startup: {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
