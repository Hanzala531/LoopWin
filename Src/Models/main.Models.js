import mongoose from "mongoose";

const mainSchema = new mongoose.Schema({
    // Banner Management
    banners: [{
        title: {
            type: String,
            required: true,
            trim: true
        },
        image: {
            type: String,
            required: true
        },
        isActive: {
            type: Boolean,
            default: true
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    }],

    // Live Participant Count for Giveaways
    participantCounts: [{
        giveawayId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Giveaway",
            required: true
        },
        currentParticipants: {
            type: Number,
            default: 0
        },
        lastCountUpdate: {
            type: Date,
            default: Date.now
        }
    }],

    // Recent Winners Display
    recentWinners: [{
        winnerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Winner"
        },
        displayName: String,
        giveawayTitle: String,
        prizeWon: String,
        wonAt: Date
    }]
}, {
    timestamps: true
});

// Update participant count method
mainSchema.methods.updateParticipantCount = async function(giveawayId, newCount) {
    const participantIndex = this.participantCounts.findIndex(
        p => p.giveawayId.toString() === giveawayId.toString()
    );
    
    if (participantIndex !== -1) {
        this.participantCounts[participantIndex].currentParticipants = newCount;
        this.participantCounts[participantIndex].lastCountUpdate = new Date();
    } else {
        this.participantCounts.push({
            giveawayId,
            currentParticipants: newCount,
            lastCountUpdate: new Date()
        });
    }
    
    return this.save();
};

export const Main = mongoose.model("Main", mainSchema);