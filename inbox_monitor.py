import os
from dotenv import load_dotenv
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from crm import get_all_leads, get_sheets_service

load_dotenv('/workspaces/Personal-Workspace/.env')

SCOPES = [
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/spreadsheets'
]
TOKEN_PATH = '/workspaces/Personal-Workspace/token.json'
SHEET_ID = os.getenv('CRM_SHEET_ID')

def check_for_replies():
    creds = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)
    gmail_service = build('gmail', 'v1', credentials=creds)
    sheets_service = build('sheets', 'v4', credentials=creds)
    
    leads = get_all_leads()
    print(f"🔍 Monitoring inbox for replies across {len(leads)} leads...\n")
    
    replies_found = 0
    for idx, lead in enumerate(leads):
        if len(lead) < 4:
            continue
        clinic_name = lead[0]
        email = lead[3]
        status = lead[9] if len(lead) > 9 else ""
        
        if "samarth" in email.lower():
            continue  # skip test lead
            
        query = f"from:{email}"
        results = gmail_service.users().messages().list(userId='me', q=query).execute()
        messages = results.get('messages', [])
        
        if messages:
            msg = gmail_service.users().messages().get(userId='me', id=messages[0]['id']).execute()
            snippet = msg.get('snippet', '')
            print(f"🔔 NEW REPLY FROM {clinic_name} ({email})!")
            print(f"   Snippet: {snippet[:120]}...")
            
            # Update CRM row status to 'Replied'
            row_num = idx + 2
            sheets_service.spreadsheets().values().update(
                spreadsheetId=SHEET_ID,
                range=f'Leads & Outreach!J{row_num}',
                valueInputOption='RAW',
                body={'values': [['Replied - Action Needed!']]}
            ).execute()
            replies_found += 1
            
    if replies_found == 0:
        print("No new replies yet. (Clinics usually check email between 10 AM and 6 PM).")

if __name__ == '__main__':
    check_for_replies()
