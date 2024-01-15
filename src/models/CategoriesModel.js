const mongoose=require("mongoose")
const Schema=mongoose.Schema

const categoriesSchema=new Schema({
    name:{type:String,require:true}
},{
    timestamps:true
})

const categoriesModel=mongoose.model("categories",categoriesSchema)
module.exports=categoriesModel