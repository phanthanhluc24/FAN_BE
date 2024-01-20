const mongoose=require("mongoose")
const Schema=mongoose.Schema

const ServiceSchema=new Schema({
    user_id:{type:Schema.Types.ObjectId,ref:"users",require:true},
    service_name:{type:String,require:true},
    price:{type:Number,require:true},
    image:{type:String,require:true},
    desc:{type:String,require:true},
    status:{type:String,default:"active"}
},{
    timestamps:true
})

const ServiceModel=mongoose.model("services",ServiceSchema)
module.exports=ServiceModel