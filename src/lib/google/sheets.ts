export interface CrmLeadEntry {
  inquiryId?: string;
  name: string;
  email?: string;
  phoneOrHandle?: string;
  serviceRequested: string;
  budget?: string;
  message: string;
  source?: "portfolio-web" | "telegram-bot" | "whatsapp-bridge" | "outreach";
  status?: "NEW" | "QUALIFIED" | "PITCHED" | "WON" | "LOST";
  createdAt?: string;
}

export interface SheetsSyncResult {
  success: boolean;
  rowAppended?: boolean;
  error?: string;
}

/**
 * Appends a lead row directly to Google Sheets CRM.
 * Supports:
 * 1. Google Apps Script Webhook URL (GOOGLE_SHEETS_WEBHOOK_URL) - zero OAuth hassle, permanent lifetime.
 * 2. Google Sheets API v4 REST endpoint if an access token or service account is configured.
 */
export async function appendLeadToGoogleSheet(lead: CrmLeadEntry): Promise<SheetsSyncResult> {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL || process.env.CRM_SHEET_URL;

  // If a webhook URL is configured (e.g. from Google Apps Script web app):
  if (webhookUrl && webhookUrl.includes("script.google.com")) {
    try {
      const payload = {
        timestamp: lead.createdAt || new Date().toISOString(),
        inquiryId: lead.inquiryId || `inq_${Date.now()}`,
        name: lead.name,
        email: lead.email || "N/A",
        phoneOrHandle: lead.phoneOrHandle || "N/A",
        serviceRequested: lead.serviceRequested,
        budget: lead.budget || "Flexible",
        message: lead.message,
        source: lead.source || "portfolio-web",
        status: lead.status || "NEW",
      };

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { success: false, error: `Webhook responded with status ${response.status}: ${errorText}` };
      }

      return { success: true, rowAppended: true };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return { success: false, error: errorMsg };
    }
  }

  // If Google OAuth2 access token is available:
  const accessToken = process.env.GOOGLE_ACCESS_TOKEN;
  const spreadsheetId = process.env.CRM_SHEET_ID;

  if (accessToken && spreadsheetId) {
    try {
      const range = "Leads!A:J";
      const values = [
        [
          lead.createdAt || new Date().toISOString(),
          lead.inquiryId || `inq_${Date.now()}`,
          lead.name,
          lead.email || "N/A",
          lead.phoneOrHandle || "N/A",
          lead.serviceRequested,
          lead.budget || "Flexible",
          lead.message,
          lead.source || "portfolio-web",
          lead.status || "NEW",
        ],
      ];

      const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ values }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { success: false, error: `Sheets API error ${response.status}: ${errorText}` };
      }

      return { success: true, rowAppended: true };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return { success: false, error: errorMsg };
    }
  }

  return {
    success: false,
    error: "No Google Sheets webhook or credentials configured (set GOOGLE_SHEETS_WEBHOOK_URL or CRM_SHEET_ID).",
  };
}
