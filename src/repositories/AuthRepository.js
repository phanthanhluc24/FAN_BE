const UserModel = require("../models/UserModel")
const bcrypt = require("bcrypt")
const validator = require("validator")
const JWT = require("jsonwebtoken")
const dotenv = require("dotenv")
dotenv.config()
const CODE_TOKEN = process.env.CODE_TOKEN
const ACCESS_TOKEN = process.env.ACCESS_TOKEN
const REFRESH_TOKEN = process.env.REFRESH_TOKEN
const CODE_TOKEN_REFRESH = process.env.CODE_TOKEN_REFRESH
const RESET_PASSWORD_TOKEN = process.env.RESET_PASSWORD_TOKEN
const Mail = require("../utils/sendOTP")
class AuthRepository {
    async register(req, res) {
        const { full_name, email, number_phone, password, address, role, category_id } = req.body
        try {
            if (validator.isEmpty(full_name) || validator.isEmpty(email) || validator.isEmpty(number_phone) || validator.isEmpty(password)) {
                return res.status(401).json({ status: 401, message: "Tất cả các trường không được bỏ trống" })
            }
            if (!validator.isEmail(email)) {
                return res.status(401).json({ status: 401, message: "Email đăng ký không lệ" })
            }
            if (!validator.isMobilePhone(number_phone, "vi-VN")) {
                return res.status(401).json({ status: 401, message: "Số điện thoại không hợp lệ" })
            }
            const exitAccount = await UserModel.findOne({ $or: [{ email: email }, { number_phone: number_phone }] })
            if (exitAccount) {
                return res.status(409).json({ status: 409, message: "Email hoặc số điện thoại đã được đăng ký" })
            }
            const options = {
                minLength: 8,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1,
            }
            if (!validator.isStrongPassword(password, options)) {
                return res.status(401).json({ status: 401, message: "Mật khẩu quá yếu" })
            }
            const hasPassword = await bcrypt.hash(password, 10)
            const user = new UserModel()
            user.full_name = full_name
            user.email = email
            user.number_phone = number_phone
            user.password = hasPassword
            user.address = address
            user.role = role
            user.category_id = category_id
            const newUser = await user.save()
            const code = Math.floor(1000 + Math.random() * 9000)
            new Mail(newUser).sendCodeToConfirm(code)
            const codeToken = await JWT.sign({ code: code, _id: newUser._id }, CODE_TOKEN, { expiresIn: "3m" })
            const refreshCode = await JWT.sign({ _id: newUser._id }, CODE_TOKEN_REFRESH, { expiresIn: "1h" })
            return res.status(200).json({ status: 200, message: "Tạo tại khoản thành công", code: codeToken, refreshCode: refreshCode })
        } catch (error) {
            return res.status(500).json({ status: 500, message: error })
        }

    }

    async verificationCode(req, res) {
        const { codeToken, code } = req.body
        try {
            if (validator.isEmpty(codeToken) || validator.isEmpty(code)) {
                return res.status(401).json({ status: 401, message: "Mã xác thực không được bỏ trống" })
            }
            const decode = JWT.verify(codeToken, CODE_TOKEN)
            const user = await UserModel.findOne({ _id: decode._id })
            if (!user) {
                return res.status(401).json({ status: 401, message: "Không tìm thấy tài khoản" })
            }
            if (decode.code == code) {
                user.status = "active"
                user.save()
                return res.status(201).json({ status: 201, message: "Xác thực tài khoản thành công" })
            } else {
                return res.status(401).json({ status: 401, message: "Mã xác thực không đúng" })
            }
        } catch (error) {
            if (error.name == "TokenExpiredError") {
                return res.status(401).json({ status: 401, message: "Mã code đã hết hiệu lực" })
            }
        }
    }

    async reSendVerificationCode(req, res) {
        const { refreshCode } = req.body
        try {
            const decode = JWT.verify(refreshCode, CODE_TOKEN_REFRESH)
            const user = await UserModel.findById(decode._id)
            if (!user) {
                return res.status(401).json({ status: 401, message: "Tài khoản không tìm thấy" })
            }
            const code = Math.floor(1000 + Math.random() * 9000)
            const codeToken = await JWT.sign({ code: code, _id: user._id }, CODE_TOKEN, { expiresIn: "3m" })
            new Mail(user).sendCodeToConfirm(code)
            return res.status(201).json({ status: 201, message: "Gửi lại mã code thành công", code: codeToken })
        } catch (error) {
            if (error.name == "TokenExpiredError") {
                return res.status(401).json({ status: 401, message: "Mã code đã hết hiệu lực" })
            }
        }
    }

