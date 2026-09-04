import os
import json
from google_auth_oauthlib.flow import InstalledAppFlow
from google.oauth2.credentials import Credentials

SCOPES = [
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
]

CREDENTIALS_FILE = '/workspaces/Personal-Workspace/credentials.json'
TOKEN_FILE = '/workspaces/Personal-Workspace/token.json'

def authenticate():
    creds = None
    if os.path.exists(TOKEN_FILE):
        try:
            creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)
        except Exception:
            creds = None

    if not creds or not creds.valid:
        flow = InstalledAppFlow.from_client_secrets_file(
            CREDENTIALS_FILE,
            SCOPES,
            redirect_uri='http://localhost:8080/'
        )
        
        auth_url, _ = flow.authorization_url(
            access_type='offline',
            prompt='consent',
            include_granted_scopes='true'
        )
        
        print("\n" + "="*70)
        print("🔗 GOOGLE AUTHENTICATION REQUIRED")
        print("="*70)
        print("1. Open this link in your browser to authorize:")
        print("\n" + auth_url + "\n")
        print("="*70)
        print("Waiting for authentication on http://localhost:8080/ ...")
        
        try:
            creds = flow.run_local_server(
                host='0.0.0.0',
                port=8080,
                open_browser=False,
                timeout_seconds=120
            )
        except Exception as e:
            print(f"Local server stopped or timed out: {e}")
            return None

        with open(TOKEN_FILE, 'w') as token:
            token.write(creds.to_json())
        print("✅ Authentication successful! token.json created.")
        
    return creds

if __name__ == '__main__':
    authenticate()
