/**
 * Agentforce External Client API Service
 *
 * Handles OAuth (Client Credentials) and the Agentforce agent session/message API.
 *
 * Required env vars (set in .env):
 *   REACT_APP_SF_INSTANCE_URL   - e.g. https://yourorg.my.salesforce.com
 *   REACT_APP_SF_CLIENT_ID      - Connected App consumer key
 *   REACT_APP_SF_CLIENT_SECRET  - Connected App consumer secret
 *   REACT_APP_SF_AGENT_ID       - Agentforce Agent API Name or ID
 */

const INSTANCE_URL = process.env.REACT_APP_SF_INSTANCE_URL;
const CLIENT_ID = process.env.REACT_APP_SF_CLIENT_ID;
const CLIENT_SECRET = process.env.REACT_APP_SF_CLIENT_SECRET;
const AGENT_ID = process.env.REACT_APP_SF_AGENT_ID;

let cachedToken = null;
let tokenExpiry = null;

/**
 * Fetches an OAuth access token via Client Credentials flow.
 * Caches the token until it expires.
 */
async function getAccessToken() {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });

  const response = await fetch(`${INSTANCE_URL}/services/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OAuth failed: ${err}`);
  }

  const data = await response.json();
  cachedToken = data.access_token;
  // Salesforce tokens default to 2 hours; cache for 1h 55m to be safe
  tokenExpiry = Date.now() + 115 * 60 * 1000;
  return cachedToken;
}

/**
 * Creates a new Agentforce agent session.
 * @returns {{ sessionId: string }}
 */
export async function createSession() {
  const token = await getAccessToken();
  const externalSessionKey = crypto.randomUUID();

  const response = await fetch(
    `${INSTANCE_URL}/einstein/ai-agent/v1/agents/${AGENT_ID}/sessions`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        externalSessionKey,
        instanceConfig: { endpoint: INSTANCE_URL },
        streamingCapabilities: { chunkTypes: ['Text'] },
        bypassUser: true,
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Create session failed: ${err}`);
  }

  const data = await response.json();
  return { sessionId: data.sessionId };
}

/**
 * Sends a message to an active Agentforce session.
 * @param {string} sessionId
 * @param {string} text - The user's message
 * @returns {string} - The agent's reply text
 */
export async function sendMessage(sessionId, text) {
  const token = await getAccessToken();

  const response = await fetch(
    `${INSTANCE_URL}/einstein/ai-agent/v1/sessions/${sessionId}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        message: {
          role: 'user',
          content: [{ type: 'text', text }],
        },
        variables: [],
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Send message failed: ${err}`);
  }

  const data = await response.json();

  // Extract agent reply text from the response
  const messages = data.messages ?? [];
  const agentMsg = messages.find((m) => m.role === 'assistant' || m.role === 'Agent');
  if (agentMsg?.content?.length) {
    const textBlock = agentMsg.content.find((c) => c.type === 'text');
    if (textBlock) return textBlock.text;
  }

  // Fallback: return raw response for debugging
  return data.reply ?? JSON.stringify(data);
}

/**
 * Ends an Agentforce session.
 * @param {string} sessionId
 */
export async function endSession(sessionId) {
  const token = await getAccessToken();

  await fetch(
    `${INSTANCE_URL}/einstein/ai-agent/v1/sessions/${sessionId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'x-session-end-reason': 'UserRequest',
      },
    }
  );
}
