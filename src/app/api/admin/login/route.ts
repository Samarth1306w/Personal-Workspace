import { NextRequest, NextResponse } from "next/server";
import { authenticateAdmin } from "@/lib/auth-service";
import { logAuditAction } from "@/lib/data-service";
import { getClientIp, checkRateLimit, recordFailure, clearRateLimit } from "@/lib/rate-limiter";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rateLimitKey = `login_${ip}`;

  // 1. Check rate limit / brute-force lockout (max 5 failed attempts per 15 min)
  const rateStatus = await checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000, { increment: false });
  if (!rateStatus.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: `Too many failed login attempts. Access temporarily locked for ${Math.ceil(rateStatus.resetSeconds / 60)} more minutes.`,
        retryAfter: rateStatus.resetSeconds,
      },
      {
        status: 429,
        headers: {
          "Retry-After": rateStatus.resetSeconds.toString(),
        },
      }
    );
  }

  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password/master key are required." },
        { status: 400 }
      );
    }

    const trimmedEmail = typeof email === "string" ? email.trim() : "";
    const result = await authenticateAdmin(trimmedEmail, password);

    if (!result.success) {
      // Record failure against IP rate limiter
      const updatedStatus = await recordFailure(rateLimitKey, 15 * 60 * 1000);

      // Log security audit event
      await logAuditAction("FAILED_LOGIN_ATTEMPT", "AUTH", trimmedEmail, trimmedEmail, {
        ip,
        userAgent: req.headers.get("user-agent") || "unknown",
        attemptsRemaining: updatedStatus.remainingAttempts,
      });

      const remainingMsg =
        updatedStatus.remainingAttempts > 0
          ? ` (${updatedStatus.remainingAttempts} attempts remaining before temporary lockout)`
          : ` (Locked out for 15 minutes)`;

      return NextResponse.json(
        {
          success: false,
          error: (result.error || "Authentication failed.") + remainingMsg,
          attemptsRemaining: updatedStatus.remainingAttempts,
        },
        { status: 401 }
      );
    }

    // Clear rate limit upon successful authentication
    await clearRateLimit(rateLimitKey);

    // Record successful login audit event
    await logAuditAction("ADMIN_LOGIN_SUCCESS", "AUTH", trimmedEmail, trimmedEmail, {
      ip,
      userAgent: req.headers.get("user-agent") || "unknown",
    });

    return NextResponse.json({
      success: true,
      message: "Welcome to SAM CODES Command Center.",
    });
  } catch (err) {
    console.error("[Login] Internal error:", err);
    return NextResponse.json(
      { success: false, error: "Internal authentication error. Please try again." },
      { status: 500 }
    );
  }
}
