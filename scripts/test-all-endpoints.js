// Tests ALL 4 endpoints that getDashboardData calls, with the EXACT same parameters
import fs from "fs";
import crypto from "crypto";

let envFile = "";
try {
  envFile = fs.readFileSync(".env.local", "utf8");
} catch {}
const getEnv = (key) => {
  const match = envFile.match(new RegExp("^" + key + "=(.*)$", "m"));
  return match ? match[1].trim() : process.env[key] || "";
};

const apiKey = getEnv("FINANCE_API_KEY");
const secretKey = getEnv("FINANCE_API_SECRET");
let baseUrl = getEnv("FINANCE_API_URL");
if (baseUrl.endsWith("/api/v1")) baseUrl = baseUrl.slice(0, -7);
if (baseUrl.endsWith("/")) baseUrl = baseUrl.slice(0, -1);

console.log("BaseURL:", baseUrl);
console.log("Has API Key:", !!apiKey);
console.log("Has Secret:", !!secretKey);

function sign(method, path) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const bodyHash = crypto.createHash("sha256").update("").digest("hex");
  const payload = `${method}\n${path}\n${timestamp}\n${bodyHash}`;
  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(payload)
    .digest("hex");
  return { timestamp, signature };
}

async function callApi(label, path, qs) {
  console.log(`\n--- ${label} ---`);
  const fullUrl = baseUrl + path + (qs || "");
  const { timestamp, signature } = sign("GET", path);

  console.log("URL:", fullUrl);
  console.log("Sign path:", path);

  try {
    const r = await fetch(fullUrl, {
      headers: {
        "X-API-Key": apiKey,
        "X-Timestamp": timestamp,
        "X-Signature": signature,
        "Content-Type": "application/json",
      },
    });

    const text = await r.text();
    if (r.ok) {
      console.log(`✅ ${r.status} OK (${text.length} bytes)`);
    } else {
      console.log(`❌ ${r.status} FAILED`);
      console.log("Body:", text.substring(0, 500));
    }
  } catch (err) {
    console.log(`❌ FETCH ERROR:`, err.message);
  }
}

async function main() {
  // Simulate EXACTLY what getDashboardData() does

  // 1. getTransactions
  const today = new Date();
  const d30 = new Date(today);
  d30.setDate(d30.getDate() - 30);
  const d90 = new Date(today);
  d90.setDate(d90.getDate() + 90);
  const fmt = (d) => d.toISOString().split("T")[0];

  await callApi(
    "1. getTransactions",
    "/api/v1/transactions",
    `?limit=100&startDate=${fmt(d30)}&endDate=${fmt(d90)}&sortBy=dueDate&sortOrder=asc`,
  );

  // 2. getBudgets
  await callApi(
    "2. getBudgets",
    "/api/v1/budgets",
    `?year=${today.getFullYear()}`,
  );

  // 3. getBalance (with includeProjected=true)
  await callApi(
    "3. getBalance(includeProjected=true)",
    "/api/v1/balance",
    "?includeProjected=true",
  );

  // 4. getFinancialSummary
  await callApi(
    "4. getFinancialSummary",
    "/api/v1/financial-summary",
    `?year=${today.getFullYear()}`,
  );
}

main();
