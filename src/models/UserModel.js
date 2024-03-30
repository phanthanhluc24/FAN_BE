const mongoose=require("mongoose")
const Schema=mongoose.Schema
const userSchema=new Schema({
    full_name:{type:String,require:true},
    email:{type:String,require:true,unique:true},
    number_phone:{type:Number,require:true,unique:true},
    password:{type:String,require:true},
    address:{type:String,default:""},
    image:{type:String,default:"https://firebasestorage.googleapis.com/v0/b/fixallnow.appspot.com/o/avatar%2Fprofile-default.png?alt=media&token=eb7b1210-3825-4d38-a91a-0324954f4f13"},
    role:{type:String,enum:["ADM","USR","RPM"],default:"USR"},
    status:{type:String,enum:["active","inactive"],default:"inactive"},
    category_id:{type:Schema.Types.ObjectId,ref:"categories",require:false},
    refreshToken:{type:String,default:""},
    deviceToken:{type:String,default:""}
},{
    timestamps:true
})
const userModel=mongoose.model("users",userSchema)
module.exports=userModel