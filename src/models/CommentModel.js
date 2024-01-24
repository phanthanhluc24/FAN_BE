const mongoose=require("mongoose")
const Schema=mongoose.Schema
const CommentSchema=new Schema({
    commenter_id:{type:Schema.Types.ObjectId,ref:"users",require:true},
    receiver_id: {type:Schema.Types.ObjectId,ref:"users",require:true},
    content:{type:String,require:true},
    star:{type:Number,require:true}
},{
    timestamps:true
})

const CommentModel=mongoose.model("comment_repairman",CommentSchema)
module.exports=CommentModel