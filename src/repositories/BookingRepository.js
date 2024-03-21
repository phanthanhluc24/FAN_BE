const BookingModel = require("../models/BookingModel")
const UserModel = require("../models/UserModel")
const ServiceModel = require("../models/ServiceModel")
const NotificationModel = require("../models/NotificationModel")
const admin = require("firebase-admin")
const validator = require("validator")
const bookingModel = require("../models/BookingModel")
const { promise } = require("bcrypt/promises")
admin.initializeApp({
  credential: admin.credential.cert(require("../json/serviceAccountKey.json"))
})
class BookingRepository {

  async checkBooking(req, res) {
    try {
      const { idService } = req.params
      const userId = req.user._id
      const check = await BookingModel.findOne({ user_id: userId, service_id: idService, status: "Completed" })
      if (!check) {
        return res.status(201).json({ status: 404, data: false })
      }
      return res.status(201).json({ status: 201, data: true })
    } catch (error) {
      return res.status(500).json({ status: 500, success: false, message: "Internal Server Error." });
    }
  }
  async sendNotificationToClient(req, res) {
    const { priceTransport, priceService, address, dayRepair, timeRepair, desc,payment } = req.body
    const service_id = req.params.service_id
    const repairman_id = req.params.repairman_id
    const userId = req.user._id
    if (validator.isEmpty(address) || validator.isEmpty(desc) || address.trim().length === 0 || desc.trim().length === 0) {
      return res.status(200).json({ status: 400, message: "Đặt dịch vụ không thành công" })
    }
    const userDeviceId = await UserModel.findById({ _id: repairman_id }).select("-_id deviceToken")
    const service = await ServiceModel.findById({ _id: service_id }).select("-_id service_name image")
    const payloadRepairman = {
      notification: {
        title: "Fix All Now",
        body: `Dịch vụ ${service.service_name} có người đặt lịch`,
      },
      data: {
        serviceId: service_id,
        image: service.image,
        day: dayRepair,
        time: timeRepair
      }
    }
    try {
      if (repairman_id == userId) {
        return res.status(200).json({ status: 401, message: "Bạn không thể tự đặt dịch vụ của mình" })
      }
      if(userDeviceId.deviceToken===""){
        return res.status(201).json({status:200,message:"Thiết bên kia chưa có diviceToken"})
      }
      const booking = await this.bookingService(address, priceTransport, priceService, userId, service_id, desc,dayRepair, timeRepair,payment)
      if (!booking) {
        return res.status(200).json({ status: 400, message: "Đặt dịch vụ không thành công" })
      }
      const notification = await this.saveNotification(service.service_name, service_id, repairman_id, userId, booking._id)
      if (!notification) {
        return res.status(200).json({ status: 400, message: "Đặt dịch vụ không thành công" })
      }
      await admin.messaging().sendToDevice(userDeviceId.deviceToken, payloadRepairman)
      return res.status(200).json({ status: 200, message: "Đơn đặt dịch vụ của bạn đang được tiếp nhận" })
    } catch (error) {
      console.error('Error sending notification:', error);
      return res.status(200).json({ status: 400, message: "Đặt dịch vụ không thành công" })

    }
  }

  async saveNotification(service_name, service_id, repairman_id, userId, booking_id) {
    try {
      const notification = new NotificationModel()
      notification.titleRepairman = "Bạn nhận được đơn sửa chửa"
      notification.bodyRepairman = `Dịch vụ ${service_name} có người đặt lịch`
      notification.titleRepairmanFinder = "Đơn sửa chữa của bạn đã được gửi đi"
      notification.bodyRepairmanFinder = `${service_name} đang chờ thợ tiếp nhận`
      notification.service_id = service_id
      notification.repairman_id = repairman_id
      notification.user_id = userId
      notification.booking_id = booking_id
      await notification.save()
      return notification
    } catch (error) {
      console.log(error);
    }
  }

  async bookingService(address, priceTransport, priceService, user_id, service_id, desc,dayRepair, timeRepair,payment) {
    const booking = new BookingModel()
    booking.user_id = user_id
    booking.service_id = service_id
    booking.address = address
    booking.fee_service = priceService
    booking.fee_transport = priceTransport
    booking.day_repair=dayRepair
    booking.time_repair=timeRepair
    booking.desc = desc
    booking.payment=payment
    booking.comment="active"
    await booking.save()
    return booking
  }

  async changeStatusBookingByRepairman(req, res) {
    try {
      const userId = req.user._id
      const booking_id = req.params.id
      const option = parseInt(req.params.option)
      const booking = await BookingModel.findOne({ _id: booking_id }).select("service_id user_id")
      const service = await ServiceModel.findOne({ _id: booking.service_id, user_id: userId, status: "active" })
      if (!service) {
        return res.status(200).json({ status: 400, message: "Không tìm thấy dịch vụ để cập nhật trạng thái" })
      }
      const user=await UserModel.findOne({_id:booking.user_id})
      let status;
      switch (option) {
        case 1:
          status="Đã nhận đơn sửa"
          break;
        case 2:
          status="Đã hủy đơn"
          break;
        case 3:
          status="Đã sửa hoàn thành"
          break;
        default:
          break;
      }
      const payloadNotification = {
        notification: {
          title: "Fix All Now",
          body: `Thợ ${status}`,
        },
        data: {
          status:"BK"
        }
      }
      switch (option) {
        case 1:
          booking.status = "Đã nhận đơn sửa"
          await booking.save()
          await admin.messaging().sendToDevice(user.deviceToken,payloadNotification)
          return res.status(200).json({ status: 200, message: "Tiếp nhận đơn sửa thành công" })
        case 2:
          booking.status = "Đã hủy đơn"
          await booking.save()
          await admin.messaging().sendToDevice(user.deviceToken,payloadNotification)
          return res.status(200).json({ status: 200, message: "Hủy đơn sửa thành công" })
        case 3:
          booking.status = "Đã sửa hoàn thành"
          await booking.save()
          await admin.messaging().sendToDevice(user.deviceToken,payloadNotification)
          return res.status(200).json({ status: 200, message: "Chúc mừng bạn đã sửa thành công" })
        default:
          return res.status(200).json({ status: 400, message: "Không thể cập nhật trạng thái đơn sửa" })
      }
    } catch (error) {
      return res.status(200).json({ status: 400, message: error.message })
    }
  }

