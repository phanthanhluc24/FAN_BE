const UserModel = require("../models/UserModel")
const { getStorage, ref, getDownloadURL, uploadBytesResumable } = require("firebase/storage")
const { initializeApp } = require("firebase/app")
const config = require("../configs/firebase.config")
initializeApp(config.firebaseConfig)
const storage = getStorage()
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
            const repairmans = await UserModel.find({ role: "RPM", status: "active" });
            const paginatePage = repairmans.slice(startIndex, endIndex)
            return res.json({ "status": 200, "data": paginatePage, "total": repairmans.length })
        } catch (error) {
            console.log(error);
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

    async getRepairmanByCategory(req,res){
        try {
            const {id}=req.params
            const repairmans=await UserModel.find({category_id:id,status:"active"})
            if(repairmans.length<1){
                return res.status(201).json({status:404,message:"Không tìm thấy thợ"})
            }
            return res.status(201).json({status:201,data:repairmans})
        } catch (error) {
            return res.status(500).json({status:500,message:"Id danh mục thợ không hợp lệ"})
        }
    }

    async getRepairmanById(req,res){
        try {
            const {id}=req.params
            const repairman=await UserModel.findById(id)
            if(!repairman){
                return res.status(201).json({status:404,message:"Không tìm thấy thợ"})
            }
            return res.status(201).json({status:201,data:repairman})
        } catch (error) {
            return res.status(500).json({status:500,message:"Id không hợp lệ"})
        }
    }
}

module.exports = new UserRepository()