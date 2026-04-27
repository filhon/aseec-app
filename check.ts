import { financeApi } from "./lib/api/finance/client";
import "dotenv/config";

async function run() {
  try {
    // try to fetch some actual transaction ID, or at least list one transaction
    // to see how single transaction looks like.
    const list = await financeApi.getTransactions({
      limit: 1,
      costCenterCodes: "CC-OFERTAS",
      allDates: true,
    });
    if (list.data && list.data.length > 0) {
      const id = list.data[0].id;
      console.log("Getting single transaction:", id);
      const single = await financeApi.getTransaction(id);
      console.log("Single transaction result:", single);
    } else {
      console.log("No transactions found", list);
    }
  } catch (e) {
    console.error(e);
  }
}

run();
