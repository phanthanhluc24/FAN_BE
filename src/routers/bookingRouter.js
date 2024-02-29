const express=require("express")
const router=express.Router()
const BookingController=require("../controllers/BookingController")
router.get("/check/:id",BookingController.checkBooking)
router.post("/notification/:service_id/:repairman_id",BookingController.notificationToClient)
module.exports=router