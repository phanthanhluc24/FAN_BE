const BookingModel=require("../models/BookingModel")
const UserModel=require("../models/UserModel")
const ServiceModel=require("../models/ServiceModel")
const NotificationModel=require("../models/NotificationModel")
const admin=require("firebase-admin")
const validator=require("validator")
admin.initializeApp({
    credential:admin.credential.cert(require("../json/serviceAccountKey.json"))
  })
class BookingRepository{
    
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
        const {priceTransport,priceService,address,dayRepair,timeRepair,desc}=req.body
        const service_id=req.params.service_id
        const repairman_id=req.params.repairman_id
        const userId=req.user._id
        if (validator.isEmpty(address) || validator.isEmpty(desc)) {
          return res.status(200).json({status:400,message:"Đặt dịch vụ không thành công"})
        }
        const userDeviceId=await UserModel.findById({_id:repairman_id}).select("-_id deviceToken")
        const service=await ServiceModel.findById({_id:service_id}).select("-_id service_name image")
        const payloadRepairman={
          notification:{
            title:"Fix All Now",
            body:`Dịch vụ ${service.service_name} có người đặt lịch`,
          },
          data:{
            serviceId:service_id,
            role:"RPM",
            image:service.image,
            day:dayRepair,
            time:timeRepair
          }
        }
        try {
          if (repairman_id==userId) {
            return res.status(200).json({status:401,message:"Bạn không thể tự đặt dịch vụ của mình"})
          }
          const  notification= await this.saveNotification(service.service_name,service_id,repairman_id,userId)
          await this.bookingService(address,priceTransport,priceService,userId,service_id,desc)
          if (!notification) {
            return res.status(200).json({status:400,message:"Đặt dịch vụ không thành công"})
          }
          await admin.messaging().sendToDevice(userDeviceId.deviceToken,payloadRepairman)
          return res.status(200).json({status:200,message:"Đơn đặt dịch vụ của bạn đang được tiếp nhận"})
        } catch (error) {
          console.error('Error sending notification:', error);
          return res.status(200).json({status:400,message:"Đặt dịch vụ không thành công"})

        }
    }

    async saveNotification(service_name,service_id,repairman_id,userId){
      try {
        const notification=new NotificationModel()
        notification.titleRepairman="Bạn nhận được đơn sửa chửa"
        notification.bodyRepairman=`Dịch vụ ${service_name} có người đặt lịch`
        notification.titleRepairmanFinder="Đơn sửa chữa của bạn đã được gửi đi"
        notification.bodyRepairmanFinder=`${service_name} đang chờ thợ tiếp nhận`
        notification.service_id=service_id
        notification.repairman_id=repairman_id
        notification.user_id=userId
        await notification.save()
        return notification
      } catch (error) {
        console.log(error);
      }
    }

    async bookingService(address,priceTransport,priceService,user_id,service_id,desc){
      const booking=new BookingModel()
      booking.user_id=user_id
      booking.service_id=service_id
      booking.address=address
      booking.fee_service=priceService
      booking.fee_transport=priceTransport
      booking.desc=desc
      await booking.save()
  }
}
module.exports=new BookingRepository()