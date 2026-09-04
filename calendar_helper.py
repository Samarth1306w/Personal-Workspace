import os
import datetime
from dotenv import load_dotenv
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

load_dotenv('/workspaces/Personal-Workspace/.env')

SCOPES = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
]
TOKEN_PATH = '/workspaces/Personal-Workspace/token.json'

def get_calendar_service():
    creds = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)
    return build('calendar', 'v3', credentials=creds)

def list_upcoming_events(max_results=5):
    service = get_calendar_service()
    now = datetime.datetime.utcnow().isoformat() + 'Z'
    events_result = service.events().list(
        calendarId='primary',
        timeMin=now,
        maxResults=max_results,
        singleEvents=True,
        orderBy='startTime'
    ).execute()
    return events_result.get('items', [])

def create_discovery_call(client_name, client_email, start_iso_str, duration_minutes=30):
    service = get_calendar_service()
    start_dt = datetime.datetime.fromisoformat(start_iso_str)
    end_dt = start_dt + datetime.timedelta(minutes=duration_minutes)
    
    event = {
        'summary': f'AI Chatbot Discovery Call - {client_name} & Samarth',
        'description': f'Demo of custom AI Lead Qualification & Booking Chatbot for {client_name}.',
        'start': {
            'dateTime': start_dt.isoformat(),
            'timeZone': 'Asia/Kolkata',
        },
        'end': {
            'dateTime': end_dt.isoformat(),
            'timeZone': 'Asia/Kolkata',
        },
        'attendees': [
            {'email': client_email},
        ],
        'conferenceData': {
            'createRequest': {
                'requestId': f'meeting-{int(datetime.datetime.now().timestamp())}',
                'conferenceSolutionKey': {'type': 'hangoutsMeet'}
            }
        }
    }
    
    created_event = service.events().insert(
        calendarId='primary',
        body=event,
        conferenceDataVersion=1
    ).execute()
    
    meet_link = created_event.get('hangoutLink')
    print(f"✅ Meeting scheduled with {client_name}!")
    print(f"🔗 Google Meet Link: {meet_link}")
    return created_event

if __name__ == '__main__':
    events = list_upcoming_events()
    print(f"Upcoming events on calendar: {len(events)}")
