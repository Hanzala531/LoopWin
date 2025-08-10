import mongoose from "mongoose";

// --- Inline Counter Schema ---
const counterSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 }
});

// Avoid model overwrite errors in dev environment (especially with hot-reload)
const Counter = mongoose.models.Counter || mongoose.model("Counter", counterSchema);

// --- Purchase Schema ---
const purchaseSchema = new mongoose.Schema({
  purchaseId: {
    type: Number,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  productId : {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Products",
    required: true,
    index: true
  },
  paymentScreenshot : {
    type : String
  },
  transactionId:{
    type : String,

  },
  userPayment: {
    type: String,
    enum: ["pending", "in-progress", "payed"],
    default: "pending",
    index: true
  },
  paymentApproval: {
    type: String,
    enum: ["pending", "in-progress", "completed"],
    default: "pending",
    index: true
  }
}, { timestamps: true });

// --- Auto-increment purchaseId using Counter ---
purchaseSchema.pre("save", async function (next) {
  if (this.isNew && !this.purchaseId) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { id: "purchaseId" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.purchaseId = counter.seq;
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

// Compound indexes for optimized queries
purchaseSchema.index({ userId: 1, paymentApproval: 1 });
purchaseSchema.index({ userId: 1, userPayment: 1 });
purchaseSchema.index({ productId: 1, paymentApproval: 1 });
purchaseSchema.index({ createdAt: -1 });
purchaseSchema.index({ paymentApproval: 1, userPayment: 1 });

export const Purchase =  mongoose.model("Purchase", purchaseSchema);
