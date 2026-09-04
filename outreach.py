import os
import base64
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

load_dotenv('/workspaces/Personal-Workspace/.env')

SCOPES = [
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.send'
]
TOKEN_PATH = '/workspaces/Personal-Workspace/token.json'

def get_gmail_service():
    creds = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)
    return build('gmail', 'v1', credentials=creds)

def create_message(to, subject, message_text):
    message = MIMEMultipart()
    message['to'] = to
    message['from'] = 'me'
    message['subject'] = subject
    msg = MIMEText(message_text, 'plain')
    message.attach(msg)
    raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
    return {'raw': raw}

def create_gmail_draft(to_email, subject, body_text):
    service = get_gmail_service()
    message = create_message(to_email, subject, body_text)
    draft = service.users().drafts().create(
        userId='me',
        body={'message': message}
    ).execute()
    print(f"✅ Draft created for {to_email} (Draft ID: {draft['id']})")
    return draft

def send_gmail_message(to_email, subject, body_text):
    service = get_gmail_service()
    message = create_message(to_email, subject, body_text)
    sent = service.users().messages().send(
        userId='me',
        body=message
    ).execute()
    print(f"🚀 Email sent to {to_email} (Message ID: {sent['id']})")
    return sent

def generate_pitch(contact_name, business_name, niche, city, pain_point=None):
    first_name = contact_name.split()[0] if contact_name else "there"
    
    if "dental" in niche.lower() or "clinic" in niche.lower() or "doctor" in niche.lower():
        subject = f"Question regarding after-hours patient inquiries for {business_name}"
        hook = f"noticed {business_name} has a strong reputation in {city}, but a lot of patients searching for consultations after 7 PM or on weekends end up dropping off if they don't get an immediate response."
        benefit = "an automated 24/7 AI Receptionist that handles patient inquiries, explains procedure pricing, and books appointments directly into your schedule via WhatsApp and your website"
    elif "real estate" in niche.lower() or "property" in niche.lower():
        subject = f"Instant inquiry lead capture for {business_name}"
        hook = f"came across {business_name}'s properties in {city}. High-value buyers browsing listings late in the evening usually lose interest if they have to wait until the next morning for brochures or pricing."
        benefit = "a 24/7 AI Lead Assistant that answers property questions, qualifies budgets, and captures verified WhatsApp numbers instantly"
    else:
        subject = f"Quick question regarding {business_name}'s website inquiries"
        hook = f"came across {business_name} in {city} and saw the great work you are doing."
        benefit = "a 24/7 AI Assistant that qualifies visitors, answers common questions, and captures leads automatically"

    body = f"""Hi {first_name},

I {hook}

We build {benefit}.

For businesses in {city}, this typically captures 30-40% more qualified bookings with zero extra staff or manual effort.

I put together a quick 1-minute interactive test link where you can test the chatbot on your phone and see how it works for {business_name}.

No calls needed—if you would like to test it out, just reply "DEMO" to this email (or ping me on WhatsApp) and I'll send over the preview link.

Best regards,
Samarth Nimangre
Founder, Samarth Automations
WhatsApp (Chat Only): +91 6361209256
UPI: 6361209256@ibl
"""
    return subject, body

if __name__ == '__main__':
    s, b = generate_pitch("Dr. Sharma", "SmileCare Dental Clinic", "Dental Clinic", "Bangalore")
    print("SUBJECT:", s)
    print("\nBODY:\n", b)
