const categoryRouter=require("./categoriesRouter")
const authRouter=require("./authRouter")
const userRouter=require("./userRouter")
const serviceRouter=require("./serviceRouter")
const authMiddleware=require("../middlewares/AuthMiddleware")
function Router(app){
    app.use("/category",categoryRouter)
    app.use("/auth",authRouter)
    app.use("/user",userRouter)
    app.use("/service",serviceRouter)
}
module.exports=Router