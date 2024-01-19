const mongoose=require("mongoose")
const Schema=mongoose.Schema
const userSchema=new Schema({
    full_name:{type:String,require:true},
    email:{type:String,require:true,unique:true},
    number_phone:{type:Number,require:true,unique:true},
    password:{type:String,require:true},
    address:{type:String,default:""},
    image:{type:String,default:""},
    role:{type:String,enum:["ADM","USR","RPM"],default:"USR"},
    status:{type:String,enum:["active","inactive"],default:"inactive"},
    category_id:{type:Schema.Types.ObjectId,ref:"category",require:false},
    refreshToken:{type:String,default:""}
},{
    timestamps:true
})
const userModel=mongoose.model("users",userSchema)
module.exports=userModel