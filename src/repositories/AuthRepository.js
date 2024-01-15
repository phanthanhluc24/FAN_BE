const UserModel = require("../models/UserModel")
const bcrypt = require("bcrypt")
const validator = require("validator")
const JWT = require("jsonwebtoken")
const dotenv = require("dotenv")
dotenv.config()
const CODE_TOKEN = process.env.CODE_TOKEN
const Mail=require("../utils/sendEmail")
class AuthRepository {
    async register(req, res) {
        const { full_name, email, number_phone, password, address, role, category_id } = req.body
        try {
            if (validator.isEmpty(full_name) || validator.isEmpty(email) ||validator.isEmpty(number_phone) ||validator.isEmpty(password)) {
                return res.status(401).json({ status: 401, message: "All field is required" })
            }
            if (!validator.isEmail(email)) {
                return res.status(401).json({ status: 401, message: "Invalid email to register" })
            }
            if (!validator.isMobilePhone(number_phone, "vi-VN")) {
                return res.status(401).json({ status: 401, message: "Invalid number phone to register" })
            }
            const exitAccount = await UserModel.findOne({ $or: [{ email: email }, { number_phone: number_phone }] })
            if (exitAccount) {
                return res.status(409).json({ status: 409, message: "Email or number phone already exits in system" })
            }
            const options = {
                minLength: 8,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1,
            }
            if (!validator.isStrongPassword(password, options)) {
                return res.status(401).json({ status: 401, message: "Password must be strong" })
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
            const code=Math.floor(1000  + Math.random() * 900000)
            new Mail(newUser).sendCodeToConfirm(code)
            const codeToken = await JWT.sign({code:code}, CODE_TOKEN,{expiresIn:"3m"})
            return res.status(200).json({ status: 200, message: "Create new account successfully", code:codeToken })
        } catch (error) {
            return res.status(500).json({ status: 500, message: error })
        }

    }
}
module.exports = new AuthRepository()