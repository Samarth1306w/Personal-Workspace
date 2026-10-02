import { NextRequest, NextResponse } from "next/server";
import { createInquiry } from "@/lib/data-service";
import { notifyAdminOnTelegram } from "@/lib/telegram/client";
import { sendInquiryEmailNotification } from "@/lib/email/resend";
import { getClientIp, checkRateLimit, recordFailure } from "@/lib/rate-limiter";

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rateLimitKey = `contact_${ip}`;

  // Rate limit: max 5 contact inquiries per 10 minutes per IP
  const rateStatus = await checkRateLimit(rateLimitKey, 5, 10 * 60 * 1000);
  if (!rateStatus.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: `Submission rate limit exceeded. Please wait ${Math.ceil(rateStatus.resetSeconds / 60)} minutes before sending another inquiry.`,
      },
      {
        status: 429,
        headers: { "Retry-After": rateStatus.resetSeconds.toString() },
      }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    await recordFailure(rateLimitKey, 10 * 60 * 1000);
    return NextResponse.json(
      { success: false, error: "Invalid JSON request body." },
      { status: 400 }
    );
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    await recordFailure(rateLimitKey, 10 * 60 * 1000);
    return NextResponse.json(
      { success: false, error: "Invalid request payload format." },
      { status: 400 }
    );
  }

  try {
    // Honeypot anti-spam check
    if (body.website_trap || body._gotcha) {
      return NextResponse.json({ success: true, message: "Inquiry received." });
    }

    const { name, email, contactMethod, serviceRequested, message } = body;

    // Validate name
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      await recordFailure(rateLimitKey, 10 * 60 * 1000);
      return NextResponse.json({ success: false, error: "Please provide your name (at least 2 characters)." }, { status: 400 });
    }

    // Validate email if provided
    const cleanEmail = typeof email === "string" && email.trim() ? email.trim() : undefined;
    if (cleanEmail && !EMAIL_REGEX.test(cleanEmail)) {
      await recordFailure(rateLimitKey, 10 * 60 * 1000);
      return NextResponse.json({ success: false, error: "Please provide a valid email address." }, { status: 400 });
    }

    // Validate message
    if (!message || typeof message !== "string" || message.trim().length < 5) {
      await recordFailure(rateLimitKey, 10 * 60 * 1000);
      return NextResponse.json({ success: false, error: "Please provide a descriptive message (at least 5 characters)." }, { status: 400 });
    }

    const savedInquiry = await createInquiry({
      name: name.trim().slice(0, 150),
      email: cleanEmail ? cleanEmail.slice(0, 150) : undefined,
      contactMethod: contactMethod && typeof contactMethod === "string" ? contactMethod.trim().slice(0, 100) : "Direct Form",
      serviceRequested: serviceRequested && typeof serviceRequested === "string" ? serviceRequested.trim().slice(0, 150) : "General Inquiry",
      message: message.trim().slice(0, 5000),
    });

    // 1. Notify Samarth instantly via Email (Resend)
    void sendInquiryEmailNotification({
      inquiryId: savedInquiry.id,
      name: savedInquiry.name,
      email: savedInquiry.email,
      serviceRequested: savedInquiry.serviceRequested,
      message: savedInquiry.message,
      contactMethod: savedInquiry.contactMethod,
      ip,
    });

    // 2. Notify Samarth instantly on his Telegram chat
    void notifyAdminOnTelegram({
      id: savedInquiry.id,
      name: savedInquiry.name,
      service: savedInquiry.serviceRequested,
      contact: savedInquiry.email || savedInquiry.contactMethod,
      brief: savedInquiry.message,
    });

    return NextResponse.json({
      success: true,
      message: "Thank you, Sam has received your message and will review it shortly.",
      inquiryId: savedInquiry.id,
    });
  } catch (err) {
    console.error("[Contact API] Error submitting inquiry:", err);
    return NextResponse.json(
      { success: false, error: "Unable to process inquiry at this moment. Please reach out directly." },
      { status: 500 }
    );
  }
}
