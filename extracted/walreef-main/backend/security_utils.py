"""
Security utilities for password validation, JWT generation, etc.
"""

import re
import secrets
import string
from typing import Tuple


def generate_strong_secret(length: int = 64) -> str:
    """Generate a cryptographically strong random secret"""
    alphabet = string.ascii_letters + string.digits + string.punctuation
    return ''.join(secrets.choice(alphabet) for _ in range(length))


def validate_password_strength(password: str) -> Tuple[bool, str]:
    """
    Validate password strength
    
    Requirements:
    - At least 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit
    - At least one special character
    
    Returns:
        (is_valid, error_message)
    """
    if len(password) < 8:
        return False, "كلمة المرور يجب أن تكون 8 أحرف على الأقل | Password must be at least 8 characters"
    
    if not re.search(r'[A-Z]', password):
        return False, "كلمة المرور يجب أن تحتوي على حرف كبير | Password must contain an uppercase letter"
    
    if not re.search(r'[a-z]', password):
        return False, "كلمة المرور يجب أن تحتوي على حرف صغير | Password must contain a lowercase letter"
    
    if not re.search(r'\d', password):
        return False, "كلمة المرور يجب أن تحتوي على رقم | Password must contain a digit"
    
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False, "كلمة المرور يجب أن تحتوي على رمز خاص | Password must contain a special character"
    
    # Check for common passwords
    common_passwords = [
        '12345678', 'password', 'Password1', 'Admin123', 'Qwerty123',
        '123456789', 'password1', 'admin123', 'Admin@123'
    ]
    
    if password in common_passwords:
        return False, "كلمة المرور ضعيفة جداً، اختر كلمة مرور أقوى | Password is too weak, choose a stronger one"
    
    return True, ""


def validate_phone_number(phone: str) -> Tuple[bool, str]:
    """
    Validate Saudi phone number
    
    Accepts formats:
    - 05XXXXXXXX
    - 5XXXXXXXX
    - +9665XXXXXXXX
    - 9665XXXXXXXX
    
    Returns:
        (is_valid, error_message)
    """
    # Remove spaces and dashes
    phone = phone.replace(' ', '').replace('-', '')
    
    # Check patterns
    patterns = [
        r'^05\d{8}$',           # 05XXXXXXXX
        r'^5\d{8}$',            # 5XXXXXXXX
        r'^\+9665\d{8}$',       # +9665XXXXXXXX
        r'^9665\d{8}$'          # 9665XXXXXXXX
    ]
    
    for pattern in patterns:
        if re.match(pattern, phone):
            return True, ""
    
    return False, "رقم جوال غير صحيح | Invalid phone number format"


def sanitize_input(text: str, max_length: int = 1000) -> str:
    """
    Sanitize text input to prevent NoSQL injection and XSS
    
    Args:
        text: Input text
        max_length: Maximum allowed length
        
    Returns:
        Sanitized text
    """
    if not text:
        return ""
    
    # Limit length
    text = text[:max_length]
    
    # Remove null bytes
    text = text.replace('\x00', '')
    
    # Remove potential MongoDB operators
    dangerous_patterns = ['$where', '$regex', '$ne', '$gt', '$lt', '$gte', '$lte', '$in', '$nin']
    for pattern in dangerous_patterns:
        text = text.replace(pattern, '')
    
    return text.strip()


def validate_points_amount(points: float, max_points: float = 10000) -> Tuple[bool, str]:
    """
    Validate points amount
    
    Args:
        points: Points to validate
        max_points: Maximum allowed points in single operation
        
    Returns:
        (is_valid, error_message)
    """
    if points <= 0:
        return False, "النقاط يجب أن تكون أكبر من صفر | Points must be greater than zero"
    
    if points > max_points:
        return False, f"الحد الأقصى للنقاط هو {max_points} | Maximum points is {max_points}"
    
    # Check for unrealistic decimal precision (possible manipulation)
    if len(str(points).split('.')[-1]) > 2:
        return False, "النقاط يجب أن تكون برقمين عشريين كحد أقصى | Points must have at most 2 decimal places"
    
    return True, ""


def mask_sensitive_data(data: str, visible_chars: int = 4) -> str:
    """
    Mask sensitive data (phone, email, etc.)
    
    Examples:
        0551234567 -> 055****567
        user@example.com -> u***@example.com
    """
    if not data or len(data) <= visible_chars * 2:
        return data
    
    if '@' in data:  # Email
        local, domain = data.split('@')
        if len(local) > 2:
            return f"{local[0]}***{local[-1]}@{domain}"
        return data
    else:  # Phone or other
        return f"{data[:visible_chars]}****{data[-visible_chars:]}"
