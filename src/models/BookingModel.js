const mongoose=require("mongoose")
const Schema=mongoose.Schema

const bookingSchema=new Schema({
    user_id:{type:Schema.Types.ObjectId,ref:"users",require:true},
    service_id:{type:Schema.Types.ObjectId,ref:"services",require:true},
    status:{type:String,enum:["Pending","Confirmed","Cancelled","Completed"],default:"Pending"}
},{
    timestamps:true
})

const bookingModel=mongoose.model("bookings",bookingSchema)
module.exports=bookingModel