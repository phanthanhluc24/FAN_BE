const { getStorage, ref, getDownloadURL, uploadBytesResumable } = require("firebase/storage")
const { initializeApp } = require("firebase/app")
const config = require("../configs/firebase.config")
initializeApp(config.firebaseConfig)
const storage = getStorage()
const ServiceModel = require("../models/ServiceModel")
const validator = require("validator")
const UserModel = require("../models/UserModel")
const Mail = require("../utils/sendNotificationService")
const BookingModel=require("../models/BookingModel")
const sharp = require('sharp');
const giveCurrentDateTime = () => {
    const today = new Date();
    const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime = date + ' ' + time;
    return dateTime;
}
class ServiceRepository {
    async addService(req, res) {
        const userId = req.user._id;
        const { price, desc, service_name } = req.body
        const file = req.file;
        try {
            if (!validator.isNumeric(price)||price.trim().length===0) {
                return res.status(201).json({ status: 400, message: "Giá tiền không hợp lệ" })
            }
            if(validator.isEmpty(service_name)||service_name.trim().length===0){
                return res.status(201).json({ status: 400, message: "Tên dịch vụ không được rỗng" })
            }
            if (validator.isEmpty(desc)||desc.trim().length===0) {
                return res.status(201).json({ status: 400, message: "Mô tả dịch vụ không được rỗng" })
            }
            if (file===undefined) {
                return res.status(201).json({ status: 400, message: 'Ảnh không được rỗng'});
            }
            const allowedMimeTypes = ['image/png', 'image/jpeg',"image/jpg"];
            if (!allowedMimeTypes.includes(file.mimetype)) {
                return res.status(201).json({ status: 400, message: 'File ảnh không hợp lệ' });
            }
            const maxSizeBytes = 5 * 1024 * 1024; // 5 MB
            if (file.size > maxSizeBytes) {
                return res.status(201).json({ status: 400, message: 'Dung lượng file quá lớn' });
            }

            const compressedImageBuffer = await sharp(file.buffer)
            .resize({ width: 800 }) // Điều chỉnh kích thước ảnh nếu cần
            .jpeg({ quality: 80 }) // Chỉ rõ chất lượng của ảnh JPEG
            .toBuffer();

            const dateTime = giveCurrentDateTime();
            const storageRef = ref(storage, `service/${req.file.originalname + "" + dateTime}`);
            // Create file metadata including the content type
            const metadata = {
                contentType: req.file.mimetype,
            };
            // Upload the file in the bucket storage
            const snapshot = await uploadBytesResumable(storageRef, compressedImageBuffer, metadata);
            //by using uploadBytesResumable we can control the progress of uploading like pause, resume, cancel
            // Grab the public url
            const user = await UserModel.findById(userId)
            const downloadURL = await getDownloadURL(snapshot.ref);
            const service = new ServiceModel()
            service.user_id = userId,
            service.service_name = service_name,
            service.price = price
            service.image = downloadURL
            service.desc = desc
            await service.save()
            const sendMail = new Mail(user).sendToRepairman({ full_name: user.full_name, service_name: service_name })
            if (!sendMail) {
                return res.status(201).json({ status: 401, message: "Gửi mail không thành công" })
            }
            return res.status(201).json({ status: 200, message: "Dịch vụ của bạn đang chờ kiểm duyệt bởi Admin" })
        } catch (error) {
            // return res.status(500).json({ status: 500, message: error })
            console.log(error);
        }
    }

    async getServices(req, res) {
        try {
            const service = await ServiceModel.find({ status: "active" })
            if (service.length == 0) {
                return res.status(200).json({ status: 200, message: "Hiện tại chưa có dịch vụ nào được hoạt động", data: service })
            }
            return res.status(200).json({ status: 200, message: "Lấy dịch vụ hoạt động thành công", data: service })
        } catch (error) {
            return res.status(500).json(error)
        }
    }

    async researchService(req, res) {
        const { search } = req.body
        try {
            if (validator.isEmpty(search)|| search.trim().length===0) {
                return res.status(201).json({ status: 401, message: "Nội dung tìm kiếm không được rỗng" })
            }

            const services = await ServiceModel.aggregate(
                [
                    {
                      $search: {
                        index: "text",
                        text: {
                          query: search,
                          path: {
                            wildcard: "*"
                          }
                        }
                      }
                    }
                  ]
            )
            if (services.length < 1) {
                return res.status(201).json({ status: 201, message: "Không tìm thấy kết quả" })
            }
            return res.status(201).json({ status: 201, data: services })
        } catch (error) {
            console.error('Error in searchService:', error);
        }
    }

    async getServiceById(req, res) {
        try {
            const { id } = req.params
            const service = await ServiceModel.findById(id).populate("user_id")
            if (!service) {
                return res.status(201).json({ status: 404, message: "Dịch vụ không tìm thấy" })
            }
            return res.status(201).json({ status: 201, data: service })
        } catch (error) {
            return res.status(500).json({ status: 500, message: "Id dịch vụ không hợp lệ" })
        }
    }

