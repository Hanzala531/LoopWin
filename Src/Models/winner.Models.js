import mongoose from "mongoose";

const winnerSchema = new mongoose.Schema({
    giveawayId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Giveaway",
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    prizeWon: {
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        value: {
            type: Number,
            required: true
        },
        image: {
            type: String,
            default: null
        }
    },
    wonAt: {
        type: Date,
        default: Date.now
    },
    deliveryStatus: {
        type: String,
        enum: ["pending", "contacted", "shipped", "delivered"],
        default: "pending"
    },
    contactInfo: {
        phone: {
            type: String,
            default: null
        },
        email: {
            type: String,
            default: null
        },
        address: {
            type: String,
            default: null
        }
    },
    notes: {
        type: String,
        default: null,
        trim: true
    }
}, {
    timestamps: true
});

// Index for faster queries
winnerSchema.index({ giveawayId: 1, userId: 1 }, { unique: true });

export const Winner = mongoose.model("Winner", winnerSchema);
