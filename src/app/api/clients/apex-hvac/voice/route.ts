import { NextRequest, NextResponse } from "next/server";
import {
  createConsentSession,
  getConsentSession,
  generateConsentNoticeTwiml,
  evaluateConsentInput,
} from "@/lib/telephony/consent-gate";
import { APEX_CLIENT_PROFILE } from "@/lib/telephony/apex-knowledge";

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // Twilio sends payload as application/x-www-form-urlencoded or JSON
    const formData = await req.formData().catch(() => null);
    const callSid = (formData?.get("CallSid") as string) || `call_${Date.now()}`;
    const fromPhone = (formData?.get("From") as string) || "Unknown Caller";
    const digits = (formData?.get("Digits") as string) || "";

    // 1. Initial Inbound Call Webhook
    if (!action || action === "incoming") {
      const session = createConsentSession(callSid, fromPhone, APEX_CLIENT_PROFILE.businessName);
      const twiml = generateConsentNoticeTwiml(session);

      return new NextResponse(twiml, {
        status: 200,
        headers: { "Content-Type": "text/xml" },
      });
    }

    // 2. Caller Pressed a Key on Dialpad (Consent Response)
    if (action === "consent_response") {
      const evaluation = evaluateConsentInput(callSid, digits, APEX_CLIENT_PROFILE.ownerPhone);

      return new NextResponse(evaluation.twiml, {
        status: 200,
        headers: { "Content-Type": "text/xml" },
      });
    }

    // 3. Caller Timed Out Without Input (Fail-closed invariant)
    if (action === "consent_timeout") {
      const fallbackTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna-Neural">We did not receive your selection. Connecting you directly to Mike Reynolds on our emergency dispatch line.</Say>
  <Dial timeout="25" record="false">${APEX_CLIENT_PROFILE.ownerPhone}</Dial>
</Response>`.trim();

      return new NextResponse(fallbackTwiml, {
        status: 200,
        headers: { "Content-Type": "text/xml" },
      });
    }

    return new NextResponse("<Response><Hangup /></Response>", {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  } catch (err: unknown) {
    console.error("[Apex Voice Webhook Error]:", err);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><Response><Say>Connecting your call directly.</Say><Dial>${APEX_CLIENT_PROFILE.ownerPhone}</Dial></Response>`,
      { status: 200, headers: { "Content-Type": "text/xml" } }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "online",
    client: APEX_CLIENT_PROFILE.businessName,
    owner: APEX_CLIENT_PROFILE.ownerName,
    fallbackPhone: APEX_CLIENT_PROFILE.ownerPhone,
    consentCompliance: "FL-2Party-Active",
    engine: "Twilio-Voice-Edge-Wrangler",
  });
}
