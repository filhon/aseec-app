import fs from "fs";

// Load .env.local manually since we're not in Next.js
const envFile = fs.readFileSync(".env.local", "utf8");
const getEnv = (key: string) => {
  const match = envFile.match(new RegExp(`^${key}=(.*)$`, "m"));
  return match ? match[1].trim() : "";
};

// Set env vars before importing the client
process.env.FINANCE_API_KEY = getEnv("FINANCE_API_KEY");
process.env.FINANCE_API_SECRET = getEnv("FINANCE_API_SECRET");
process.env.FINANCE_API_URL = getEnv("FINANCE_API_URL");

import { financeApi } from "../lib/api/finance/client";

async function main() {
  console.log("=== Testing via FinanceAPIClient class ===\n");

  // Test 1: getTransactions (the call that fails in getDashboardData)
  try {
    console.log("1. Testing getTransactions...");
    const txResp = await financeApi.getTransactions({
      limit: 100,
      startDate: "2026-01-25",
      endDate: "2026-05-25",
      sortBy: "dueDate",
      sortOrder: "asc",
    });
    console.log(`   ✓ OK - Got ${txResp.data.length} transactions`);
  } catch (e) {
    console.error(`   ✗ FAILED:`, e);
  }

  // Test 2: getBalance
  try {
    console.log("2. Testing getBalance...");
    const balResp = await financeApi.getBalance(true);
    console.log(`   ✓ OK - Balance: ${balResp.data.currentBalance}`);
  } catch (e) {
    console.error(`   ✗ FAILED:`, e);
  }

  // Test 3: getBudgets
  try {
    console.log("3. Testing getBudgets...");
    const budResp = await financeApi.getBudgets(2026);
    console.log(`   ✓ OK - Got ${budResp.data.length} budgets`);
  } catch (e) {
    console.error(`   ✗ FAILED:`, e);
  }

  // Test 4: getFinancialSummary
  try {
    console.log("4. Testing getFinancialSummary...");
    const sumResp = await financeApi.getFinancialSummary(2026);
    console.log(`   ✓ OK - Income: ${sumResp.data.totals.income}`);
  } catch (e) {
    console.error(`   ✗ FAILED:`, e);
  }
}

main();
