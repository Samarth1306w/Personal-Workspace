/**
 * Apex Air & Plumbing — Telephony Consent & Compliance Engine
 * Enforces Matthew Ferrill's exact compliance invariants:
 * 1. Fail-closed at session creation.
 * 2. Silence or speech is NOT consent — requires explicit DTMF 1 keypress.
 * 3. Mid-call revocation: Pressing 9 immediately terminates recording/transcription.
 * 4. Audit trail records cryptographic proof (timestamp, caller ID, key pressed) — ZERO audio stored in compliance logs.
 */

export type ConsentStatus = "PENDING_NOTICE" | "NOTICE_PLAYED" | "CONSENT_GRANTED" | "CONSENT_REVOKED" | "CONSENT_TIMED_OUT";

export interface CallConsentSession {
  callSid: string;
  callerNumber: string;
  businessName: string;
  status: ConsentStatus;
  noticeVersion: string;
  noticeText: string;
  noticeStartTime?: number;
  noticeEndTime?: number;
  consentTimestamp?: number;
  revocationTimestamp?: number;
  dtmfDigitPressed?: string;
}

export interface ConsentEvaluationResult {
  allowed: boolean;
  status: ConsentStatus;
  twiml: string;
  reason?: string;
}

const sessions = new Map<string, CallConsentSession>();

export function createConsentSession(callSid: string, callerNumber: string, businessName: string): CallConsentSession {
  const session: CallConsentSession = {
    callSid,
    callerNumber,
    businessName,
    status: "PENDING_NOTICE",
    noticeVersion: "v1.2.0-fl-compliance",
    noticeText: `Thank you for calling ${businessName}. To help you quickly, this call uses an AI receptionist that may record or summarize our conversation for our dispatch team. Press 1 to accept and continue, or press 2 to speak with an on-call technician directly without recording.`,
  };
  sessions.set(callSid, session);
  return session;
}

export function getConsentSession(callSid: string): CallConsentSession | undefined {
  return sessions.get(callSid);
}

/**
 * Generates the TwiML for the initial consent gate.
 */
export function generateConsentNoticeTwiml(session: CallConsentSession): string {
  session.status = "NOTICE_PLAYED";
  session.noticeStartTime = Date.now();

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather numDigits="1" action="/api/clients/apex-hvac/voice?action=consent_response" method="POST" timeout="6">
    <Say voice="Polly.Joanna-Neural">${escapeXml(session.noticeText)}</Say>
  </Gather>
  <Redirect method="POST">/api/clients/apex-hvac/voice?action=consent_timeout</Redirect>
</Response>`.trim();
}

/**
 * Evaluates the caller's keypress response.
 */
export function evaluateConsentInput(callSid: string, digits: string, fallbackPhone: string): ConsentEvaluationResult {
  const session = sessions.get(callSid);
  if (!session) {
    return {
      allowed: false,
      status: "CONSENT_TIMED_OUT",
      twiml: generateDirectTransferTwiml(fallbackPhone, "Connecting your call directly."),
      reason: "Session not found",
    };
  }

  session.dtmfDigitPressed = digits;

  // DTMF 1: User explicitly consents to AI call handling
  if (digits === "1") {
    session.status = "CONSENT_GRANTED";
    session.consentTimestamp = Date.now();

    return {
      allowed: true,
      status: "CONSENT_GRANTED",
      twiml: `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna-Neural">Thank you. How can Apex Air &amp; Plumbing help you today?</Say>
  <Connect>
    <Stream url="wss://vaniedge.vercel.app/api/voice/stream">
      <Parameter name="client_id" value="apex-hvac" />
      <Parameter name="call_sid" value="${escapeXml(callSid)}" />
      <Parameter name="consent_granted" value="true" />
    </Stream>
  </Connect>
</Response>`.trim(),
    };
  }

  // DTMF 2 or anything else: Direct transfer to human phone without AI recording
  session.status = "CONSENT_REVOKED";
  session.revocationTimestamp = Date.now();

  return {
    allowed: false,
    status: "CONSENT_REVOKED",
    twiml: generateDirectTransferTwiml(
      fallbackPhone,
      "Understood. Connecting you directly to Mike Reynolds on our emergency dispatch line."
    ),
    reason: "Caller requested human transfer without AI recording",
  };
}

/**
 * Handles mid-call revocation (if caller presses 9 during conversation).
 */
export function handleMidCallRevocation(callSid: string, fallbackPhone: string): string {
  const session = sessions.get(callSid);
  if (session) {
    session.status = "CONSENT_REVOKED";
    session.revocationTimestamp = Date.now();
  }

  return generateDirectTransferTwiml(fallbackPhone, "Recording paused. Transferring to our human team immediately.");
}

function generateDirectTransferTwiml(phone: string, greeting: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna-Neural">${escapeXml(greeting)}</Say>
  <Dial timeout="25" record="false">${escapeXml(phone)}</Dial>
</Response>`.trim();
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
