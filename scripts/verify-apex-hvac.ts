import {
  createConsentSession,
  generateConsentNoticeTwiml,
  evaluateConsentInput,
  handleMidCallRevocation,
} from "../src/lib/telephony/consent-gate";
import { queryApprovedKnowledge, APEX_CLIENT_PROFILE } from "../src/lib/telephony/apex-knowledge";

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, notes?: string) {
  if (condition) {
    console.log(`  ✔ PASS: ${testName} ${notes ? `(${notes})` : ""}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName} ${notes ? `(${notes})` : ""}`);
    failed++;
  }
}

async function runVerification() {
  console.log("==================================================");
  console.log("🔍 Verifying Apex Air & Plumbing Client Deployment");
  console.log("==================================================\n");

  // Suite 1: Telephony Consent Gate (Matthew Ferrill compliance model)
  console.log("Suite 1: Florida Two-Party Consent Gate Invariants");
  const callSid = "CA_test_call_94821";
  const callerPhone = "+18134928812";
  const session = createConsentSession(callSid, callerPhone, APEX_CLIENT_PROFILE.businessName);

  assert(session.status === "PENDING_NOTICE", "Fail-closed session initialization");
  assert(session.noticeText.includes("AI receptionist"), "Notice discloses AI usage up front");

  const noticeTwiml = generateConsentNoticeTwiml(session);
  assert(noticeTwiml.includes("<Gather numDigits=\"1\""), "Gather expects single DTMF digit");
  assert(noticeTwiml.includes("action=\"/api/clients/apex-hvac/voice?action=consent_response\""), "Action URL points to consent endpoint");

  // Test DTMF 1 (User presses 1 -> Consent Granted)
  const consentEvaluation = evaluateConsentInput(callSid, "1", APEX_CLIENT_PROFILE.ownerPhone);
  assert(consentEvaluation.allowed === true, "DTMF 1 grants consent");
  assert(consentEvaluation.status === "CONSENT_GRANTED", "Status moves to CONSENT_GRANTED");
  assert(
    consentEvaluation.twiml.includes("<Connect>") && consentEvaluation.twiml.includes("<Stream"),
    "TwiML bridges to live audio WebSocket stream"
  );

  // Test DTMF 2 (User presses 2 -> Refuses AI recording, transfers to human)
  const callSidRefuse = "CA_refuse_call_102";
  createConsentSession(callSidRefuse, "+18135559999", APEX_CLIENT_PROFILE.businessName);
  const refuseEvaluation = evaluateConsentInput(callSidRefuse, "2", APEX_CLIENT_PROFILE.ownerPhone);
  assert(refuseEvaluation.allowed === false, "DTMF 2 blocks AI recording");
  assert(refuseEvaluation.status === "CONSENT_REVOKED", "Status is marked CONSENT_REVOKED");
  assert(refuseEvaluation.twiml.includes("<Dial timeout=\"25\" record=\"false\">"), "Direct human dial with record=false");

  // Test Mid-Call Revocation (Caller presses 9 mid-call)
  const midCallTwiml = handleMidCallRevocation(callSid, APEX_CLIENT_PROFILE.ownerPhone);
  assert(midCallTwiml.includes("Transferring to our human team"), "Mid-call DTMF 9 triggers instant human fallback");

  // Suite 2: Approved Knowledge Base (Zero-Hallucination Invariant)
  console.log("\nSuite 2: Approved Knowledge Base & Human Handoff");

  const pricingQuery = queryApprovedKnowledge("how much is your diagnostic fee?");
  assert(pricingQuery.matched === true, "Matches diagnostic fee question");
  assert(pricingQuery.answer.includes("$89"), "Returns exact approved $89 price");

  const emergencyQuery = queryApprovedKnowledge("my AC stopped cooling today");
  assert(emergencyQuery.matched === true, "Recognizes AC breakdown");
  assert(emergencyQuery.isEmergency === true, "Flags inquiry as emergency van dispatch");

  const unapprovedQuery = queryApprovedKnowledge("can you pump my septic tank?");
  assert(unapprovedQuery.matched === false, "Refuses unapproved service question");
  assert(unapprovedQuery.answer.includes("make sure I give you exact information"), "Triggers clean human callback handoff");

  console.log("\n==================================================");
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
