const BookingModel=require("../models/BookingModel")
const admin=require("firebase-admin")
admin.initializeApp({
    credential:admin.credential.cert(require("../json/serviceAccountKey.json"))
  })
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
    async sendNotificationToClient(req,res){
        const {title,body,tokens}=req.body
        const payload={
          notification:{
            title:title,
            body:body,
          },
          data:{
            bookingId:""
          }
        }
        try {
          console.log('tokens',tokens)
          const output = await admin.messaging().sendToDevice(tokens,payload)
          console.log('output', output)
          return res.status(200).json({message:"Send notification successfully",token:tokens})
        } catch (error) {
          console.error('Error sending notification:', error);
        }
      }
    // async sendNotificationBookingService(){
    //     BookingModel.watch().on("change",(change)=>{
    //         if (change.type==="insert") {
    //             const bookingData=change.fullDocument
    //             const message = {
    //                 notification: {
    //                   title: 'Booking mới',
    //                   body: `Booking cho dịch vụ ${bookingData.service_name} đã được tạo.`
    //                 },
    //                 data: {
    //                   bookingId: bookingData._id
    //                 },
    //                 topic: 'bookings'
    //               };
    //               admin.messaging().send(message)
    //         }
    //     })
    // }
}
module.exports=new BookingRepository()