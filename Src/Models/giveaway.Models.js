import mongoose from "mongoose";

const giveawaySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: { type: String, required: true, trim: true },
    image: { type: String, default: null, trim: true },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    prizes: [
      {
        name: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        value: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 1 },
        image: { type: String, default: null },
      },
    ],

    eligibilityCriteria: {
      minPurchases: { type: Number, default: 1, min: 0 },
      minAmountSpent: { type: Number, default: 0, min: 0 },
      purchaseStartDate: { type: Date, default: null },
      purchaseEndDate: { type: Date, default: null },
      eligibleProducts: [
        { type: mongoose.Schema.Types.ObjectId, ref: "Products" },
      ],
    },

    status: {
      type: String,
      enum: ["draft", "active", "completed", "cancelled"],
      default: "draft",
    },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    drawDate: { type: Date, required: true },
    drawCompleted: { type: Boolean, default: false },

    winners: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        prize: String,
      },
    ],
  },
  { timestamps: true }
);

// Date validations
giveawaySchema.pre("save", function (next) {
  if (this.startDate >= this.endDate) {
    return next(new Error("End date must be after start date"));
  }
  if (this.drawDate < this.endDate) {
    return next(new Error("Draw date must be on or after end date"));
  }
  if (
    this.eligibilityCriteria.purchaseStartDate &&
    this.eligibilityCriteria.purchaseEndDate
  ) {
    if (
      this.eligibilityCriteria.purchaseStartDate >=
      this.eligibilityCriteria.purchaseEndDate
    ) {
      return next(
        new Error("Purchase end date must be after purchase start date")
      );
    }
  }
  next();
});

export const Giveaway = mongoose.model("Giveaway", giveawaySchema);
