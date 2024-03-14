const express=require("express")
const app=express()
const dotenv=require("dotenv")
dotenv.config()
const mongoose=require("mongoose")
const PORT=process.env.PORT
const DATABASE=process.env.DATABASE
const router=require("./src/routers/Index")
const http=require("http")
const cors=require("cors")
const socketIo=require("socket.io")
const server=http.createServer(app)
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
// config cors
app.use("*",cors())
// use public router
router(app)

// socket io
const io=socketIo(server,{
    origin:"*",
    methods:["GET","POST"]
})
let activeUserChat=[]
io.on("connection",(socket)=>{
    socket.on("chat-with-new-partner",(newUserId)=>{
        if (!activeUserChat.some((user)=>user.userId==newUserId)) {
            activeUserChat.push({
                receiveId:newUserId,
                socketId:socket.id
            })
            console.log("User connected",activeUserChat);
        }
    })
})
// Server listening on port
server.listen(PORT,()=>{
    console.log(`Server listening on port ${PORT}`);
})

module.exports=app