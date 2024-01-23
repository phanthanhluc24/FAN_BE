const { getStorage, ref, getDownloadURL, uploadBytesResumable } = require("firebase/storage")
const { initializeApp } = require("firebase/app")
const config = require("../configs/firebase.config")
initializeApp(config.firebaseConfig)
const storage = getStorage()
const ServiceModel=require("../models/ServiceModel")
const validator=require("validator")
const UserModel=require("../models/UserModel")
const Mail=require("../utils/sendNotificationService")
const giveCurrentDateTime = () => {
    const today = new Date();
    const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime = date + ' ' + time;
    return dateTime;
}
class ServiceRepository {
    async addService(req, res) {
        const userId =req.user._id
        console.log(userId);
        const { price, desc,service_name } = req.body
        const file = req.file;
        try {
            if (!validator.isNumeric(price)) {
                return res.status(201).json({status:401,message:"Giá tiền không hợp lệ"})
            }
            if(validator.isEmpty(desc) || validator.isEmpty(service_name)){
                return res.status(201).json({status:401,message:"Mô tả và tên dịch vụ không được rỗng"})
            }
            const allowedMimeTypes = ['image/png', 'image/jpeg'];
            if (!allowedMimeTypes.includes(file.mimetype)) {
                return res.status(201).json({ status: 400, message: 'File ảnh không hợp lệ' });
            }
            const maxSizeBytes = 5 * 1024 * 1024; // 5 MB
            if (file.size > maxSizeBytes) {
                return res.status(201).json({ status: 400, message: 'Dung lượng file quá lớn' });
            }
            const dateTime = giveCurrentDateTime();
            const storageRef = ref(storage, `service/${req.file.originalname + "" + dateTime}`);
            // Create file metadata including the content type
            const metadata = {
                contentType: req.file.mimetype,
            };
            // Upload the file in the bucket storage
            const snapshot = await uploadBytesResumable(storageRef, req.file.buffer, metadata);
            //by using uploadBytesResumable we can control the progress of uploading like pause, resume, cancel
            // Grab the public url
            const user=await UserModel.findById(userId)
            const downloadURL = await getDownloadURL(snapshot.ref);
            const service=new ServiceModel()
            service.user_id=userId,
            service.service_name=service_name,
            service.price=price
            service.image=downloadURL
            service.desc=desc
            await service.save()
            const sendMail=new Mail(user).sendToRepairman({full_name:user.full_name,service_name:service_name})
            if(!sendMail){
                return res.status(201).json({status:401,message:"Gửi mail không thành công"})
            }
            return res.status(201).json({status:200,message:"Dịch vụ của bạn đang chờ kiểm duyệt bởi Admin"})
        } catch (error) {
            // return res.status(500).json({ status: 500, message: error })
            console.log(error);
        }
    }

    async getServices(req,res){
        try {
            const service=await ServiceModel.find({status:"active"})
            if (service.length==0) {
                return res.status(200).json({status:200,message:"Hiện tại chưa có dịch vụ nào được hoạt động",data:service})
            }
            return res.status(200).json({status:200,message:"Lấy dịch vụ hoạt động thành công",data:service})
        } catch (error) {
            return res.status(500).json(error)
        }
    }

    async researchService(req,res){
        const {search}=req.body
        try {
            if(validator.isEmpty(search)){
                return res.status(201).json({status:401,message:"Nội dung tìm kiếm không được rỗng"})
            }
            const services=await ServiceModel.find({
                service_name: { $regex: search, $options: 'i' },
                status: 'active'})
            if(services.length<1){
                return res.status(201).json({status:201,message:"Không tìm thấy kết quả"})
            }
                return res.status(201).json({status:201,data:services})
        } catch (error) {
            console.error('Error in searchService:', error);
        }
    }

    async getServiceById(req,res){
        try {
            const {id}=req.params
            const service=await ServiceModel.findById(id).populate("user_id")
            if(!service){
                return res.status(201).json({status:404,message:"Dịch vụ không tìm thấy"})
            }
            return res.status(201).json({status:201,data:service})
        } catch (error) {
            return res.status(500).json({status:500,message:"Id dịch vụ không hợp lệ"})
        }
    }

    async getServiceOfRepairmanSpecific(req,res){
        try {
            const {id}=req.params
            const services=await ServiceModel.find({user_id:id})
            if (services.length<1) {
                return res.status(201).json({status:200,message:"Thợ này chưa có bất kỳ dịch vụ nào",data:services})
            }
            return res.status(201).json({status:201,data:services})
        } catch (error) {
            return res.status(500).json({status:500,message:"Tham số id không hợp lệ"})
        }
    }

    async getServiceOfRepairmanCurrent(req,res){
        try {
            const userId=req.user._id
            const services=await ServiceModel.find({userId})
            if(services.length<1){
                return res.status(201).json({status:200,message:"Bạn chưa có dịch vụ nào"})
            }
            return res.status(201).json({status:201,data:services})
        } catch (error) {
            return res.status(500).json({status:500,message:"Lỗi từ server"})
        }
    }
}
module.exports = new ServiceRepository()