    async login(req, res) {
        const { email, password } = req.body
        if (validator.isEmpty(email) || validator.isEmpty(password)) {
            return res.status(401).json({ status: 401, message: "Email và mật khẩu không được bỏ trống" })
        }
        if (!validator.isEmail(email)) {
            return res.status(401).json({ status: 401, message: "Email không hợp lệ" })
        }
        const user = await UserModel.findOne({ email: email, status: "active" })
        if (!user) {
            return res.status(401).json({ status: 401, message: "Không tìm thấy tài khoản" })
        }
        const comparePassword = await bcrypt.compare(password, user.password)
        if (!comparePassword) {
            return res.status(401).json({ status: 401, message: "Mật khẩu không đúng" })
        }
        const accessToken = await this.generateAccessToken({_id:user._id})
        const refreshToken = await this.generateRefreshToken({_id:user._id})
        user.refreshToken=refreshToken
        await user.save();
        return res.status(201).json({ status: 201, message: "Đăng nhập thành công", accessToken, refreshToken })
    }
    generateAccessToken(payload) {
        const accessToken = JWT.sign(payload, ACCESS_TOKEN, { expiresIn: "2h" })
        return accessToken
    }
    generateRefreshToken(payload) {
        const refreshToken = JWT.sign(payload, REFRESH_TOKEN, { expiresIn: "7d" })
        return refreshToken
    }

    async verificationAccount(req, res) {
        const { email } = req.body
        if (!validator.isEmail(email)) {
            return res.status(401).json({ status: 401, message: "Email không hợp lệ" })
        }
        const user = await UserModel.findOne({ email: email })
        if (!user) {
            return res.status(401).json({ status: 401, message: "Tài khoản không tìm thấy" })
        }
        const code = Math.floor(1000 + Math.random() * 9000)
        new Mail(user).sendCodeToConfirm(code)
        const codeToken = await JWT.sign({ code: code, _id: user._id }, CODE_TOKEN, { expiresIn: "3m" })
        const refreshCode = await JWT.sign({ _id: user._id }, CODE_TOKEN_REFRESH, { expiresIn: "1h" })
        const resetPasswordToken = await JWT.sign({ _id: user._id }, RESET_PASSWORD_TOKEN, { expiresIn: "1h" })
        return res.status(201).json({ status: 201, message: "Xác thực tài khản thành công", code: codeToken, refreshCode: refreshCode, resetPasswordToken: resetPasswordToken })
    }

    async resetNewPassword(req,res){
        const {tokenPassword,newPassword,confirmPassword}=req.body
        try {
            if (validator.isEmpty(newPassword)|| validator.isEmpty(confirmPassword)) {
                return res.status(401).json({status:401,message:"Mật khẩu không được bỏ trống"})
            }
            const options = {
                minLength: 8,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1,
            }
            if(newPassword !=confirmPassword){
                return res.status(401).json({status:401,message:"Xác thực mật khẩu không khớp"})
            }
            if (!validator.isStrongPassword(newPassword, options)) {
                return res.status(401).json({ status: 401, message: "Mật khẩu quá yếu" })
            }
            const decode=JWT.verify(tokenPassword,RESET_PASSWORD_TOKEN)
            const user = await UserModel.findById(decode._id)
            const hasPassword=await bcrypt.hash(newPassword,10)
            user.password=hasPassword
            user.save()
            return res.status(201).json({status:201,message:"Lấy lại mật khẩu mới thành công"})
        } catch (error) {
            if (error.name=="TokenExpiredError") {
                return res.status(401).json({ status: 401, message: "Thời gian lấy lại mật khẩu đã hết hạn" })
            }
        }
    }

    async refreshToken(req,res){
        const{refreshToken}=req.body
        try {
            if (validator.isEmpty(refreshToken)) {
                return res.status(401).json({status:401,message:"Chưa cung cấp mã token"})
            }
            const decode=JWT.verify(refreshToken,REFRESH_TOKEN)
            const user=await UserModel.findOne({_id:decode._id,refreshToken:refreshToken})
            if(!user){
                return res.status(401).json({status:401,message:"Mã token không hợp lệ"})
            }
            const accessToken=await this.generateAccessToken({id:user._id})
            return res.status(200).json({status:200,accessToken})
        } catch (error) {
            return res.status(500).json({status:500,message:error.message})
        }
    }
}
module.exports = new AuthRepository()