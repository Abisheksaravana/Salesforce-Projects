import type { Handler, HandlerEvent } from '@netlify/functions';
import jwt from 'jsonwebtoken';

// ─── Salesforce Auth (same pattern as portfolio-data) ─────────────────────────

interface SFToken {
  access_token: string;
  instance_url: string;
}

let cachedToken: SFToken | null = null;
let tokenExpiresAt = 0;

async function getSFToken(): Promise<SFToken> {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt) return cachedToken;

  const privateKey = process.env.SALESFORCE_PRIVATE_KEY!.replace(/\\n/g, '\n');

  const assertion = jwt.sign(
    {
      iss: process.env.SALESFORCE_CLIENT_ID!,
      sub: process.env.SALESFORCE_USERNAME!,
      aud: process.env.SALESFORCE_LOGIN_URL!,
      exp: Math.floor(now / 1000) + 300,
    },
    privateKey,
    { algorithm: 'RS256' }
  );

  const params = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion,
  });

  const res = await fetch(
    `${process.env.SALESFORCE_LOGIN_URL}/services/oauth2/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Salesforce auth failed: ${err}`);
  }

  cachedToken = await res.json();
  tokenExpiresAt = now + 110 * 60 * 1000;
  return cachedToken!;
}

// ─── Rate Limiting (in-memory, resets on cold start) ─────────────────────────

const recentSubmissions = new Map<string, number>();

function isRateLimited(ip: string): boolean {
  const last = recentSubmissions.get(ip);
  const now = Date.now();
  if (last && now - last < 60_000) return true;
  recentSubmissions.set(ip, now);
  return false;
}

// ─── Handler ──────────────────────────────────────────────────────────────────

const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const ip =
    event.headers['x-forwarded-for']?.split(',')[0]?.trim() ?? '127.0.0.1';

  if (isRateLimited(ip)) {
    return {
      statusCode: 429,
      body: JSON.stringify({ error: 'Too many requests. Please wait a minute.' }),
    };
  }

  let body: Record<string, string>;
  try {
    body = JSON.parse(event.body ?? '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { name, email, subject, message } = body;

  // Validation
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return {
      statusCode: 422,
      body: JSON.stringify({ error: 'Name, email, and message are required.' }),
    };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      statusCode: 422,
      body: JSON.stringify({ error: 'Invalid email address.' }),
    };
  }
  if (message.length > 5000) {
    return {
      statusCode: 422,
      body: JSON.stringify({ error: 'Message too long (max 5000 chars).' }),
    };
  }

  try {
    const token = await getSFToken();
    const url = `${token.instance_url}/services/data/v59.0/sobjects/Contact_Submission__c`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Name: name.trim().slice(0, 80),
        Email__c: email.trim(),
        Subject__c: (subject?.trim() || 'Portfolio Contact').slice(0, 255),
        Message__c: message.trim(),
        Submission_Date__c: new Date().toISOString(),
        Status__c: 'New',
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Salesforce create failed: ${err}`);
    }

    const result = (await res.json()) as { id: string; success: boolean };
    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'Message sent!', id: result.id }),
    };
  } catch (err) {
    console.error('[contact]', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to send message. Please try again.' }),
    };
  }
};

export { handler };
