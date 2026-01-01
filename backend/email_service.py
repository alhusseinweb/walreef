"""
Email notification service using Resend API
Sends notifications for Rewaa sync failures
"""
import os
import asyncio
import logging
import resend
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Resend configuration
resend.api_key = os.environ.get("RESEND_API_KEY", "")
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "noreply@walreef.com")
DEFAULT_NOTIFICATION_EMAIL = os.environ.get("NOTIFICATION_EMAIL", "info@walreef.com")


async def get_notification_email(db) -> str:
    """Get notification email from database settings or return default"""
    try:
        setting = await db.system_settings.find_one(
            {"key": "notification_email"},
            {"_id": 0}
        )
        if setting and setting.get("value"):
            return setting["value"]
    except Exception as e:
        logger.error(f"Error fetching notification email setting: {e}")
    return DEFAULT_NOTIFICATION_EMAIL


async def send_sync_failure_notification(db, sync_type: str, error_message: str, details: dict = None):
    """
    Send email notification when Rewaa sync fails
    
    Args:
        db: MongoDB database instance
        sync_type: 'manual' or 'automatic'
        error_message: The error that occurred
        details: Additional details about the failure
    """
    if not resend.api_key:
        logger.warning("Resend API key not configured - skipping email notification")
        return False
    
    try:
        # Get notification email from settings
        recipient_email = await get_notification_email(db)
        
        # Format timestamp
        timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
        
        # Build HTML email content
        sync_type_ar = "يدوية" if sync_type == "manual" else "تلقائية"
        sync_type_en = "Manual" if sync_type == "manual" else "Automatic"
        
        details_html = ""
        if details:
            details_items = "".join([
                f"<tr><td style='padding: 8px; border-bottom: 1px solid #eee; color: #666;'>{k}</td>"
                f"<td style='padding: 8px; border-bottom: 1px solid #eee; color: #333;'>{v}</td></tr>"
                for k, v in details.items()
            ])
            details_html = f"""
            <h3 style='color: #1A4D2E; margin-top: 20px;'>تفاصيل إضافية | Additional Details</h3>
            <table style='width: 100%; border-collapse: collapse;'>
                {details_items}
            </table>
            """
        
        html_content = f"""
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
            <meta charset="UTF-8">
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px; margin: 0;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <!-- Header -->
                <div style="background-color: #DC2626; padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ فشل المزامنة مع Rewaa</h1>
                    <p style="color: #FEE2E2; margin: 10px 0 0 0;">Rewaa Sync Failed</p>
                </div>
                
                <!-- Content -->
                <div style="padding: 30px;">
                    <div style="background-color: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                        <p style="margin: 0; color: #991B1B; font-weight: bold;">
                            نوع المزامنة: {sync_type_ar} ({sync_type_en})
                        </p>
                        <p style="margin: 10px 0 0 0; color: #991B1B;">
                            الوقت: {timestamp}
                        </p>
                    </div>
                    
                    <h3 style="color: #1A4D2E; margin-top: 20px;">رسالة الخطأ | Error Message</h3>
                    <div style="background-color: #FFF7ED; border: 1px solid #FED7AA; border-radius: 8px; padding: 15px;">
                        <code style="color: #9A3412; word-break: break-all;">{error_message}</code>
                    </div>
                    
                    {details_html}
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                        <p style="color: #666; font-size: 14px; margin: 0;">
                            يرجى التحقق من اتصال Rewaa وإعادة المحاولة من لوحة التحكم.
                        </p>
                        <p style="color: #666; font-size: 14px; margin: 10px 0 0 0;">
                            Please check Rewaa connection and retry from the admin panel.
                        </p>
                    </div>
                </div>
                
                <!-- Footer -->
                <div style="background-color: #1A4D2E; padding: 15px; text-align: center;">
                    <p style="color: #A7F3D0; margin: 0; font-size: 12px;">
                        تموينات واحة الريف للمواد الغذائية
                    </p>
                    <p style="color: #6EE7B7; margin: 5px 0 0 0; font-size: 11px;">
                        Al-Reef Oasis Groceries - Loyalty Program
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        
        params = {
            "from": SENDER_EMAIL,
            "to": [recipient_email],
            "subject": f"⚠️ فشل المزامنة مع Rewaa - {sync_type_ar} | Rewaa Sync Failed",
            "html": html_content
        }
        
        # Run sync SDK in thread to keep FastAPI non-blocking
        email_result = await asyncio.to_thread(resend.Emails.send, params)
        
        logger.info(f"Sync failure notification sent to {recipient_email}, email_id: {email_result.get('id')}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send sync failure notification: {str(e)}")
        return False


async def send_test_email(db, recipient_email: str = None):
    """
    Send a test email to verify the email configuration
    
    Args:
        db: MongoDB database instance
        recipient_email: Optional specific recipient, otherwise uses notification email
    """
    if not resend.api_key:
        return {"success": False, "error": "Resend API key not configured"}
    
    try:
        if not recipient_email:
            recipient_email = await get_notification_email(db)
        
        html_content = """
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
            <meta charset="UTF-8">
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px; margin: 0;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <div style="background-color: #1A4D2E; padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">✅ رسالة اختبار</h1>
                    <p style="color: #A7F3D0; margin: 10px 0 0 0;">Test Email</p>
                </div>
                <div style="padding: 30px; text-align: center;">
                    <p style="color: #333; font-size: 18px;">تم إعداد إشعارات البريد الإلكتروني بنجاح!</p>
                    <p style="color: #666; font-size: 14px;">Email notifications are configured successfully!</p>
                </div>
                <div style="background-color: #1A4D2E; padding: 15px; text-align: center;">
                    <p style="color: #A7F3D0; margin: 0; font-size: 12px;">تموينات واحة الريف للمواد الغذائية</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        params = {
            "from": SENDER_EMAIL,
            "to": [recipient_email],
            "subject": "✅ رسالة اختبار - تموينات واحة الريف | Test Email",
            "html": html_content
        }
        
        email_result = await asyncio.to_thread(resend.Emails.send, params)
        
        logger.info(f"Test email sent to {recipient_email}, email_id: {email_result.get('id')}")
        return {"success": True, "email_id": email_result.get("id"), "recipient": recipient_email}
        
    except Exception as e:
        logger.error(f"Failed to send test email: {str(e)}")
        return {"success": False, "error": str(e)}
