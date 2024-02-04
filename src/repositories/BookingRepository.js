const BookingModel=require("../models/BookingModel")

class BookingRepository{
    async bookingService(){}
    async checkBooking(req,res){
        try {
            const {idService}=req.params
            const userId=req.user._id
            const check=await BookingModel.findOne({user_id:userId,service_id:idService,status:"Completed"})
            if (!check) {
                return res.status(201).json({status:404,data:false})
            }
            return res.status(201).json({status:201,data:true})
        } catch (error) {
            return res.status(500).json({ status: 500, success: false, message: "Internal Server Error." });
        }
    }
}
module.exports=new BookingRepository()