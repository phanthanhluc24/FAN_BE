const express=require("express")
const app=express()
const dotenv=require("dotenv")
dotenv.config()
const mongoose=require("mongoose")
const PORT=process.env.PORT
const DATABASE=process.env.DATABASE
const router=require("./src/routers/Index")
// config get value from body
app.use(express.urlencoded({extended:true,limit:"10mb"}))
app.use(express.json({limit:"10mb"}))
// connect database with mongoose
mongoose.connect(DATABASE)
.then(()=>{
    console.log("Connect with database successfully");
})
.catch((error)=>{
    console.log(error);
})
// use public router
router(app)
// Server listening on port
app.listen(PORT,()=>{
    console.log(`Server listening on port ${PORT}`);
})