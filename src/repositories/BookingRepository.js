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
    const { priceTransport, priceService, address, dayRepair, timeRepair, desc } = req.body
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
      const booking = await this.bookingService(address, priceTransport, priceService, userId, service_id, desc)
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

  async bookingService(address, priceTransport, priceService, user_id, service_id, desc) {
    const booking = new BookingModel()
    booking.user_id = user_id
    booking.service_id = service_id
    booking.address = address
    booking.fee_service = priceService
    booking.fee_transport = priceTransport
    booking.desc = desc
    await booking.save()
    return booking
  }

  async changeStatusBookingByRepairman(req, res) {
    try {
      const userId = req.user._id
      const booking_id = req.params.id
      const option = parseInt(req.params.option)
      console.log(option);
      const booking = await BookingModel.findOne({ _id: booking_id }).select("service_id")
      const service = await ServiceModel.findOne({ _id: booking.service_id, user_id: userId, status: "active" })
      if (!service) {
        return res.status(200).json({ status: 400, message: "Không tìm thấy dịch vụ để cập nhật trạng thái" })
      }
      switch (option) {
        case 1:
          booking.status = "Đã nhận đơn sửa"
          await booking.save()
          return res.status(200).json({ status: 200, message: "Tiếp nhận đơn sửa thành công" })
        case 2:
          booking.status = "Đã hủy đơn"
          await booking.save()
          return res.status(200).json({ status: 200, message: "Hủy đơn sửa thành công" })
        case 3:
          booking.status = "Đẫ sửa thành công"
          await booking.save()
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
          status = "Đã sửa thành công";
          break;
        default:
          return res.status(500).json({ status: 500, message: 'Giá trị không hợp lệ' });
      }
      const activeServices = await ServiceModel.find({ user_id: userId, status: "active" });
      if (activeServices.length < 1) {
        const userBookings = await BookingModel.find({ user_id: userId, status: status })
          .populate({ path: "service_id", select: "image" })
        if (userBookings.length < 1) {
          return res.status(200).json({ status: 200, data: [] });
        }
        return res.status(200).json({ status: 200, data: userBookings });
      } else {
        const bookings = await Promise.all(
          activeServices.map(async (service) => {
            const serviceBookings = await BookingModel.find({ service_id: service._id, status })
              .populate({ path: "service_id", select: "image" })

            if (serviceBookings.length > 0) {
              return serviceBookings;
            } else {
              return [];
            }
          })
        );
        const flattenedBookings = bookings.flat();
        return res.status(200).json({ status: 200, data: flattenedBookings });
      }
    } catch (error) {
      console.error(error)
      return res.status(500).json({ status: 500, message: 'Internal server error' });
    }
  }

}
module.exports = new BookingRepository()