const UserModel = require("../models/UserModel")
const ServiceModel = require("../models/ServiceModel")
const bcrypt = require("bcrypt")
const validator = require("validator")
const JWT = require("jsonwebtoken")
const dotenv = require("dotenv")
const bookingModel = require("../models/BookingModel")
dotenv.config()
const ACCESS_TOKEN = process.env.ACCESS_TOKEN
class AdminRepository {
    async getRepairmans(req, res) {
        try {
            const currentPage = parseInt(req.params.currentPage)
            const pageSize = 7
            const startIndex = (currentPage - 1) * pageSize
            const endIndex = currentPage * pageSize
            const repairmans = await UserModel.find({ role: "RPM" })
            if (repairmans.length < 1) {
                return res.status(200).json({ status: 200, message: "Chưa có thợ nào tham gia ứng dụng" })
            }
            const totalService =await Promise.all(
                repairmans.map(async (repair)=>{
                    const service=await ServiceModel.countDocuments({user_id:repair._id})
                    return {repair,service}
                })
            )
            const paginatePage = totalService.slice(startIndex, endIndex)
            return res.status(200).json({ status: 200, data: paginatePage, total: repairmans.length })
        } catch (error) {
            console.log(error);
        }

    }

    async getRepairmanFinder(req, res) {
        try {
            const currentPage = parseInt(req.params.currentPage)
            const pageSize = 7
            const startIndex = (currentPage - 1) * pageSize
            const endIndex = currentPage * pageSize
            const repairmanFinder = await UserModel.find({ role: "USR" })
            if (repairmanFinder.length < 1) {
                return res.status(200).json({ status: 200, message: "Chưa có khách hàng nào tham gia ứng dụng" })
            }
            const totalBooking=await Promise.all(
                repairmanFinder.map(async (finder)=>{
                    const booking = await bookingModel.countDocuments({user_id:finder._id})
                    return {finder,booking}
                })
            )
            const paginatePage = totalBooking.slice(startIndex, endIndex)

            return res.status(200).json({ status: 200, data: paginatePage, total: repairmanFinder.length })
        } catch (error) {
            console.log(error);
        }
    }


    async getServiceOfRepairman(req, res) {
        try {
            const currentPage = parseInt(req.params.currentPage)
            const pageSize = 7
            const startIndex = (currentPage - 1) * pageSize
            const endIndex = currentPage * pageSize
            const services = await ServiceModel.find().populate("user_id")
            if (services.length < 1) {
                return res.status(200).json({ status: 200, message: "Chưa có dịch vụ nào được đăng tải" })
            }
            const paginatePage = services.slice(startIndex, endIndex)
            return res.status(200).json({ status: 200, data: paginatePage, total: services.length })
        } catch (error) {
            console.log(error);
        }
    }
 
    async adminLogin(req, res) {
        const { email, password} = req.body
        if (validator.isEmpty(email) || validator.isEmpty(password)) {
            return res.status(201).json({ status: 400, message: "Email và mật khẩu không được bỏ trống" })
        }
        if (!validator.isEmail(email)) {
            return res.status(201).json({ status: 400, message: "Email không hợp lệ" })
        }
        const user = await UserModel.findOne({ email: email, status: "active",role:"ADM" })
        if (!user) {
            return res.status(201).json({ status: 404, message: "Bạn không thể truy cập vào website này" })
        }
        const comparePassword = await bcrypt.compare(password, user.password)
        if (!comparePassword) {
            return res.status(201).json({ status: 401, message: "Mật khẩu không đúng" })
        }
        const accessToken = await this.generateAccessToken({_id:user._id})
        return res.status(201).json({ status: 201, message: "Đăng nhập thành công", accessToken})
    }
    generateAccessToken(payload) {
        const accessToken = JWT.sign(payload, ACCESS_TOKEN, { expiresIn: "7d" })
        return accessToken
    }
}
module.exports = new AdminRepository()