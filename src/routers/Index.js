const categoryRouter=require("./categoriesRouter")
const authRouter=require("./authRouter")
const userRouter=require("./userRouter")
function Router(app){
    app.use("/category",categoryRouter)
    app.use("/auth",authRouter)
    app.use("/user",userRouter)
}
module.exports=Router