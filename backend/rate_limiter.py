"""
Rate Limiting Middleware for FastAPI
Protects against brute force and DDoS attacks
"""

from fastapi import Request, HTTPException
from collections import defaultdict
from datetime import datetime, timedelta
import asyncio
from typing import Dict, Tuple

class RateLimiter:
    def __init__(self):
        # Store: {ip_address: {endpoint: [(timestamp, count)]}}
        self.requests: Dict[str, Dict[str, list]] = defaultdict(lambda: defaultdict(list))
        self.lock = asyncio.Lock()
        
        # Rate limits per endpoint (requests, time_window_seconds)
        self.limits = {
            "/api/auth/customer/send-otp": (5, 900),  # 5 requests per 15 minutes
            "/api/auth/admin/verify-otp": (5, 300),   # 5 attempts per 5 minutes
            "/api/auth/customer/verify-otp": (5, 300), # 5 attempts per 5 minutes
            "/api/auth/admin/login": (5, 300),         # 5 attempts per 5 minutes
            "/api/auth/check-admin-phone": (5, 900),   # 5 requests per 15 minutes
            "/api/redeem/verify-and-redeem": (3, 300), # 3 redemptions per 5 minutes
            "default": (100, 60)                        # 100 requests per minute for other endpoints
        }
    
    def _get_client_ip(self, request: Request) -> str:
        """Get client IP from request, considering proxy headers"""
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"
    
    def _clean_old_requests(self, ip: str, endpoint: str, window_seconds: int):
        """Remove requests older than the time window"""
        cutoff = datetime.now() - timedelta(seconds=window_seconds)
        self.requests[ip][endpoint] = [
            req for req in self.requests[ip][endpoint]
            if req[0] > cutoff
        ]
    
    async def check_rate_limit(self, request: Request) -> bool:
        """
        Check if request exceeds rate limit
        Returns True if allowed, raises HTTPException if rate limited
        """
        async with self.lock:
            ip = self._get_client_ip(request)
            endpoint = request.url.path
            
            # Get rate limit for this endpoint
            max_requests, window_seconds = self.limits.get(
                endpoint, 
                self.limits["default"]
            )
            
            # Clean old requests
            self._clean_old_requests(ip, endpoint, window_seconds)
            
            # Get current request count
            current_requests = self.requests[ip][endpoint]
            request_count = len(current_requests)
            
            # Check if rate limit exceeded
            if request_count >= max_requests:
                # Calculate reset time
                oldest_request = current_requests[0][0]
                reset_time = oldest_request + timedelta(seconds=window_seconds)
                wait_seconds = int((reset_time - datetime.now()).total_seconds())
                
                raise HTTPException(
                    status_code=429,
                    detail=f"تم تجاوز الحد المسموح. حاول مرة أخرى بعد {wait_seconds} ثانية | Rate limit exceeded. Try again in {wait_seconds} seconds",
                    headers={"Retry-After": str(wait_seconds)}
                )
            
            # Add current request
            self.requests[ip][endpoint].append((datetime.now(), 1))
            return True
    
    async def reset_rate_limit(self, ip: str, endpoint: str):
        """Reset rate limit for specific IP and endpoint (useful after successful auth)"""
        async with self.lock:
            if ip in self.requests and endpoint in self.requests[ip]:
                self.requests[ip][endpoint] = []
    
    def get_remaining_attempts(self, request: Request) -> Tuple[int, int]:
        """Get remaining attempts for current request"""
        ip = self._get_client_ip(request)
        endpoint = request.url.path
        
        max_requests, window_seconds = self.limits.get(
            endpoint,
            self.limits["default"]
        )
        
        self._clean_old_requests(ip, endpoint, window_seconds)
        current_count = len(self.requests[ip][endpoint])
        remaining = max(0, max_requests - current_count)
        
        return remaining, max_requests


# Global rate limiter instance
rate_limiter = RateLimiter()
