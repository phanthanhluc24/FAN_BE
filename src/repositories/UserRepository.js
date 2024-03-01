const UserModel = require("../models/UserModel")
const { getStorage, ref, getDownloadURL, uploadBytesResumable } = require("firebase/storage")
const { initializeApp } = require("firebase/app")
const config = require("../configs/firebase.config")
initializeApp(config.firebaseConfig)
const CommentModel=require("../models/CommentModel")
const storage = getStorage()
const validator=require("validator")
const giveCurrentDateTime = () => {
    const today = new Date();
    const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime = date + ' ' + time;
    return dateTime;
}
class UserRepository {
    async getRepairmans(req, res) {
        const currentPage = parseInt(req.params.currentPage)
        const pageSize = 10
        const startIndex = (currentPage - 1) * pageSize
        const endIndex = currentPage * pageSize
        try {
            const repairmen = await UserModel.find({ role: "RPM",status:"active" });
            const averageStars = await Promise.all(
                repairmen.map(async (repairman) => {
                    const comments = await CommentModel.find({ receiver_id: repairman._id });
                    if (comments.length > 0) {
                        const totalStars = comments.reduce((acc, comment) => acc + comment.star, 0);
                        return { _id: repairman._id,full_name:repairman.full_name,avatar:repairman.image, averageStar: totalStars / comments.length };
                    } else {
                        return { _id: repairman._id,full_name:repairman.full_name,avatar:repairman.image, averageStar: 0 };
                    }
                })
            );
            const paginatePage = averageStars.slice(startIndex, endIndex)
            return res.json({ "status": 200, "data": paginatePage, "total": averageStars.length });
        } catch (error) {
            return res.status(500).json(error)
        }
    }

    async uploadAvatar(req, res) {
        const userId = req.user._id
        const file = req.file;
        try {
            const allowedMimeTypes = ['image/png', 'image/jpeg'];
            if (!allowedMimeTypes.includes(file.mimetype)) {
                return res.status(201).json({ status: 400, message: 'File ảnh không hợp lệ' });
            }
            const maxSizeBytes = 5 * 1024 * 1024; // 5 MB
            if (file.size > maxSizeBytes) {
                return res.status(201).json({ status: 400, message: 'Dung lượng file quá lớn' });
            }
            const dateTime = giveCurrentDateTime();
            const storageRef = ref(storage, `avatar/${req.file.originalname + "" + dateTime}`);
            // Create file metadata including the content type
            const metadata = {
                contentType: req.file.mimetype,
            };
            // Upload the file in the bucket storage
            const snapshot = await uploadBytesResumable(storageRef, req.file.buffer, metadata);
            //by using uploadBytesResumable we can control the progress of uploading like pause, resume, cancel
            const downloadURL = await getDownloadURL(snapshot.ref);
            const user = await UserModel.findById(userId)
            user.image = downloadURL
            await user.save()
            return res.status(200).json({ status: 201, message: 'Thay ảnh đại diện thành công' })
        } catch (error) {
            return res.status(400).send(error.message)
        }
    }

    async getRepairmanByCategory(req, res) {
        try {
            const { id } = req.params
            const repairmans = await UserModel.find({ category_id: id })
            if (repairmans.length < 1) {
                return res.status(201).json({ status: 404, message: "Không tìm thấy thợ" })
            }
            const averageStar=await Promise.all(
                repairmans.map(async (repairman)=>{
                    const comments =await CommentModel.find({receiver_id:repairman._id});
                    if (comments.length > 0) {
                        const totalStars = comments.reduce((acc, comment) => acc + comment.star, 0);
                        return { _id: repairman._id,full_name:repairman.full_name,avatar:repairman.image, averageStar: totalStars / comments.length };
                    } else {
                        return { _id: repairman._id,full_name:repairman.full_name,avatar:repairman.image, averageStar: 0 };
                    }
                })
            )
            return res.status(201).json({ status: 201, data: averageStar })
        } catch (error) {
            return res.status(500).json({ status: 500, message: "Id danh mục thợ không hợp lệ" })
        }
    }

    async getRepairmanById(req, res) {
        try {
            const { id } = req.params
            const repairman = await UserModel.findById(id).populate("category_id")
            if (!repairman) {
                return res.status(201).json({ status: 404, message: "Không tìm thấy thợ" })
            }
            return res.status(201).json({ status: 201, data: repairman })
        } catch (error) {
            console.log(error)
            return res.status(500).json({ status: 500, message: "Id không hợp lệ" })
        }
    }

    async editInformation(req,res){
        try {
            const userId=req.user._id
            const {full_name,number_phone}=req.body
            console.log(number_phone)
            if (validator.isEmpty(full_name)) {
                return res.status(201).json({ status: 400, message: "Họ tên không được bỏ trống" })
            }
            if (validator.isEmpty(number_phone)) {
                return res.status(201).json({ status: 400, message: "Số điện thoại không được bỏ trống" })
            }
            if (!validator.isMobilePhone(number_phone, "vi-VN")) {
                return res.status(201).json({ status: 400, message: "Số điện thoại không hợp lệ" })
            }
            const exitAccount = await UserModel.findOne({
                number_phone: number_phone,
                $and: [
                  { status: { $ne: "inactive" } },
                  { _id: { $ne: userId } }
                ]
              });
              
            if (exitAccount) {
                return res.status(201).json({ status: 409, message: "Số điện thoại đã tồn tại" })
            }
            const user=await UserModel.findById({_id:userId})
            if (!user) {
                return res.status(200).json({status:404,message:"Không tìm thấy người dùng"})
            }
            user.full_name=full_name
            user.number_phone=number_phone
            await user.save()
            return res.status(200).json({status:200,message:"Cập nhật thông tin thành công"})
        } catch (error) {
            return res.status(201).json({ status: 500, message: error.message })
        }
    }
}

module.exports = new UserRepository()