const BookingRepository=require("../repositories/BookingRepository")
class BookingController{
    async checkBooking(req,res){
       await BookingRepository.checkBooking(req,res)
    }
}
module.exports=new BookingController()