  async getBookingByStatus(req, res) {
    try {
      const userId = req.user._id;
      const option = parseInt(req.params.option);
      if (!Number.isInteger(option) || option < 1 || option > 4) {
        return res.status(400).json({ status: 400, message: 'Không hợp lệ tham số tùy chọn' });
      }

      let status;
      switch (option) {
        case 1:
          status = "Chờ xác nhận";
          break;
        case 2:
          status = "Đã nhận đơn sửa";
          break;
        case 3:
          status = "Đã hủy đơn";
          break;
        case 4:
          status = "Đã sửa hoàn thành";
          break;
        default:
          return res.status(500).json({ status: 500, message: 'Giá trị không hợp lệ' });
      }
        const userBookings = await BookingModel.find({ user_id: userId, status: status })
          .sort({updatedAt:-1})
          .populate({ path: "service_id", select: "image service_name" })
        if (userBookings.length < 1) {
          return res.status(200).json({ status: 200, data: [] });
        }
        return res.status(200).json({ status: 200, data: userBookings });
    } catch (error) {
      console.error(error)
      return res.status(500).json({ status: 500, message: 'Internal server error' });
    }
  }

  async getBookingStatusOfRepairman(req,res){
    try {
      const userId=req.user._id
      const option = parseInt(req.params.option);
      if (!Number.isInteger(option) || option < 1 || option > 4) {
        return res.status(400).json({ status: 400, message: 'Không hợp lệ tham số tùy chọn' });
      }

      let status;
      switch (option) {
        case 1:
          status = "Chờ xác nhận";
          break;
        case 2:
          status = "Đã nhận đơn sửa";
          break;
        case 3:
          status = "Đã hủy đơn";
          break;
        case 4:
          status = "Đã sửa hoàn thành";
          break;
        default:
          return res.status(500).json({ status: 500, message: 'Giá trị không hợp lệ' });
      }
      const activeServices = await ServiceModel.find({ user_id: userId, status: "active" });
      if (activeServices.length<1) {
        return res.status(200).json({status:400,message:"Người dùng này không phải là thợ",data:[]})
      }
      const bookings = await Promise.all(
        activeServices.map(async (service) => {
          const serviceBookings = await BookingModel.find({ service_id: service._id, status })
            .sort({updatedAt:-1})
            .populate({ path: "service_id", select: "image service_name" })

          if (serviceBookings.length > 0) {
            return serviceBookings;
          } else {
            return [];
          }
        }))
        const flattenedBookings = bookings.flat();
      return res.status(200).json({ status: 200, data: flattenedBookings });
    } catch (error) {
      console.error(error)
      return res.status(500).json({ status: 500, message: 'Lỗi trên server' });
    }
  }

  async getDetailBooking(req,res){
    try {
      const booking_id=req.params.id
      const booking=await BookingModel.findOne({_id:booking_id})
      .populate({
        path: 'user_id',
        select: 'full_name number_phone'
      })
      .populate({
        path: 'service_id',
        select: 'service_name image price'
      })
      if (!booking) {
        return res.status(200).json({status:400,message:"Không tìm thấy đơn hàng"})
      }
      // const totalPrice=booking.service_id.price+booking.fee_service+booking.fee_transport
      // booking.sum=totalPrice
      return res.status(200).json({status:200,data:booking})
    } catch (error) {
      return res.status(500).json({status:500,message:error.message})
    }
  }

  async userCancelBooking(req,res){
    try {
      const userId=req.user._id
      const booking_id=req.params.id
      const booking=await BookingModel.findOne({_id:booking_id,user_id:userId}).select("service_id")
      if (!booking) {
        return res.status(201).json({status:201,message:"Bạn không thể hủy dịch vụ này"})
      }
      const service = await ServiceModel.findOne({ _id: booking.service_id,status: "active" }).populate({path:"user_id",select:"_id"})
      if (!service) {
        return res.status(201).json({status:201,message:"Bạn không thể hủy dịch vụ này"})
      }
      const user=await UserModel.findOne({_id:service.user_id._id}).select("deviceToken full_name")
      if (user.deviceToken=="") {
        return res.status(201).json({status:201,message:"Không thể thông báo đến thợ"})
      }
      const payloadNotification = {
        notification: {
          title: "Fix All Now",
          body: `${user.full_name} đã hủy dịch vụ`,
        },
      }
      booking.status="Đã hủy đơn"
      await booking.save()
      await admin.messaging().sendToDevice(user.deviceToken,payloadNotification)
      return res.status(200).json({status:200,message:"Huỷ dịch vụ thành công"})
    } catch (error) {
      console.log(error);
    }
  }
}
module.exports = new BookingRepository()