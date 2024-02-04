const express=require("express")
const router=express.Router()
const BookingController=require("../controllers/BookingController")
router.get("/check/:id",BookingController.checkBooking)
module.exports=router