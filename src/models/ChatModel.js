const mongoose=require("mongoose")
const Schema=mongoose.Schema

const chatModel=new Schema({
    users:{type:Array}
},
{
    timestamps:true
})

const Chat =mongoose.model("members-chat",chatModel)
module.exports=Chat