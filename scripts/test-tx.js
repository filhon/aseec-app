import fs from 'fs';
import crypto from 'crypto';

let envFile = '';
try { envFile = fs.readFileSync('.env.local', 'utf8'); } catch { }
const getEnv = (key) => {
    const match = envFile.match(new RegExp('^' + key + '=(.*)$', 'm'));
    return match ? match[1].trim() : process.env[key] || '';
};

const apiKey = getEnv('FINANCE_API_KEY');
const secretKey = getEnv('FINANCE_API_SECRET');
let baseUrl = getEnv('FINANCE_API_URL');
if (baseUrl.endsWith('/api/v1')) baseUrl = baseUrl.slice(0, -7);
if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);

async function test() {
    // 1. Transaction endpoint test
    const path = '/api/v1/transactions';
    const qs = '?limit=100&startDate=2026-01-25&endDate=2026-05-25&sortBy=dueDate&sortOrder=asc';

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const bodyHash = crypto.createHash('sha256').update('').digest('hex');

    // The path signed MUST BE exactly the path WITHOUT query params
    const payload = `GET\n${path}\n${timestamp}\n${bodyHash}`;
    const signature = crypto.createHmac('sha256', secretKey).update(payload).digest('hex');

    console.log('Testing:', path + qs);
    console.log('Payload:', payload.replace(/\n/g, '\\n'));

    try {
        const r = await fetch(baseUrl + path + qs, {
            headers: {
                'X-API-Key': apiKey,
                'X-Timestamp': timestamp,
                'X-Signature': signature,
                'Content-Type': 'application/json'
            }
        });
        console.log('Status transactions:', r.status);
        const text = await r.text();
        console.log('Body transactions:', text);
    } catch (error) {
        console.error("Fetch failed", error);
    }
}
test();
