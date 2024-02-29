const BookingRepository=require("../repositories/BookingRepository")
class BookingController{
    async checkBooking(req,res){
       await BookingRepository.checkBooking(req,res)
    }

    async notificationToClient(req,res){
        await BookingRepository.sendNotificationToClient(req,res)
    }
}
module.exports=new BookingController()