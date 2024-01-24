const categoryRouter=require("./categoriesRouter")
const authRouter=require("./authRouter")
const userRouter=require("./userRouter")
const serviceRouter=require("./serviceRouter")
const authMiddleware=require("../middlewares/AuthMiddleware")
const commentRouter=require("../routers/commentRouter")
function Router(app){
    app.use("/category",categoryRouter)
    app.use("/auth",authRouter)
    app.use("/user",authMiddleware,userRouter)
    app.use("/service",authMiddleware,serviceRouter)
    app.use("/comment",authMiddleware,commentRouter)
}
module.exports=Router