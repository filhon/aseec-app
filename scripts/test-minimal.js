import fs from 'fs';
import crypto from 'crypto';

let envFile = '';
try { envFile = fs.readFileSync('.env.local', 'utf8'); } catch { }
const getEnv = (key) => {
    const match = envFile.match(new RegExp('^' + key + '=(.*)$', 'm'));
    return match ? match[1].trim() : '';
};

const apiKey = getEnv('FINANCE_API_KEY');
const secretKey = getEnv('FINANCE_API_SECRET');
let baseUrl = getEnv('FINANCE_API_URL');
if (baseUrl.endsWith('/api/v1')) baseUrl = baseUrl.slice(0, -7);
if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);

function sign(method, path) {
    const ts = Math.floor(Date.now() / 1000).toString();
    const bh = crypto.createHash('sha256').update('').digest('hex');
    const sig = crypto.createHmac('sha256', secretKey).update(`${method}\n${path}\n${ts}\n${bh}`).digest('hex');
    return { ts, sig };
}

async function test(label, path, qs) {
    const { ts, sig } = sign('GET', path);
    const r = await fetch(baseUrl + path + (qs || ''), {
        headers: { 'X-API-Key': apiKey, 'X-Timestamp': ts, 'X-Signature': sig, 'Content-Type': 'application/json' }
    });
    const body = await r.text();
    if (r.ok) {
        console.log(label + ': OK ' + r.status);
    } else {
        console.log(label + ': FAIL ' + r.status + ' => ' + body.substring(0, 200));
    }
}

async function main() {
    await test('transactions', '/api/v1/transactions', '?limit=10');
    await test('budgets', '/api/v1/budgets', '?year=2026');
    await test('balance', '/api/v1/balance', '?includeProjected=true');
    await test('summary', '/api/v1/financial-summary', '?year=2026');
}
main();
