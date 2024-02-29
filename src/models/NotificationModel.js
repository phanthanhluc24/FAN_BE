const mongoose=require("mongoose")
const Schema=mongoose.Schema
const NotificationSchema=new Schema({
    titleRepairmanFinder:{type:String,require:true},
    bodyRepairmanFinder:{type:String,require:true},
    titleRepairman:{type:String,require:true},
    bodyRepairman:{type:String,require:true},
    repairman_id:{type:Schema.Types.ObjectId,ref:"users",require:true},
    user_id:{type:Schema.Types.ObjectId,ref:"users",require:true},
    service_id:{type:Schema.Types.ObjectId,ref:"services",require:true}
},{
    timestamps:true
})
const notificationModel=mongoose.model("notifications",NotificationSchema)
module.exports=notificationModel