import mongoose from "mongoose";

const giveawaySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String, // Cloudinary URL
        default: null
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    prizes: [{
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        value: {
            type: Number,
            required: true,
            min: 0
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        image: {
            type: String, // Cloudinary URL
            default: null
        }
    }],
    eligibilityCriteria: {
        minPurchases: {
            type: Number,
            default: 1,
            min: 0
        },
        minAmountSpent: {
            type: Number,
            default: 0,
            min: 0
        },
        purchaseStartDate: {
            type: Date,
            default: null
        },
        purchaseEndDate: {
            type: Date,
            default: null
        },
        eligibleProducts: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Products"
        }]
    },
    status: {
        type: String,
        enum: ["draft", "active", "completed", "cancelled"],
        default: "draft"
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    drawDate: {
        type: Date,
        required: true
    },
    drawCompleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Validation to ensure dates are logical
giveawaySchema.pre('save', function(next) {
    if (this.startDate >= this.endDate) {
        const error = new Error('End date must be after start date');
        return next(error);
    }
    
    if (this.drawDate < this.endDate) {
        const error = new Error('Draw date must be on or after end date');
        return next(error);
    }
    
    if (this.eligibilityCriteria.purchaseStartDate && this.eligibilityCriteria.purchaseEndDate) {
        if (this.eligibilityCriteria.purchaseStartDate >= this.eligibilityCriteria.purchaseEndDate) {
            const error = new Error('Purchase end date must be after purchase start date');
            return next(error);
        }
    }
    
    next();
});

export const Giveaway = mongoose.model("Giveaway", giveawaySchema);
