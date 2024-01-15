const categoryRouter=require("./categoriesRouter")
const authRouter=require("./authRouter")
function Router(app){
    app.use("/category",categoryRouter)
    app.use("/auth",authRouter)
}
module.exports=Router