// src/cron/giveaway.cron.js
import cron from "node-cron";
import { Giveaway } from "../Models/giveaway.Models.js";
import { getEligibleParticipants } from "../Controllers/giveaway.Controllers.js";

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
  const eligibleUsers = await getEligibleParticipants(giveaway);

  if (eligibleUsers.length === 0) {
    console.log(`No eligible participants for giveaway: ${giveaway.title}`);
    return;
  }

  const winners = [];

  for (const prize of giveaway.prizes) {
    for (let i = 0; i < prize.quantity; i++) {
      const randomIndex = Math.floor(Math.random() * eligibleUsers.length);
      const selectedUser = eligibleUsers[randomIndex];

      const winner = await Winner.create({
        giveawayId: giveaway._id,
        userId: selectedUser._id,
        prizeWon: {
          name: prize.name,
          description: prize.description,
          value: prize.value,
          image: prize.image
        },
        contactInfo: {
          phone: selectedUser.phone || null
        }
      });

      winners.push(winner);
    }
  }

  console.log(`🏆 Winners selected for: ${giveaway.title}`);
}
