const mongoose=require("mongoose")
const Schema=mongoose.Schema
const userSchema=new Schema({
    full_name:{type:String,require:true},
    email:{type:String,require:true,unique:true},
    number_phone:{type:Number,require:true,unique:true},
    password:{type:String,require:true},
    address:{type:String,default:""},
    image:{type:String,default:"https://firebasestorage.googleapis.com/v0/b/fixallnow.appspot.com/o/avatar%2Fprofile.png?alt=media&token=503aa8fb-4e2d-47d2-91db-cf473d7e8039"},
    role:{type:String,enum:["ADM","USR","RPM"],default:"USR"},
    status:{type:String,enum:["active","inactive"],default:"inactive"},
    category_id:{type:Schema.Types.ObjectId,ref:"category",require:false},
    refreshToken:{type:String,default:""}
},{
    timestamps:true
})
const userModel=mongoose.model("users",userSchema)
module.exports=userModel