"""
Audit Logging System
Tracks all critical operations for security and compliance
"""

from datetime import datetime, timezone
from typing import Optional, Dict, Any
import uuid
from motor.motor_asyncio import AsyncIOMotorDatabase
import logging

logger = logging.getLogger(__name__)


class AuditLogger:
    """Audit logger for tracking critical operations"""
    
    @staticmethod
    async def log(
        db: AsyncIOMotorDatabase,
        action: str,
        actor_id: str,
        actor_type: str,  # 'admin', 'staff', 'customer', 'system'
        actor_name: str,
        target_id: Optional[str] = None,
        target_type: Optional[str] = None,  # 'customer', 'points', 'invoice', etc.
        details: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
        severity: str = "info"  # 'info', 'warning', 'critical'
    ):
        """
        Log an audit event
        
        Args:
            action: Action performed (e.g., 'add_points', 'redeem_points', 'delete_customer')
            actor_id: ID of who performed the action
            actor_type: Type of actor
            actor_name: Name of actor
            target_id: ID of affected entity
            target_type: Type of affected entity
            details: Additional details about the action
            ip_address: IP address of the actor
            severity: Severity level
        """
        try:
            audit_log = {
                "id": str(uuid.uuid4()),
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "action": action,
                "actor": {
                    "id": actor_id,
                    "type": actor_type,
                    "name": actor_name
                },
                "target": {
                    "id": target_id,
                    "type": target_type
                } if target_id else None,
                "details": details or {},
                "ip_address": ip_address,
                "severity": severity
            }
            
            await db.audit_logs.insert_one(audit_log)
            
            # Log critical actions to system logger as well
            if severity == "critical":
                logger.warning(f"CRITICAL AUDIT: {action} by {actor_name} ({actor_type}) on {target_type}:{target_id}")
                
        except Exception as e:
            # Don't fail the main operation if audit logging fails
            logger.error(f"Failed to write audit log: {e}")
    
    @staticmethod
    async def get_logs(
        db: AsyncIOMotorDatabase,
        actor_id: Optional[str] = None,
        target_id: Optional[str] = None,
        action: Optional[str] = None,
        severity: Optional[str] = None,
        limit: int = 100,
        skip: int = 0
    ) -> list:
        """Query audit logs with filters"""
        try:
            query = {}
            
            if actor_id:
                query["actor.id"] = actor_id
            if target_id:
                query["target.id"] = target_id
            if action:
                query["action"] = action
            if severity:
                query["severity"] = severity
            
            logs = await db.audit_logs.find(
                query,
                {"_id": 0}
            ).sort("timestamp", -1).skip(skip).limit(limit).to_list(limit)
            
            return logs
        except Exception as e:
            logger.error(f"Failed to query audit logs: {e}")
            return []
    
    @staticmethod
    async def get_user_activity(
        db: AsyncIOMotorDatabase,
        user_id: str,
        days: int = 30
    ) -> Dict[str, Any]:
        """Get activity summary for a user"""
        try:
            from datetime import timedelta
            cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
            
            pipeline = [
                {
                    "$match": {
                        "actor.id": user_id,
                        "timestamp": {"$gte": cutoff}
                    }
                },
                {
                    "$group": {
                        "_id": "$action",
                        "count": {"$sum": 1}
                    }
                }
            ]
            
            results = await db.audit_logs.aggregate(pipeline).to_list(100)
            
            activity = {item["_id"]: item["count"] for item in results}
            return activity
        except Exception as e:
            logger.error(f"Failed to get user activity: {e}")
            return {}


# Audit action types (for consistency)
class AuditActions:
    # Points operations
    ADD_POINTS = "add_points"
    REDEEM_POINTS = "redeem_points"
    ADJUST_POINTS = "adjust_points"
    EXPIRE_POINTS = "expire_points"
    
    # Customer operations
    CREATE_CUSTOMER = "create_customer"
    UPDATE_CUSTOMER = "update_customer"
    DELETE_CUSTOMER = "delete_customer"
    SUSPEND_CUSTOMER = "suspend_customer"
    ACTIVATE_CUSTOMER = "activate_customer"
    
    # Admin operations
    CREATE_ADMIN = "create_admin"
    DELETE_ADMIN = "delete_admin"
    UPDATE_SETTINGS = "update_settings"
    
    # Authentication
    LOGIN_SUCCESS = "login_success"
    LOGIN_FAILED = "login_failed"
    OTP_SENT = "otp_sent"
    OTP_VERIFIED = "otp_verified"
    OTP_FAILED = "otp_failed"
    
    # System operations
    SYNC_INVOICES = "sync_invoices"
    SYSTEM_ERROR = "system_error"
