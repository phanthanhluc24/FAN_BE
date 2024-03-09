const mongoose=require("mongoose")
const Schema=mongoose.Schema

const bookingSchema=new Schema({
    user_id:{type:Schema.Types.ObjectId,ref:"users",require:true},
    service_id:{type:Schema.Types.ObjectId,ref:"services",require:true},
    status:{type:String,enum:["Chờ xác nhận","Đã nhận đơn sửa","Đã hủy đơn","Đã sửa hoàn thành"],default:"Chờ xác nhận"},
    address:{type:String,require:true},
    fee_service:{type:Number,require:true},
    fee_transport:{type:Number,require:true},
    day_repair:{type:String,require:true},
    time_repair:{type:String,require:true},
    payment:{type:String,default:"No"},
    desc:{type:String,require:true},
    comment:{type:String}
},{
    timestamps:true
})

const bookingModel=mongoose.model("bookings",bookingSchema)
module.exports=bookingModel