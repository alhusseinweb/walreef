#!/usr/bin/env python3
"""
Unit Tests for Return Invoices Feature
Tests the return invoice processing logic in cron_jobs.py
"""

import unittest
import asyncio
import sys
import os
from pathlib import Path
from datetime import datetime, timezone, timedelta
from unittest.mock import AsyncMock, MagicMock, patch

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from cron_jobs import sync_invoices_once
from models import Customer, PointsTransaction

class TestReturnInvoices(unittest.TestCase):
    """Test return invoice processing logic"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.mock_db = MagicMock()
        
        # Mock settings
        self.mock_db.settings.find_one = AsyncMock()
        self.mock_db.settings.update_one = AsyncMock()
        
        # Mock customers collection
        self.mock_db.customers.find_one = AsyncMock()
        self.mock_db.customers.insert_one = AsyncMock()
        self.mock_db.customers.update_one = AsyncMock()
        
        # Mock invoices collection
        self.mock_db.invoices.find_one = AsyncMock()
        self.mock_db.invoices.insert_one = AsyncMock()
        
        # Mock points transactions collection
        self.mock_db.points_transactions.insert_one = AsyncMock()
        
        # Mock existing customer
        self.mock_customer = {
            "id": "test-customer-123",
            "name": "Test Customer",
            "phone": "+966501234567",
            "email": "test@example.com",
            "active_points": 100.0,
            "total_points": 100.0
        }
    
    async def test_normal_invoice_processing(self):
        """Test normal invoice processing (positive points)"""
        print("🧪 Testing Normal Invoice Processing...")
        
        # Mock settings responses
        self.mock_db.settings.find_one.side_effect = [
            {"value": "true"},  # sync_enabled
            {"value": "160110"},  # last_synced_invoice
            {"value": "10"}  # points_multiplier
        ]
        
        # Mock customer exists
        self.mock_db.customers.find_one.return_value = self.mock_customer
        
        # Mock no existing invoice
        self.mock_db.invoices.find_one.return_value = None
        
        # Mock normal invoice data from Rewaa
        normal_invoice = {
            "id": 160111,
            "totalTaxInclusive": 100.0,
            "mobileNumber": "+966501234567",
            "completeDate": "2025-01-01T10:00:00Z",
            "isReturnInvoice": False  # Normal invoice
        }
        
        with patch('cron_jobs.rewaa_service') as mock_rewaa:
            # Mock Rewaa service responses
            mock_rewaa.get_invoice_by_number.side_effect = [
                normal_invoice,  # First invoice found
                None  # No more invoices (triggers max_failures)
            ]
            
            # Run sync
            result = await sync_invoices_once(self.mock_db)
            
            # Verify results
            self.assertEqual(result["status"], "success")
            self.assertEqual(result["synced_count"], 1)
            
            # Verify invoice was saved with correct data
            invoice_call = self.mock_db.invoices.insert_one.call_args[0][0]
            self.assertEqual(invoice_call["invoice_number"], 160111)
            self.assertEqual(invoice_call["total_amount"], 100.0)
            self.assertEqual(invoice_call["points_earned"], 10.0)  # 100/10 = 10 points
            self.assertEqual(invoice_call["is_return"], False)
            
            # Verify transaction was created with positive points
            trans_call = self.mock_db.points_transactions.insert_one.call_args[0][0]
            self.assertEqual(trans_call["transaction_type"], "earned")
            self.assertEqual(trans_call["points"], 10.0)  # Positive points
            self.assertIn("فاتورة رقم 160111", trans_call["description"])
            
            # Verify customer points were increased
            customer_update_call = self.mock_db.customers.update_one.call_args[0][1]
            self.assertEqual(customer_update_call["$inc"]["active_points"], 10.0)
            self.assertEqual(customer_update_call["$inc"]["total_points"], 10.0)
            
            print("✅ Normal invoice processing test passed")
    
    async def test_return_invoice_processing(self):
        """Test return invoice processing (negative points)"""
        print("🧪 Testing Return Invoice Processing...")
        
        # Mock settings responses
        self.mock_db.settings.find_one.side_effect = [
            {"value": "true"},  # sync_enabled
            {"value": "160110"},  # last_synced_invoice
            {"value": "10"}  # points_multiplier
        ]
        
        # Mock customer exists
        self.mock_db.customers.find_one.return_value = self.mock_customer
        
        # Mock no existing invoice
        self.mock_db.invoices.find_one.return_value = None
        
        # Mock return invoice data from Rewaa
        return_invoice = {
            "id": 160112,
            "totalTaxInclusive": 50.0,
            "mobileNumber": "+966501234567",
            "completeDate": "2025-01-01T11:00:00Z",
            "isReturnInvoice": True  # Return invoice
        }
        
        with patch('cron_jobs.rewaa_service') as mock_rewaa:
            # Mock Rewaa service responses
            mock_rewaa.get_invoice_by_number.side_effect = [
                return_invoice,  # Return invoice found
                None  # No more invoices
            ]
            
            # Run sync
            result = await sync_invoices_once(self.mock_db)
            
            # Verify results
            self.assertEqual(result["status"], "success")
            self.assertEqual(result["synced_count"], 1)
            
            # Verify invoice was saved with correct return data
            invoice_call = self.mock_db.invoices.insert_one.call_args[0][0]
            self.assertEqual(invoice_call["invoice_number"], 160112)
            self.assertEqual(invoice_call["total_amount"], 50.0)
            self.assertEqual(invoice_call["points_earned"], -5.0)  # Negative points for return
            self.assertEqual(invoice_call["is_return"], True)
            
            # Verify transaction was created with negative points and correct type
            trans_call = self.mock_db.points_transactions.insert_one.call_args[0][0]
            self.assertEqual(trans_call["transaction_type"], "returned")  # Return type
            self.assertEqual(trans_call["points"], -5.0)  # Negative points
            self.assertIn("رجيع فاتورة رقم 160112", trans_call["description"])
            self.assertNotIn("expires_at", trans_call)  # No expiry for return transactions
            
            # Verify customer points were decreased
            customer_update_call = self.mock_db.customers.update_one.call_args[0][1]
            self.assertEqual(customer_update_call["$inc"]["active_points"], -5.0)
            self.assertEqual(customer_update_call["$inc"]["total_points"], -5.0)
            
            print("✅ Return invoice processing test passed")
    
    async def test_mixed_invoices_processing(self):
        """Test processing both normal and return invoices in sequence"""
        print("🧪 Testing Mixed Invoices Processing...")
        
        # Mock settings responses (multiple calls)
        settings_responses = [
            {"value": "true"},   # sync_enabled
            {"value": "160110"}, # last_synced_invoice
            {"value": "10"},     # points_multiplier (normal invoice)
            {"value": "10"},     # points_multiplier (return invoice)
        ]
        self.mock_db.settings.find_one.side_effect = settings_responses
        
        # Mock customer exists
        self.mock_db.customers.find_one.return_value = self.mock_customer
        
        # Mock no existing invoices
        self.mock_db.invoices.find_one.return_value = None
        
        # Mock mixed invoice data
        normal_invoice = {
            "id": 160111,
            "totalTaxInclusive": 80.0,
            "mobileNumber": "+966501234567",
            "completeDate": "2025-01-01T10:00:00Z",
            "isReturnInvoice": False
        }
        
        return_invoice = {
            "id": 160112,
            "totalTaxInclusive": 30.0,
            "mobileNumber": "+966501234567",
            "completeDate": "2025-01-01T11:00:00Z",
            "isReturnInvoice": True
        }
        
        with patch('cron_jobs.rewaa_service') as mock_rewaa:
            # Mock sequence: normal, return, then no more
            mock_rewaa.get_invoice_by_number.side_effect = [
                normal_invoice,
                return_invoice,
                None, None, None, None, None, None, None, None, None  # Trigger max_failures
            ]
            
            # Run sync
            result = await sync_invoices_once(self.mock_db)
            
            # Verify results
            self.assertEqual(result["status"], "success")
            self.assertEqual(result["synced_count"], 2)
            
            # Verify both invoices were processed
            self.assertEqual(self.mock_db.invoices.insert_one.call_count, 2)
            self.assertEqual(self.mock_db.points_transactions.insert_one.call_count, 2)
            self.assertEqual(self.mock_db.customers.update_one.call_count, 2)
            
            print("✅ Mixed invoices processing test passed")

def run_async_test(test_method):
    """Helper to run async test methods"""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(test_method())
    finally:
        loop.close()

def main():
    """Run all return invoice tests"""
    print("🔴 Return Invoices Unit Tests")
    print("=" * 50)
    
    test_instance = TestReturnInvoices()
    test_instance.setUp()
    
    tests = [
        ("Normal Invoice Processing", test_instance.test_normal_invoice_processing),
        ("Return Invoice Processing", test_instance.test_return_invoice_processing),
        ("Mixed Invoices Processing", test_instance.test_mixed_invoices_processing)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_method in tests:
        try:
            print(f"\n🧪 Running: {test_name}")
            run_async_test(test_method)
            passed += 1
            print(f"✅ {test_name}: PASSED")
        except Exception as e:
            print(f"❌ {test_name}: FAILED - {str(e)}")
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} passed")
    
    if passed == total:
        print("🎉 All return invoice tests passed!")
        return True
    else:
        print(f"⚠️ {total - passed} test(s) failed!")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)