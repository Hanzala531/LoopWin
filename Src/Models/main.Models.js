import mongoose from "mongoose";

const mainSchema = new mongoose.Schema({
    bannerImage: {
        type: String,
        default: null
    },
    winners: [
        {
            name : {
                type : String ,
                required : true
            },
            prizeName : {
                type : String , 
                required : true 
            },
            winnerImage : {
                type : String ,
                required : true
            }

        }
    ]
}, {
    timestamps: true
});

export const Main = mongoose.model("Main", mainSchema);
