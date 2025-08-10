import mongoose from "mongoose";
import { type } from "os";

const productSchema = new mongoose.Schema({
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        index: true
    },
    headline: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    picture: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        default: 0,
        index: true
    },
    productLink : {
        type : String,
        required : true
    }
}, {
    timestamps: true,
});

// Compound indexes for optimized queries
productSchema.index({ createdBy: 1, createdAt: -1 });
productSchema.index({ name: "text", description: "text" }); // Text search
productSchema.index({ price: 1, createdAt: -1 });

export const Products = mongoose.model("Products", productSchema);