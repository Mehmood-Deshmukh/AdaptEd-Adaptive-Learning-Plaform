import re

def sanitize_input(input_text: str) -> str:
    """Sanitize input text by removing HTML tags and excessive whitespace"""
    clean_text = re.sub(r'<[^>]*>', '', input_text)
    clean_text = re.sub(r'\s+', ' ', clean_text).strip()
    return clean_text