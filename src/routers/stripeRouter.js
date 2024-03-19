const express=require("express")
const router=express.Router()
const StripeController=require("../controllers/StripeController")
router.post("/intents",StripeController.StripePayment)
module.exports=router