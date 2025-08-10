import mongoose from "mongoose";

const participantCountSchema = new mongoose.Schema({
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
}, { _id: false });

const recentWinnerSchema = new mongoose.Schema({
    winnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Winner"
    },
    displayName: String,
    giveawayTitle: String,
    prizeWon: String,
    wonAt: Date
}, { _id: false });

const mainSchema = new mongoose.Schema({
    bannerImage: {
        type: String,
        default: null
    },
    participantCounts: {
        type: [participantCountSchema],
        default: []
    },
    recentWinners: {
        type: [recentWinnerSchema],
        default: []
    }
}, {
    timestamps: true
});

// Update participant count method
mainSchema.methods.updateParticipantCount = async function (giveawayId, newCount) {
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
