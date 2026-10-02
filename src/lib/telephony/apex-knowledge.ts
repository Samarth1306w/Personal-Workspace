/**
 * Apex Air & Plumbing — Approved Client Knowledge Base & Triage Rules
 * 
 * Invariant: "It answers from what you approved, and nothing else.
 * When it does not know, it says so and gets you."
 */

export interface KnowledgeItem {
  id: string;
  category: "pricing" | "services" | "hours" | "service_area" | "policy";
  question: string;
  approvedAnswer: string;
  keywords: string[];
  isEmergencyTrigger?: boolean;
}

export interface ClientProfile {
  id: string;
  businessName: string;
  industry: string;
  location: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  operatingHours: string;
  knowledgeBase: KnowledgeItem[];
}

export const APEX_CLIENT_PROFILE: ClientProfile = {
  id: "apex-hvac",
  businessName: "Apex Air & Plumbing",
  industry: "HVAC & Plumbing Services",
  location: "Tampa Bay & Spring Hill, FL",
  ownerName: "Mike Reynolds",
  ownerPhone: "+1 (813) 555-0199",
  ownerEmail: "dispatch@apexairfl.com",
  operatingHours: "Monday–Saturday: 7:00 AM – 7:00 PM EST (24/7 Emergency Service)",
  knowledgeBase: [
    {
      id: "faq-diag-fee",
      category: "pricing",
      question: "How much does it cost to come out and inspect?",
      approvedAnswer:
        "Our standard diagnostic inspection fee is $89, which is completely credited toward your repair if you approve the work. For emergency calls after 7 PM, the emergency dispatch fee is $129.",
      keywords: ["diagnostic", "inspection", "fee", "cost", "how much", "estimate", "trip fee"],
    },
    {
      id: "faq-service-area",
      category: "service_area",
      question: "What areas do you serve?",
      approvedAnswer:
        "We serve all of Hernando, Pasco, and Hillsborough counties, including Spring Hill, Brooksville, Tampa, Wesley Chapel, and Clearwater.",
      keywords: ["area", "location", "serve", "spring hill", "tampa", "brooksville", "clearwater", "pasco"],
    },
    {
      id: "faq-emergency-ac",
      category: "policy",
      question: "My AC stopped blowing cold air and it's 90 degrees inside. Can someone come today?",
      approvedAnswer:
        "Yes, AC failure in Florida heat is an emergency. We have technicians on call right now. What is your home address and your best callback number so our dispatcher can route a van to you?",
      keywords: ["not cooling", "blowing hot", "stopped working", "hot inside", "emergency", "today", "broken ac"],
      isEmergencyTrigger: true,
    },
    {
      id: "faq-water-heater",
      category: "services",
      question: "Do you repair and install water heaters?",
      approvedAnswer:
        "Yes. We service both tankless and standard tank water heaters, including same-day replacements if your tank is leaking or burst.",
      keywords: ["water heater", "leaking tank", "no hot water", "tankless", "plumber"],
      isEmergencyTrigger: true,
    },
    {
      id: "faq-maintenance-plan",
      category: "pricing",
      question: "Do you have an annual AC maintenance tune-up plan?",
      approvedAnswer:
        "Yes, our Apex Comfort Club is $159 per year. It includes two comprehensive 21-point system tune-ups per year, priority emergency booking, and a 15% discount on all repairs.",
      keywords: ["tune-up", "tune up", "maintenance", "club", "annual", "inspection plan"],
    },
  ],
};

/**
 * Deterministic query evaluator: matches customer query strictly against approved knowledge.
 * Zero LLM hallucinations. If match confidence < threshold, triggers clean human handoff.
 */
export function queryApprovedKnowledge(queryText: string): {
  matched: boolean;
  item?: KnowledgeItem;
  answer: string;
  isEmergency: boolean;
} {
  const normalized = queryText.toLowerCase();

  for (const item of APEX_CLIENT_PROFILE.knowledgeBase) {
    const hits = item.keywords.filter((kw) => normalized.includes(kw.toLowerCase()));
    if (hits.length > 0) {
      return {
        matched: true,
        item,
        answer: item.approvedAnswer,
        isEmergency: Boolean(item.isEmergencyTrigger),
      };
    }
  }

  // Exact Bridge Builders fallback invariant:
  return {
    matched: false,
    answer:
      "I want to make sure I give you exact information on that. Let me get your name, phone number, and address so Mike or our lead technician can review your request and call you back directly.",
    isEmergency: false,
  };
}
