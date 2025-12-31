"""
Utility functions for phone number formatting
"""

def format_phone_for_twilio(phone: str) -> str:
    """
    Convert Saudi phone format (05xxxxxxxx) to international format (+966xxxxxxxx)
    """
    # Remove any spaces, dashes, or other characters
    phone = phone.strip().replace(' ', '').replace('-', '').replace('(', '').replace(')', '')
    
    # If starts with 05, replace with +9665
    if phone.startswith('05'):
        return '+966' + phone[1:]
    
    # If starts with 5, add +966
    elif phone.startswith('5') and len(phone) == 9:
        return '+966' + phone
    
    # If already has +966
    elif phone.startswith('+966'):
        return phone
    
    # If starts with 00966
    elif phone.startswith('00966'):
        return '+' + phone[2:]
    
    # If starts with 966
    elif phone.startswith('966') and not phone.startswith('+'):
        return '+' + phone
    
    # Default: return as is
    return phone

def format_phone_for_display(phone: str) -> str:
    """
    Convert international format (+966xxxxxxxx) to Saudi format (05xxxxxxxx) for display
    """
    phone = phone.strip()
    
    # If starts with +966, convert to 05
    if phone.startswith('+966'):
        return '0' + phone[4:]
    
    # If starts with 00966
    elif phone.startswith('00966'):
        return '0' + phone[5:]
    
    # If starts with 966 (no +)
    elif phone.startswith('966') and not phone.startswith('+'):
        return '0' + phone[3:]
    
    # Default: return as is
    return phone
