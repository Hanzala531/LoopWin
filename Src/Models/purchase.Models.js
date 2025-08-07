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
    required: true
  },
  productId : {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Products",
    required: true
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
    default: "pending"
  },
  paymentApproval: {
    type: String,
    enum: ["pending", "in-progress", "completed"],
    default: "pending"
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

export const Purchase =  mongoose.model("Purchase", purchaseSchema);
