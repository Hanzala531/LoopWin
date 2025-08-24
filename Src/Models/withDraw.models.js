import mongoose from 'mongoose'

const withDrawSchema = new  mongoose.Schema({
    userId : {
        type : String,
        required : true 
    },
    amount : {
        type : String,
        required : true
    },
    status :{
        type : String,
        enum : ["pending" , "inProcess" , "delivered"  ]
    },
    accountTitle : {
        type : String,
        required : true
    },
    accountNumber : {
        type : String,
        required : true
    },
    accountType : {
        type : String,
        required : true
    }
},
{
    timestamps : true
}
)

export const Withdraw = mongoose.model('Withdraw' , withDrawSchema)