// src/cron/giveaway.cron.js
import cron from "node-cron";
import { Giveaway } from "../Models/giveaway.Models.js";
// import { getEligibleParticipants } from "../Controllers/giveaway.Controllers.js";
// Only import Winner if you ever need to use it manually:
import { Winner } from "../Models/winner.Models.js";

// Yeh function cron jobs ko initialize karega
export function initGiveawayCron() {
  // Har minute check karega
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      // 1️⃣ Draft → Active
      const activated = await Giveaway.updateMany(
        { status: "draft", startDate: { $lte: now } },
        { $set: { status: "active" } }
      );
      if (activated.modifiedCount > 0) {
        console.log(`✅ ${activated.modifiedCount} giveaways activated.`);
      }

      // 2️⃣ Active → Completed
      const completed = await Giveaway.updateMany(
        { status: "active", endDate: { $lt: now } },
        { $set: { status: "completed" } }
      );
      if (completed.modifiedCount > 0) {
        console.log(`✅ ${completed.modifiedCount} giveaways completed.`);
      }

      // Draw is now manual only. No automatic draw in cron job.

    } catch (error) {
      console.error("❌ Error in giveaway cron job:", error);
    }
  });
}


// Winner selection logic has been removed from cron job. Draw must be triggered manually.
