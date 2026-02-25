import crypto from "crypto";

// We'll read from process.env but manually load the file in pure node
import fs from "fs";

let envFile = "";
try {
    envFile = fs.readFileSync(".env.local", "utf8");
} catch { }

const getEnv = (key: string) => {
    const match = envFile.match(new RegExp(`^${key}=(.*)$`, 'm'));
    return match ? match[1].trim() : process.env[key] || "";
};

const apiKey = getEnv("FINANCE_API_KEY");
const secretKey = getEnv("FINANCE_API_SECRET");
let baseUrl = getEnv("FINANCE_API_URL");

if (baseUrl.endsWith("/api/v1")) {
    baseUrl = baseUrl.replace(/\/api\/v1$/, "");
}
baseUrl = baseUrl.replace(/\/$/, "");

console.log("=== Testing Finance API Connection ===");
console.log("Base URL:", baseUrl);
console.log("API Key:", apiKey ? "Loaded" : "Missing");
console.log("Secret Key:", secretKey ? "Loaded" : "Missing");

function sign(method: string, path: string) {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const bodyHash = crypto.createHash("sha256").update("").digest("hex");
    const payload = `${method}\n${path}\n${timestamp}\n${bodyHash}`;

    console.log("--- Signature Payload ---");
    console.log(payload.replace(/\n/g, "\\n"));

    const signature = crypto
        .createHmac("sha256", secretKey)
        .update(payload)
        .digest("hex");

    return { timestamp, signature };
}

async function testBalance() {
    const method = "GET";
    const path = "/api/v1/balance";

    console.log(`\nTesting: ${method} ${path}`);
    const { timestamp, signature } = sign(method, path);

    const url = `${baseUrl}${path}`;
    console.log("Request URL:", url);
    console.log("Headers:");
    console.log("  X-API-Key:", apiKey);
    console.log("  X-Timestamp:", timestamp);
    console.log("  X-Signature:", signature);

    try {
        const response = await fetch(url, {
            method,
            headers: {
                "X-API-Key": apiKey,
                "X-Timestamp": timestamp,
                "X-Signature": signature,
                "Content-Type": "application/json",
            },
        });

        console.log(`\nResponse Status: ${response.status} ${response.statusText}`);

        // Print response headers
        const headers: Record<string, string> = {};
        response.headers.forEach((val, key) => { headers[key] = val; });
        console.log("Response Headers:", headers);

        const text = await response.text();
        console.log("Response Body (Raw):", text);

        try {
            if (text) {
                console.log("Response Body (JSON):", JSON.stringify(JSON.parse(text), null, 2));
            }
        } catch { /* ignore parse error */ }

    } catch (error) {
        console.error("Fetch failed:", error);
    }
}

async function testEndpoint(method: string, path: string) {
    console.log(`\nTesting: ${method} ${path}`);
    const { timestamp, signature } = sign(method, path);
    const url = `${baseUrl}${path}`;
    try {
        const response = await fetch(url, {
            method,
            headers: {
                "X-API-Key": apiKey,
                "X-Timestamp": timestamp,
                "X-Signature": signature,
                "Content-Type": "application/json",
            },
        });

        console.log(`Response Status: ${response.status} ${response.statusText}`);
        const text = await response.text();
        if (!response.ok) {
            console.log("Error Body:", text);
        }
    } catch (err) {
        console.log("Fetch failed", err);
    }
}

async function runAll() {
    await testBalance();

    // Simulate what getDashboardData exactly calls
    const today = new Date();
    // Use manual string replacement to match logic without library
    const year = today.getFullYear();

    const prevDate = new Date();
    prevDate.setDate(prevDate.getDate() - 30);
    const prevStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(prevDate.getDate()).padStart(2, '0')}`;

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 90);
    const nextStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`;

    const txPath = `/api/v1/transactions?limit=100&startDate=${prevStr}&endDate=${nextStr}&sortBy=dueDate&sortOrder=asc`;
    await testEndpoint("GET", txPath);
    await testEndpoint("GET", `/api/v1/budgets?year=${year}`);
    await testEndpoint("GET", `/api/v1/financial-summary?year=${year}`);
}

runAll();
