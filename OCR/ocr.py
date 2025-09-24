import pytesseract
from PIL import Image
import re
import requests
import json
import os

# Regex patterns for field extraction and validation
# >>> EDIT HERE: If your certificate uses different field labels or formats, update these regexes
NAME_REGEX = re.compile(r'Name\s*[:\-]?\s*([A-Za-z ]{2,})', re.IGNORECASE)
ROLLNO_REGEX = re.compile(r'Roll\s*No\.?\s*[:\-]?\s*([A-Za-z0-9\-]{3,})', re.IGNORECASE)
CERTID_REGEX = re.compile(r'Certificate\s*ID\s*[:\-]?\s*([A-Za-z0-9\-]{5,})', re.IGNORECASE)

def extract_text_from_image(image_path):
    """Extract raw text from image using Tesseract OCR."""
    try:
        img = Image.open(image_path)
        text = pytesseract.image_to_string(img)
        return text
    except Exception as e:
        print(f"Error processing {image_path}: {e}")
        return ""

def clean_and_structure(text):
    """Extract and clean fields from OCR text, return as dict."""
    # >>> EDIT HERE: If your field extraction needs to be more robust, adjust the extraction logic
    name_match = NAME_REGEX.search(text)
    rollno_match = ROLLNO_REGEX.search(text)
    certid_match = CERTID_REGEX.search(text)

    data = {
        "Name": name_match.group(1).strip() if name_match else None,
        "RollNo": rollno_match.group(1).strip() if rollno_match else None,
        "CertificateID": certid_match.group(1).strip() if certid_match else None
    }
    return data

def detect_tampering(data):
    """Detect tampered fields using regex and formatting rules."""
    issues = []
    # >>> EDIT HERE: Adjust validation rules as per your certificate's expected formats
    # Name: Only alphabets and spaces, at least 2 chars
    if not data["Name"] or not re.fullmatch(r"[A-Za-z ]{2,}", data["Name"]):
        issues.append("Name field tampered or unreadable")
    # RollNo: Alphanumeric, 3-15 chars
    if not data["RollNo"] or not re.fullmatch(r"[A-Za-z0-9\-]{3,15}", data["RollNo"]):
        issues.append("RollNo field tampered or unreadable")
    # CertificateID: Alphanumeric, 5-20 chars
    if not data["CertificateID"] or not re.fullmatch(r"[A-Za-z0-9\-]{5,20}", data["CertificateID"]):
        issues.append("CertificateID field tampered or unreadable")
    return issues

def push_to_api(data, issues, api_url="https://example.com/api/test-certificate"):
    """Push results to test API endpoint."""
    # >>> EDIT HERE: Replace the api_url with your actual API endpoint
    payload = {
        "fields": data,
        "tampering_issues": issues
    }
    try:
        response = requests.post(api_url, json=payload)
        print(f"API Response: {response.status_code} {response.text}")
    except Exception as e:
        print(f"Failed to push to API: {e}")

def process_certificate(image_path):
    print(f"Processing: {image_path}")
    text = extract_text_from_image(image_path)
    data = clean_and_structure(text)
    issues = detect_tampering(data)
    print("Extracted Data:", json.dumps(data, indent=2))
    if issues:
        print("Tampering Issues Detected:", issues)
    else:
        print("No tampering detected.")
    # Push to test API endpoint
    push_to_api(data, issues)

if __name__ == "__main__":
    # >>> EDIT HERE: Replace these with the paths to your actual sample certificate images or PDFs
    sample_images = [
        "C:\\Users\\deepi\\Downloads\\SIH\\attachment_75456341-34be-44dc-8316-8758d7f4dc22_workshop-1024x791.webp",
        "sample_certificate2.png",
        "sample_certificate3.pdf"  # If PDF, convert to image first
    ]
    for img_path in sample_images:
        if img_path.lower().endswith('.pdf'):
            # Convert PDF to image (first page only)
            try:
                from pdf2image import convert_from_path
                pages = convert_from_path(img_path, first_page=1, last_page=1)
                temp_img = "temp_page1.jpg"
                pages[0].save(temp_img, 'JPEG')
                process_certificate(temp_img)
                os.remove(temp_img)
            except Exception as e:
                print(f"PDF conversion failed for {img_path}: {e}")
        else:
            process_certificate(img_path)
