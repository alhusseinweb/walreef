from twilio.rest import Client
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
import os
from dotenv import load_dotenv
from datetime import datetime, timezone, timedelta
import random
import string

load_dotenv()

# Twilio SMS Service using Verify API
def send_otp_sms(phone: str, code: str) -> bool:
    """
    Send OTP code via Twilio Verify API
    """
    try:
        account_sid = os.getenv('TWILIO_ACCOUNT_SID')
        auth_token = os.getenv('TWILIO_AUTH_TOKEN')
        verify_service = os.getenv('TWILIO_VERIFY_SERVICE')
        
        if not account_sid or not auth_token or not verify_service:
            print("Twilio credentials not configured. Using mock mode.")
            print(f"✅ Mock OTP for {phone}: 1234 (Development Mode - Fixed Code)")
            return True
        
        client = Client(account_sid, auth_token)
        
        # Use Twilio Verify API
        verification = client.verify.v2.services(verify_service).verifications.create(
            to=phone,
            channel='sms'
        )
        
        print(f"OTP sent via Twilio Verify: {verification.status}")
        return verification.status in ['pending', 'approved']
        
    except Exception as e:
        print(f"Error sending SMS via Twilio Verify: {e}")
        # Fallback to mock mode
        print(f"✅ Mock OTP for {phone}: 1234 (Development Mode - Fixed Code)")
        return True

# SendGrid Email Service
def send_welcome_email(email: str, name: str) -> bool:
    """
    Send welcome email to new customer
    """
    try:
        api_key = os.getenv('SENDGRID_API_KEY')
        sender_email = os.getenv('SENDER_EMAIL', 'noreply@alreef.com')
        
        if not api_key:
            print("SendGrid API key not configured. Using mock mode.")
            print(f"Mock welcome email sent to {email}")
            return True
        
        message = Mail(
            from_email=sender_email,
            to_emails=email,
            subject='مرحباً بك في برنامج ولاء واحة الريف | Welcome to Al-Reef Loyalty Program',
            html_content=f"""
            <html dir="rtl">
                <body style="font-family: Arial, sans-serif; padding: 20px; direction: rtl;">
                    <h2 style="color: #1A4D2E;">مرحباً {name}!</h2>
                    <p>شكراً لانضمامك إلى برنامج ولاء واحة الريف.</p>
                    <p>ابدأ في جمع النقاط مع كل عملية شراء واستفد من المكافآت الرائعة!</p>
                    <hr/>
                    <h2 style="color: #1A4D2E;">Welcome {name}!</h2>
                    <p>Thank you for joining Al-Reef Loyalty Program.</p>
                    <p>Start earning points with every purchase and enjoy amazing rewards!</p>
                </body>
            </html>
            """
        )
        
        sg = SendGridAPIClient(api_key)
        response = sg.send(message)
        return response.status_code == 202
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

def send_notification_email(email: str, subject: str, content: str) -> bool:
    """
    Send notification email to customer
    """
    try:
        api_key = os.getenv('SENDGRID_API_KEY')
        sender_email = os.getenv('SENDER_EMAIL', 'noreply@alreef.com')
        
        if not api_key:
            print("SendGrid API key not configured. Using mock mode.")
            print(f"Mock notification email sent to {email}")
            return True
        
        message = Mail(
            from_email=sender_email,
            to_emails=email,
            subject=subject,
            html_content=content
        )
        
        sg = SendGridAPIClient(api_key)
        response = sg.send(message)
        return response.status_code == 202
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

def generate_otp_code() -> str:
    """
    Generate a 6-digit OTP code
    """
    return ''.join(random.choices(string.digits, k=6))

def verify_otp_twilio(phone: str, code: str) -> bool:
    """
    Verify OTP code via Twilio Verify API
    """
    try:
        account_sid = os.getenv('TWILIO_ACCOUNT_SID')
        auth_token = os.getenv('TWILIO_AUTH_TOKEN')
        verify_service = os.getenv('TWILIO_VERIFY_SERVICE')
        
        if not account_sid or not auth_token or not verify_service:
            # Development Mode: Only accept fixed code "1234"
            if code == "1234":
                print(f"✅ Mock verification success for {phone}: Code 1234 accepted (Development Mode)")
                return True
            else:
                print(f"❌ Mock verification failed for {phone}: Invalid code '{code}' (Expected: 1234)")
                return False
        
        client = Client(account_sid, auth_token)
        
        # Use Twilio Verify API to check the code
        verification_check = client.verify.v2.services(verify_service).verification_checks.create(
            to=phone,
            code=code
        )
        
        print(f"Twilio Verify check status: {verification_check.status}")
        return verification_check.status == 'approved'
        
    except Exception as e:
        print(f"Error verifying OTP via Twilio: {e}")
        return False