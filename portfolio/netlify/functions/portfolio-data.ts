import type { Handler, HandlerEvent } from '@netlify/functions';
import jwt from 'jsonwebtoken';

// ─── Salesforce Auth ──────────────────────────────────────────────────────────

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
    .replace(/^['"]|['"]$/g, '')  // strip surrounding quotes if any
    .replace(/\\n/g, '\n');       // convert escaped \n to real newlines

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
  tokenExpiresAt = now + 110 * 60 * 1000; // cache for 110 min
  return cachedToken!;
}

// ─── SOQL Queries ─────────────────────────────────────────────────────────────

const QUERIES: Record<string, string> = {
  projects: `
    SELECT Id, Name, Summary_Details__c, Tech_Stack__c, Demo_URL__c, Repo_URL__c, Work_Experience__c
    FROM Project__c
    ORDER BY Name ASC
  `,
  skills: `
    SELECT Id, Name, Level__c, Percent__c, Points__c, Portfolio__c, Tags__c
    FROM Skill__c
    ORDER BY Percent__c DESC NULLS LAST
  `,
  experience: `
    SELECT Id, Name, Company__c, Role__c, Start_Date__c, End_Date__c, Is_Current__c, Description__c,
      (SELECT Id, Name, Summary_Details__c, Tech_Stack__c, Demo_URL__c, Repo_URL__c FROM Projects__r ORDER BY Name ASC)
    FROM Work_Experience__c
    ORDER BY Is_Current__c DESC, Start_Date__c DESC
  `,
};

async function sfQuery(token: SFToken, soql: string): Promise<unknown[]> {
  const url = `${token.instance_url}/services/data/v59.0/query?q=${encodeURIComponent(soql)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`SOQL query failed: ${err}`);
  }
  const data = (await res.json()) as { records: unknown[] };
  return data.records;
}

// ─── Handler ──────────────────────────────────────────────────────────────────

const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const type = event.queryStringParameters?.type;
  if (!type || !QUERIES[type]) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'type must be one of: projects, skills, experience' }),
    };
  }

  try {
    const token = await getSFToken();
    const records = await sfQuery(token, QUERIES[type]);
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
      },
      body: JSON.stringify(records),
    };
  } catch (err) {
    console.error('[portfolio-data]', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch data from Salesforce' }),
    };
  }
};

export { handler };
