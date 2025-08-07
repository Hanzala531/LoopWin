import mongoose from "mongoose";
import { type } from "os";

const productSchema = new mongoose.Schema({
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    name: {
        type: String,
        required: true
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
        default: 0
    },
    productLink : {
        type : String,
        required : true
    }
}, {
    timestamps: true,
});

export const Products = mongoose.model("Products", productSchema);