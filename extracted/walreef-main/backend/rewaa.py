import httpx
import os
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any
import asyncio
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

class RewaaService:
    def __init__(self):
        self.base_url = os.getenv('REWAA_API_BASE_URL', 'https://api.platform.rewaatech.com')
        self.email = os.getenv('REWAA_EMAIL')
        self.password = os.getenv('REWAA_PASSWORD')
        self.id_token: Optional[str] = None
        self.token_expires_at: Optional[datetime] = None
    
    async def authenticate(self) -> bool:
        """
        Authenticate with Rewaa API and get idToken
        """
        try:
            if not self.email or not self.password:
                print("Rewaa credentials not configured")
                return False
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/authenticate",
                    json={
                        "email": self.email,
                        "password": self.password
                    },
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    self.id_token = data.get('idToken')
                    # Token expires in 1 hour, we'll refresh at 55 minutes
                    self.token_expires_at = datetime.now(timezone.utc) + timedelta(minutes=55)
                    print(f"Rewaa authentication successful. Token expires at {self.token_expires_at}")
                    return True
                else:
                    print(f"Rewaa authentication failed: {response.status_code}")
                    return False
        except Exception as e:
            print(f"Error authenticating with Rewaa: {e}")
            return False
    
    async def is_token_valid(self) -> bool:
        """
        Check if current token is still valid
        """
        if not self.id_token or not self.token_expires_at:
            return False
        return datetime.now(timezone.utc) < self.token_expires_at
    
    async def ensure_authenticated(self) -> bool:
        """
        Ensure we have a valid token, refresh if needed
        """
        if not await self.is_token_valid():
            return await self.authenticate()
        return True
    
    async def get_next_customer_code(self) -> Optional[str]:
        """
        Get next available customer code from Rewaa
        """
        try:
            if not await self.ensure_authenticated():
                return None
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/customers/nextCode",
                    headers={"Authorization": f"Bearer {self.id_token}"},
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return data.get('code')  # The response has 'code' not 'nextCode'
                else:
                    print(f"Failed to get next customer code: {response.status_code}")
                    return None
        except Exception as e:
            print(f"Error getting next customer code from Rewaa: {e}")
            return None
    
    async def create_customer(self, name: str, mobile: str, email: str) -> Optional[Dict[str, Any]]:
        """
        Create a customer in Rewaa system
        """
        try:
            if not await self.ensure_authenticated():
                return None
            
            # Get next customer code
            customer_code = await self.get_next_customer_code()
            if not customer_code:
                print("Failed to get next customer code")
                return None
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/customers",
                    json={
                        "code": customer_code,
                        "name": name,
                        "mobileNumber": mobile,
                        "email": email
                    },
                    headers={"Authorization": f"Bearer {self.id_token}"},
                    timeout=30.0
                )
                
                if response.status_code in [200, 201]:
                    print(f"✓ Customer created in Rewaa: {name} ({mobile})")
                    return response.json()
                else:
                    error_msg = f"Failed to create customer in Rewaa: {response.status_code}"
                    try:
                        error_data = response.json()
                        error_msg = f"{error_msg} - {error_data}"
                    except:
                        error_msg = f"{error_msg} - {response.text}"
                    print(error_msg)
                    return None
        except Exception as e:
            print(f"Error creating customer in Rewaa: {e}")
            return None
    
    async def get_customer_by_mobile(self, mobile: str) -> Optional[Dict[str, Any]]:
        """
        Get customer by mobile number from Rewaa
        """
        try:
            if not await self.ensure_authenticated():
                return None
            
            # Remove + from mobile if present
            mobile_clean = mobile.replace('+', '')
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/customers/getByMobile/{mobile_clean}",
                    headers={"Authorization": f"Bearer {self.id_token}"},
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    return response.json()
                elif response.status_code == 404:
                    return None  # Customer not found
                else:
                    print(f"Failed to get customer by mobile {mobile}: {response.status_code}")
                    return None
        except Exception as e:
            print(f"Error getting customer from Rewaa: {e}")
            return None
    
    async def get_invoice_by_number(self, invoice_number: int) -> Optional[Dict[str, Any]]:
        """
        Get invoice by invoice number from Rewaa
        """
        try:
            if not await self.ensure_authenticated():
                return None
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/pos/invoices/{invoice_number}",
                    headers={"Authorization": f"Bearer {self.id_token}"},
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    return response.json()
                elif response.status_code == 404:
                    return None  # Invoice not found
                else:
                    print(f"Failed to get invoice {invoice_number}: {response.status_code}")
                    return None
        except Exception as e:
            print(f"Error getting invoice from Rewaa: {e}")
            return None

# Global instance
rewaa_service = RewaaService()