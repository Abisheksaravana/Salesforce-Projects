import type { Handler, HandlerEvent } from '@netlify/functions';
import jwt from 'jsonwebtoken';

// ─── Salesforce Auth (same JWT pattern as portfolio-data / contact) ───────────

interface SFToken {
  access_token: string;
  instance_url: string;
}

let cachedToken: SFToken | null = null;
let tokenExpiresAt = 0;

async function getSFToken(): Promise<SFToken> {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt) return cachedToken;

  const privateKey = process.env.SALESFORCE_PRIVATE_KEY!
    .replace(/^['"]|['"]$/g, '')
    .replace(/\\n/g, '\n');

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

// ─── Rate Limiting (per-IP, in-memory) ────────────────────────────────────────

const ipMessageCount = new Map<string, { count: number; windowStart: number }>();
const WINDOW_MS = 60_000;
const MAX_MESSAGES_PER_WINDOW = 20;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipMessageCount.get(ip);
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    ipMessageCount.set(ip, { count: 1, windowStart: now });
    return false;
  }
  if (entry.count >= MAX_MESSAGES_PER_WINDOW) return true;
  entry.count += 1;
  return false;
}

// ─── Agentforce API helpers ───────────────────────────────────────────────────

const SF_API_VERSION = 'v62.0';

function agentBaseUrl(instanceUrl: string, agentId: string) {
  return `${instanceUrl}/services/data/${SF_API_VERSION}/einstein/ai-assist/agents/${agentId}`;
}

async function createSession(
  token: SFToken,
  agentId: string
): Promise<{ sessionId: string }> {
  const res = await fetch(`${agentBaseUrl(token.instance_url, agentId)}/sessions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ externalSessionKey: crypto.randomUUID() }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Agentforce createSession failed: ${err}`);
  }

  const data = await res.json() as { sessionId: string };
  return { sessionId: data.sessionId };
}

async function sendMessage(
  token: SFToken,
  agentId: string,
  sessionId: string,
  message: string
): Promise<string> {
  const res = await fetch(
    `${agentBaseUrl(token.instance_url, agentId)}/sessions/${sessionId}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: { role: 'user', content: [{ type: 'text', text: message }] },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Agentforce sendMessage failed: ${err}`);
  }

  const data = await res.json() as {
    messages?: Array<{ type: string; message: string }>;
  };

  const reply = data.messages?.find((m) => m.type === 'AgentTextMessage');
  return reply?.message ?? "I'm sorry, I didn't get a response. Please try again.";
}

async function endSession(
  token: SFToken,
  agentId: string,
  sessionId: string
): Promise<void> {
  await fetch(
    `${agentBaseUrl(token.instance_url, agentId)}/sessions/${sessionId}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token.access_token}` },
    }
  );
}

// ─── Main handler ─────────────────────────────────────────────────────────────

const handler: Handler = async (event: HandlerEvent) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders, body: 'Method Not Allowed' };
  }

  const agentId = process.env.AGENTFORCE_AGENT_ID;
  if (!agentId) {
    return {
      statusCode: 503,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Agentforce is not configured.' }),
    };
  }

  const ip =
    event.headers['x-forwarded-for']?.split(',')[0]?.trim() ?? '127.0.0.1';

  if (isRateLimited(ip)) {
    return {
      statusCode: 429,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Too many messages. Please slow down.' }),
    };
  }

  let body: Record<string, string>;
  try {
    body = JSON.parse(event.body ?? '{}');
  } catch {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Invalid JSON' }),
    };
  }

  const { action, sessionId, message } = body;

  try {
    const token = await getSFToken();

    // ── Create a new conversation session ────────────────────────────────────
    if (action === 'createSession') {
      const result = await createSession(token, agentId);
      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      };
    }

    // ── Send a chat message ───────────────────────────────────────────────────
    if (action === 'sendMessage') {
      if (!sessionId?.trim()) {
        return {
          statusCode: 422,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'sessionId is required.' }),
        };
      }
      if (!message?.trim()) {
        return {
          statusCode: 422,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'message is required.' }),
        };
      }
      if (message.length > 2000) {
        return {
          statusCode: 422,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Message too long (max 2000 chars).' }),
        };
      }

      const reply = await sendMessage(token, agentId, sessionId, message.trim());
      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply }),
      };
    }

    // ── End / close the session ───────────────────────────────────────────────
    if (action === 'endSession') {
      if (!sessionId?.trim()) {
        return {
          statusCode: 422,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'sessionId is required.' }),
        };
      }
      await endSession(token, agentId, sessionId);
      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ok: true }),
      };
    }

    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Unknown action. Use createSession, sendMessage, or endSession.',
      }),
    };
  } catch (err) {
    console.error('[agentforce]', err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Agentforce request failed. Please try again.' }),
    };
  }
};

export { handler };
