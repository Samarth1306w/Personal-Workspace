import sys
import os
import urllib.parse
import threading
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
VERIFIER_FILE = '/workspaces/Personal-Workspace/.code_verifier'
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
            self.wfile.write(b"<h1>Authentication Successful!</h1><p>You can close this tab and return to chat.</p>")
        else:
            self.send_response(400)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(b"<h1>Authentication Failed</h1>")
            
    def log_message(self, format, *args):
        pass

def exchange_code(flow, code):
    flow.fetch_token(code=code)
    with open(TOKEN_FILE, 'w') as f:
        f.write(flow.credentials.to_json())
    if os.path.exists(VERIFIER_FILE):
        os.remove(VERIFIER_FILE)
    print("SUCCESS: token.json generated!")

def main():
    flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_FILE, SCOPES)
    flow.redirect_uri = REDIRECT_URI

    # If called with an argument (pasted URL or code)
    if len(sys.argv) > 1:
        raw_arg = sys.argv[1].strip()
        code = None
        if "code=" in raw_arg:
            parsed = urllib.parse.urlparse(raw_arg)
            params = urllib.parse.parse_qs(parsed.query)
            code = params.get('code', [None])[0]
        else:
            code = raw_arg
            
        if os.path.exists(VERIFIER_FILE):
            with open(VERIFIER_FILE, 'r') as vf:
                flow.code_verifier = vf.read().strip()
                
        exchange_code(flow, code)
        return

    # Fresh URL generation
    auth_url, _ = flow.authorization_url(
        access_type='offline',
        prompt='consent',
        include_granted_scopes='true'
    )
    
    # Save the code_verifier
    with open(VERIFIER_FILE, 'w') as vf:
        vf.write(flow.code_verifier)

    print("\n" + "="*70)
    print("👉 AUTH_URL_START")
    print(auth_url)
    print("👈 AUTH_URL_END")
    print("="*70 + "\n")
    print(f"Waiting for automatic browser callback on port {PORT}...")
    
    server = HTTPServer(('0.0.0.0', PORT), OAuthCallbackHandler)
    server.timeout = 180
    
    while OAuthCallbackHandler.auth_code is None:
        server.handle_request()
        if OAuthCallbackHandler.auth_code:
            break

    if OAuthCallbackHandler.auth_code:
        exchange_code(flow, OAuthCallbackHandler.auth_code)
    else:
        print("Automatic listener timed out. If redirected, paste the URL here.")

if __name__ == '__main__':
    main()
