import mongoose from "mongoose";

const winnerSchema = new mongoose.Schema({
    giveawayId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Giveaway",
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
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
        default: Date.now,
        index: true
    },
    deliveryStatus: {
        type: String,
        enum: ["pending", "contacted", "shipped", "delivered"],
        default: "pending",
        index: true
    },
    contactInfo: {
        phone: {
            type: String,
            default: null
        },
        profileImage: {
            type: String,
            default: null
        }
    },
    notes: {
        type: String,
        default: null,
        trim: true
    },
    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    lastUpdatedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Index for faster queries
winnerSchema.index({ giveawayId: 1, userId: 1 }, { unique: true });
winnerSchema.index({ giveawayId: 1, wonAt: -1 });
winnerSchema.index({ userId: 1, wonAt: -1 });
winnerSchema.index({ deliveryStatus: 1, wonAt: -1 });

export const Winner = mongoose.model("Winner", winnerSchema);
