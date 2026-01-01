from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator, ValidationError
from typing import Optional, List
from datetime import datetime, timezone
import uuid
import re

class Customer(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: Optional[str] = None  # Email is optional - many customers don't have it
    phone: str
    rewaa_customer_id: Optional[str] = None
    total_points: float = 0.0
    active_points: float = 0.0
    expired_points: float = 0.0
    redeemed_points: float = 0.0
    is_active: bool = True  # Account status
    suspension_reason: Optional[str] = None  # Reason for suspension
    suspended_at: Optional[str] = None  # When account was suspended
    suspended_by: Optional[str] = None  # Who suspended the account
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CustomerCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: Optional[str] = Field(None, max_length=200)
    phone: str = Field(..., min_length=9, max_length=15)
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        if not v or not v.strip():
            raise ValueError('الاسم مطلوب | Name is required')
        # Remove dangerous characters
        v = v.strip()
        if len(v) < 2:
            raise ValueError('الاسم يجب أن يكون حرفين على الأقل | Name must be at least 2 characters')
        if len(v) > 100:
            raise ValueError('الاسم طويل جداً | Name is too long')
        return v
    
    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        if not v:
            raise ValueError('رقم الجوال مطلوب | Phone number is required')
        # Remove spaces and dashes
        v = v.replace(' ', '').replace('-', '')
        # Validate Saudi phone format
        patterns = [r'^05\d{8}$', r'^5\d{8}$', r'^\+9665\d{8}$', r'^9665\d{8}$']
        if not any(re.match(pattern, v) for pattern in patterns):
            raise ValueError('رقم جوال غير صحيح | Invalid phone number format')
        return v
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, v):
        if v and len(v) > 200:
            raise ValueError('البريد الإلكتروني طويل جداً | Email is too long')
        return v

class CustomerUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[str] = Field(None, max_length=200)
    phone: Optional[str] = Field(None, min_length=9, max_length=15)
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        if v is not None:
            v = v.strip()
            if len(v) < 2:
                raise ValueError('الاسم يجب أن يكون حرفين على الأقل | Name must be at least 2 characters')
            if len(v) > 100:
                raise ValueError('الاسم طويل جداً | Name is too long')
        return v
    
    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        if v is not None:
            v = v.replace(' ', '').replace('-', '')
            patterns = [r'^05\d{8}$', r'^5\d{8}$', r'^\+9665\d{8}$', r'^9665\d{8}$']
            if not any(re.match(pattern, v) for pattern in patterns):
                raise ValueError('رقم جوال غير صحيح | Invalid phone number format')
        return v

class CustomerSuspend(BaseModel):
    reason: str = Field(..., min_length=5, max_length=500)
    
    @field_validator('reason')
    @classmethod
    def validate_reason(cls, v):
        if not v or not v.strip():
            raise ValueError('السبب مطلوب | Reason is required')
        v = v.strip()
        if len(v) < 5:
            raise ValueError('السبب قصير جداً | Reason is too short')
        if len(v) > 500:
            raise ValueError('السبب طويل جداً | Reason is too long')
        return v

class Invoice(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    invoice_number: int
    customer_id: str
    customer_phone: str
    total_amount: float
    points_earned: float
    payment_method: Optional[str] = None
    invoice_date: datetime
    synced_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PointsTransaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_id: str
    transaction_type: str  # earned, redeemed, expired, manual_add, manual_deduct
    points: float
    description: str
    invoice_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: Optional[datetime] = None

class Settings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    key: str
    value: str
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Admin(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str  # Phone number for login
    email: Optional[str] = None  # Email is optional
    hashed_password: Optional[str] = None  # Password is optional (OTP login)
    role: str = "admin"  # admin or staff
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AdminCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., min_length=9, max_length=15)
    role: str = Field(default="staff", pattern="^(admin|staff)$")
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        if not v or not v.strip():
            raise ValueError('الاسم مطلوب | Name is required')
        return v.strip()
    
    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        if not v:
            raise ValueError('رقم الجوال مطلوب | Phone number is required')
        v = v.replace(' ', '').replace('-', '')
        patterns = [r'^05\d{8}$', r'^5\d{8}$', r'^\+9665\d{8}$', r'^9665\d{8}$']
        if not any(re.match(pattern, v) for pattern in patterns):
            raise ValueError('رقم جوال غير صحيح | Invalid phone number format')
        return v

class StaffCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., min_length=9, max_length=15)
    role: str = Field(default="staff", pattern="^(admin|staff)$")
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        if not v or not v.strip():
            raise ValueError('الاسم مطلوب | Name is required')
        return v.strip()
    
    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        if not v:
            raise ValueError('رقم الجوال مطلوب | Phone number is required')
        v = v.replace(' ', '').replace('-', '')
        patterns = [r'^05\d{8}$', r'^5\d{8}$', r'^\+9665\d{8}$', r'^9665\d{8}$']
        if not any(re.match(pattern, v) for pattern in patterns):
            raise ValueError('رقم جوال غير صحيح | Invalid phone number format')
        return v

