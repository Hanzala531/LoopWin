// src/cron/giveaway.cron.js
import cron from "node-cron";
import { Giveaway } from "../Models/giveaway.Models.js";

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

      // 3️⃣ Completed → Draw
      const toDraw = await Giveaway.find({
        status: "completed",
        drawDate: { $lte: now },
        drawCompleted: false
      });

      for (let giveaway of toDraw) {
        console.log(`🎯 Running draw for: ${giveaway.title}`);

        await runDrawLogic(giveaway); // Winner selection logic

        giveaway.drawCompleted = true;
        await giveaway.save();
      }

    } catch (error) {
      console.error("❌ Error in giveaway cron job:", error);
    }
  });
}

// Winner selection logic ko separate rakha
async function runDrawLogic(giveaway) {
  // 🔹 Yahan tum apna admin winner selection code lagaoge
  console.log(`🏆 Winners selected for: ${giveaway.title}`);
}
