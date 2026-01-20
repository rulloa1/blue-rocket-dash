// Google Sheets Service
// Uses Google Sheets REST API directly (npm packages have compatibility issues with Deno)

export interface SheetRow {
  rowIndex: number;
  agent_name?: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  brokerage?: string;
  city?: string;
  preferred_template?: string;
}

export class SheetService {
  private sheetId: string;
  private accessToken: string | null = null;

  constructor(sheetId: string) {
    this.sheetId = sheetId;
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken) return this.accessToken;

    const serviceAccountStr = Deno.env.get("GOOGLE_SERVICE_ACCOUNT");
    const clientEmail = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_EMAIL") || Deno.env.get("CLIENT_EMAIL");
    const privateKey = Deno.env.get("GOOGLE_PRIVATE_KEY") || Deno.env.get("PRIVATE_KEY");

    let email = clientEmail;
    let key = privateKey;

    if (serviceAccountStr) {
      try {
        const parsed = JSON.parse(serviceAccountStr);
        email = parsed.client_email;
        key = parsed.private_key;
      } catch {
        throw new Error("Invalid GOOGLE_SERVICE_ACCOUNT JSON");
      }
    }

    if (!email || !key) {
      throw new Error("Missing Google credentials");
    }

    const formattedKey = key.replace(/\\n/g, '\n');

    // Create JWT
    const now = Math.floor(Date.now() / 1000);
    const header = { alg: "RS256", typ: "JWT" };
    const payload = {
      iss: email,
      scope: "https://www.googleapis.com/auth/spreadsheets",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    };

    const pemHeader = "-----BEGIN PRIVATE KEY-----";
    const pemFooter = "-----END PRIVATE KEY-----";
    const pemContents = formattedKey.replace(pemHeader, "").replace(pemFooter, "").replace(/\s/g, "");
    const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

    const cryptoKey = await crypto.subtle.importKey(
      "pkcs8",
      binaryKey,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const base64url = (data: string) => btoa(data).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const encoder = new TextEncoder();

    const headerB64 = base64url(JSON.stringify(header));
    const payloadB64 = base64url(JSON.stringify(payload));
    const signatureInput = encoder.encode(`${headerB64}.${payloadB64}`);

    const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, signatureInput);
    const signatureB64 = base64url(String.fromCharCode(...new Uint8Array(signature)));

    const jwt = `${headerB64}.${payloadB64}.${signatureB64}`;

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      throw new Error("Failed to get access token");
    }

    this.accessToken = tokenData.access_token;
    return this.accessToken as string;
  }

  async getNewLeads(sheetName: string = "Sheet1"): Promise<SheetRow[]> {
    const token = await this.getAccessToken();
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}/values/${encodeURIComponent(sheetName)}!A1:Z1000`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();
    if (!data.values || data.values.length < 2) {
      return [];
    }

    const [headers, ...rows] = data.values;
    const getIndex = (name: string) => headers.findIndex((h: string) => h.toLowerCase() === name.toLowerCase());

    const statusIdx = getIndex('status');
    const nameIdx = getIndex('agent name') !== -1 ? getIndex('agent name') : getIndex('name');
    const emailIdx = getIndex('email');
    const phoneIdx = getIndex('phone');
    const linkedinIdx = getIndex('linkedin') !== -1 ? getIndex('linkedin') : getIndex('website url');
    const brokerageIdx = getIndex('brokerage');
    const cityIdx = getIndex('city');
    const templateIdx = getIndex('template');

    return rows
      .map((row: string[], index: number) => ({
        rowIndex: index + 2, // +2 for header row and 0-indexing
        status: statusIdx >= 0 ? row[statusIdx] : undefined,
        agent_name: nameIdx >= 0 ? row[nameIdx] : undefined,
        email: emailIdx >= 0 ? row[emailIdx] : undefined,
        phone: phoneIdx >= 0 ? row[phoneIdx] : undefined,
        linkedin_url: linkedinIdx >= 0 ? row[linkedinIdx] : undefined,
        brokerage: brokerageIdx >= 0 ? row[brokerageIdx] : undefined,
        city: cityIdx >= 0 ? row[cityIdx] : undefined,
        preferred_template: templateIdx >= 0 ? row[templateIdx] : undefined,
      }))
      .filter((row: SheetRow & { status?: string }) => !row.status || row.status === 'New Lead');
  }

  async updateRowStatus(rowIndex: number, status: string, sheetName: string = "Sheet1", extraData?: Record<string, string>): Promise<void> {
    const token = await this.getAccessToken();
    
    // First get headers to find status column
    const headersUrl = `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}/values/${encodeURIComponent(sheetName)}!1:1`;
    const headersResponse = await fetch(headersUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const headersData = await headersResponse.json();
    const headers = headersData.values?.[0] || [];
    
    const statusIdx = headers.findIndex((h: string) => h.toLowerCase() === 'status');
    if (statusIdx === -1) {
      console.warn("No status column found");
      return;
    }

    const statusCol = String.fromCharCode(65 + statusIdx); // A=65
    const range = `${sheetName}!${statusCol}${rowIndex}`;
    
    const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}/values/${encodeURIComponent(range)}?valueInputOption=RAW`;
    await fetch(updateUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        values: [[status]],
      }),
    });

    // Handle extra data if provided
    if (extraData) {
      for (const [key, value] of Object.entries(extraData)) {
        const colIdx = headers.findIndex((h: string) => h.toLowerCase() === key.toLowerCase());
        if (colIdx !== -1) {
          const col = String.fromCharCode(65 + colIdx);
          const extraRange = `${sheetName}!${col}${rowIndex}`;
          const extraUrl = `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}/values/${encodeURIComponent(extraRange)}?valueInputOption=RAW`;
          await fetch(extraUrl, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              values: [[value]],
            }),
          });
        }
      }
    }
  }
}
