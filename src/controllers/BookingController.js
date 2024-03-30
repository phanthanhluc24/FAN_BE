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

    async getBookingByStatus(req,res){
        await BookingRepository.getBookingByStatus(req,res)
    }

    async getBookingStatusOfRepairman(req,res){
        await BookingRepository.getBookingStatusOfRepairman(req,res)
    }

    async getDetailBooking(req,res){
        await BookingRepository.getDetailBooking(req,res)
    }

    async userCancelBooking(req,res){
        await BookingRepository.userCancelBooking(req,res)
    }
}
module.exports=new BookingController()