    async getServiceOfRepairmanSpecific(req, res) {
        try {
            const { id } = req.params
            const services = await ServiceModel.find({ user_id: id,status:"active" })
            if (services.length < 1) {
                return res.status(201).json({ status: 200, message: "Thợ này chưa có bất kỳ dịch vụ nào", data: services })
            }
            return res.status(201).json({ status: 201, data: services })
        } catch (error) {
            return res.status(500).json({ status: 500, message: "Tham số id không hợp lệ" })
        }
    }

    async getServiceOfRepairmanCurrent(req, res) {
        try {
            const userId = req.user._id
            const services = await ServiceModel.find({ user_id: userId,status:"active" })
            if (services.length < 1) {
                return res.status(201).json({ status: 200,data:services, message: "Bạn chưa có dịch vụ nào" })
            }
            return res.status(201).json({ status: 201, data: services })
        } catch (error) {
            return res.status(500).json({ status: 500, message: "Lỗi từ server" })
        }
    }

    async getServiceRelateByCategory(req, res) {
        try {
            const service_id = req.params.service_id
            const service = await ServiceModel.findById(service_id).populate("user_id")
            if (!service) {
                return res.status(201).json({status:404,message:"Không tìm thấy dịch vụ này"})
            }
            const category_id = service.user_id.category_id.toString();
            const serviceCategory = await UserModel.find({ category_id: category_id })
            if (!serviceCategory) {
                return res.status(201).json({status:404,message:"Không tìm thấy danh mục này"})
            }
            const serviceRelatedByCategory = serviceCategory
                .map(service => service._id)
                .filter(id => id.toString() !== service_id);
            const relatedServices = await ServiceModel.find({ user_id: { $in: serviceRelatedByCategory },_id:{$ne:service_id},status:{$ne:"inactive"}});
            if (relatedServices.length<1) {
                return res.status(201).json({status:201,message:"không có dịch vụ liên quan nào được tìm thấy",data:relatedServices})
            }
            return res.status(201).json({status:201,data:relatedServices})
        } catch (error) {
            return res.status(500).json({ status: 500, message: "Tham số id không hợp lệ" })
        }

    }

    async editServiceOfRepairman(req,res){
        try {
            const {service_name,price,desc}=req.body
            const file=req.file
            const service_id=req.params.id
            const userId=req.user._id
            if (!validator.isNumeric(price)||price.trim().length===0) {
                return res.status(201).json({ status: 400, message: "Giá tiền không hợp lệ" })
            }
            if(validator.isEmpty(service_name)||service_name.trim().length===0){
                return res.status(201).json({ status: 400, message: "Tên dịch vụ không được rỗng" })
            }
            if (validator.isEmpty(desc)||desc.trim().length===0) {
                return res.status(201).json({ status: 400, message: "Mô tả dịch vụ không được rỗng" })
            }
            const service=await ServiceModel.findById({_id:service_id})
            if (!service) {
                return res.status(200).json({status:400,message:"Không tìm thấy dịch vụ"})
            }
            const checkService=await ServiceModel.findOne({_id:service_id,user_id:userId,status:"active"})
            if (!checkService) {
                return res.status(200).json({status:400,message:"Không tìm thấy dịch vụ"})
            }
            if (file===undefined) {
                service.service_name=service_name
                service.price=price
                service.desc=desc
                await service.save()
                return res.status(200).json({status:200,message:"Cập nhật dịch vụ thành công"})
            }
            const allowedMimeTypes = ['image/png', 'image/jpeg',"image/jpg"];
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
            const downloadURL = await getDownloadURL(snapshot.ref);
            service.service_name=service_name
            service.price=price
            service.desc=desc
            service.image=downloadURL
            await service.save()
            return res.status(200).json({status:200,message:"Cập nhật dịch vụ thành công"})
        } catch (error) {
            return res.status(500).json({status:500,message:error.message})
        }

    }

    async destroyServiceOfRepairman(req,res){
        try {
            const service_id=req.params.id
            const userId=req.user._id
            const service=await ServiceModel.findOne({_id:service_id,user_id:userId})
            if (!service) {
                return res.status(200).json({status:400,message:"Không tìm thấy dịch vụ"})
            }
            const checkBooking=await BookingModel.find({service_id:service._id})
            if (checkBooking.length>=1) {
                return res.status(200).json({status:401,message:"Bạn không thể xóa dịch vụ này"})
            }
            service.status="inactive"
            await service.save()
            return res.status(200).json({status:200,message:"Xóa dịch vụ thành công"})
        } catch (error) {
            return res.status(500).json({status:500,message:error.message})
        }
    }
}
module.exports = new ServiceRepository()