class AdminLogin(BaseModel):
    email: Optional[str] = Field(None, max_length=200)
    phone: Optional[str] = Field(None, min_length=9, max_length=15)
    password: Optional[str] = Field(None, min_length=8, max_length=100)

class RedeemPointsRequest(BaseModel):
    customer_phone: str = Field(..., min_length=9, max_length=15)
    points_to_redeem: float = Field(..., gt=0, le=10000)
    otp_code: str = Field(..., min_length=4, max_length=6)
    
    @field_validator('customer_phone')
    @classmethod
    def validate_phone(cls, v):
        if not v:
            raise ValueError('رقم الجوال مطلوب | Phone number is required')
        v = v.replace(' ', '').replace('-', '')
        patterns = [r'^05\d{8}$', r'^5\d{8}$', r'^\+9665\d{8}$', r'^9665\d{8}$']
        if not any(re.match(pattern, v) for pattern in patterns):
            raise ValueError('رقم جوال غير صحيح | Invalid phone number format')
        return v
    
    @field_validator('points_to_redeem')
    @classmethod
    def validate_points(cls, v):
        if v <= 0:
            raise ValueError('النقاط يجب أن تكون أكبر من صفر | Points must be greater than zero')
        if v > 10000:
            raise ValueError('الحد الأقصى للنقاط هو 10000 | Maximum points is 10000')
        return v
    
    @field_validator('otp_code')
    @classmethod
    def validate_otp(cls, v):
        if not v or not v.isdigit() or len(v) < 4 or len(v) > 6:
            raise ValueError('رمز التحقق يجب أن يكون 4-6 أرقام | OTP code must be 4-6 digits')
        return v

class OTPCode(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    phone: str
    code: str
    verified: bool = False
    used: bool = False  # Track if OTP was used
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: datetime

class SendOTPRequest(BaseModel):
    phone: str = Field(..., min_length=9, max_length=15)
    
    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        if not v:
            raise ValueError('رقم الجوال مطلوب | Phone number is required')
        v = v.replace(' ', '').replace('-', '')
        patterns = [r'^05\d{8}$', r'^5\d{8}$', r'^\+9665\d{8}$', r'^9665\d{8}$']
        if not any(re.match(pattern, v) for pattern in patterns):
            raise ValueError('رقم جوال غير صحيح | Invalid phone number format')
        return v

class VerifyOTPRequest(BaseModel):
    phone: str = Field(..., min_length=9, max_length=15)
    code: str = Field(..., min_length=4, max_length=6)
    trust_device: bool = False  # Option to trust this device for 90 days
    device_token: Optional[str] = None  # Existing device token if available
    
    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        if not v:
            raise ValueError('رقم الجوال مطلوب | Phone number is required')
        v = v.replace(' ', '').replace('-', '')
        patterns = [r'^05\d{8}$', r'^5\d{8}$', r'^\+9665\d{8}$', r'^9665\d{8}$']
        if not any(re.match(pattern, v) for pattern in patterns):
            raise ValueError('رقم جوال غير صحيح | Invalid phone number format')
        return v
    
    @field_validator('code')
    @classmethod
    def validate_otp(cls, v):
        if not v or not v.isdigit() or len(v) < 4 or len(v) > 6:
            raise ValueError('رمز التحقق يجب أن يكون 4-6 أرقام | OTP code must be 4-6 digits')
        return v

class TrustedDevice(BaseModel):
    """Model for trusted devices that can skip OTP verification"""
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    phone: str  # Admin/Staff phone (international format)
    device_token: str  # Unique token for this device
    device_info: Optional[str] = None  # Browser/device info
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: datetime  # Token expires after 90 days
    last_used_at: Optional[datetime] = None

class CheckTrustedDeviceRequest(BaseModel):
    phone: str = Field(..., min_length=9, max_length=15)
    device_token: str = Field(..., min_length=32, max_length=128)
    
    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        if not v:
            raise ValueError('رقم الجوال مطلوب | Phone number is required')
        v = v.replace(' ', '').replace('-', '')
        patterns = [r'^05\d{8}$', r'^5\d{8}$', r'^\+9665\d{8}$', r'^9665\d{8}$']
        if not any(re.match(pattern, v) for pattern in patterns):
            raise ValueError('رقم جوال غير صحيح | Invalid phone number format')
        return v

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    device_token: Optional[str] = None  # Returned when device is trusted