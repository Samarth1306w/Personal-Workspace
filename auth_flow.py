import sys
import os
import urllib.parse
from http.server import HTTPServer, BaseHTTPRequestHandler
from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = [
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
]

CREDENTIALS_FILE = '/workspaces/Personal-Workspace/credentials.json'
TOKEN_FILE = '/workspaces/Personal-Workspace/token.json'
PORT = 8080
REDIRECT_URI = f'http://localhost:{PORT}/'

class OAuthCallbackHandler(BaseHTTPRequestHandler):
    auth_code = None
    
    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        params = urllib.parse.parse_qs(parsed.query)
        
        if 'code' in params:
            OAuthCallbackHandler.auth_code = params['code'][0]
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(b"<h1>Authentication Successful!</h1><p>You can now close this tab and return to Antigravity.</p>")
        else:
            self.send_response(400)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(b"<h1>Authentication Failed</h1><p>No code parameter found.</p>")
            
    def log_message(self, format, *args):
        pass  # Quiet logging

def main():
    flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_FILE, SCOPES)
    flow.redirect_uri = REDIRECT_URI
    
    # Check if user passed redirected URL as an argument
    if len(sys.argv) > 1 and ("code=" in sys.argv[1] or sys.argv[1].startswith("http")):
        raw_input = sys.argv[1]
        print(f"Parsing response: {raw_input[:60]}...")
        if "code=" in raw_input:
            parsed = urllib.parse.urlparse(raw_input)
            params = urllib.parse.parse_qs(parsed.query)
            code = params.get('code', [None])[0] or raw_input.split("code=")[1].split("&")[0]
        else:
            code = raw_input
        
        flow.fetch_token(code=code)
        with open(TOKEN_FILE, 'w') as f:
            f.write(flow.credentials.to_json())
        print(" Successfully generated token.json via manual code!")
        return

    auth_url, _ = flow.authorization_url(
        access_type='offline',
        prompt='consent',
        include_granted_scopes='true'
    )
    
    print("=" * 70)
    print(" AUTHORIZE GOOGLE ACCESS")
    print("=" * 70)
    print("Click this link in your browser:")
    print(auth_url)
    print("=" * 70)
    print(f"Waiting for callback on port {PORT}...")
    
    server = HTTPServer(('0.0.0.0', PORT), OAuthCallbackHandler)
    server.timeout = 180
    
    while OAuthCallbackHandler.auth_code is None:
        server.handle_request()
        if OAuthCallbackHandler.auth_code:
            break

    if OAuthCallbackHandler.auth_code:
        print("Callback received! Exchanging token...")
        flow.fetch_token(code=OAuthCallbackHandler.auth_code)
        with open(TOKEN_FILE, 'w') as f:
            f.write(flow.credentials.to_json())
        print(" Successfully generated token.json!")
    else:
        print("Timed out waiting for authentication callback.")

if __name__ == '__main__':
    main()
