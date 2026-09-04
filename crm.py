import os
import json
from dotenv import load_dotenv
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

load_dotenv('/workspaces/Personal-Workspace/.env')

SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
TOKEN_PATH = '/workspaces/Personal-Workspace/token.json'
SHEET_ID = os.getenv('CRM_SHEET_ID')

def get_sheets_service():
    creds = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)
    return build('sheets', 'v4', credentials=creds)

def add_lead(business_name, contact_name, role, email, phone, city, niche, website, ai_hook, status="New Lead", notes=""):
    service = get_sheets_service()
    row = [[
        business_name, contact_name, role, email, phone,
        city, niche, website, ai_hook, status, "", notes
    ]]
    body = {'values': row}
    result = service.spreadsheets().values().append(
        spreadsheetId=SHEET_ID,
        range='Leads & Outreach!A:L',
        valueInputOption='RAW',
        insertDataOption='INSERT_ROWS',
        body=body
    ).execute()
    print(f"✅ Lead '{business_name}' added to CRM!")
    return result

def get_all_leads():
    service = get_sheets_service()
    result = service.spreadsheets().values().get(
        spreadsheetId=SHEET_ID,
        range='Leads & Outreach!A2:L'
    ).execute()
    rows = result.get('values', [])
    return rows

if __name__ == '__main__':
    leads = get_all_leads()
    print(f"CRM Currently has {len(leads)} leads.")
