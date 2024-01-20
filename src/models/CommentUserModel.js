const mongoose=require("mongoose")
const Schema = mongoose.Schema

const commentUserSchema=new Schema({
    user_id:{type:Schema.Types.ObjectId,ref:"users",require:true},
    start:{type:Number,default:0},
    content:{type:String,require:true}
},{
    timestamps:true
})

const commentUserModel=mongoose.model("comment_users",commentUserSchema)
module.exports=commentUserModel