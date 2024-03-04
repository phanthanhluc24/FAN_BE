const BookingRepository=require("../repositories/BookingRepository")
class BookingController{
    async checkBooking(req,res){
       await BookingRepository.checkBooking(req,res)
    }

    async notificationToClient(req,res){
        await BookingRepository.sendNotificationToClient(req,res)
    }

    async changeStatusBookingByRepairman(req,res){
        await BookingRepository.changeStatusBookingByRepairman(req,res)
    }
}
module.exports=new BookingController()