const CategoriesModel = require("../models/CategoriesModel")
const validator = require("validator")
class CategoryRepository {
    async creteCategory(req, res) {
        const { name } = req.body
        try {
            if (validator.isEmpty(name)) {
                return res.status(401).json({ status: 401, message: "Category name is required" })
            }
            const category = new CategoriesModel()
            category.name = name
            const newCategory =await category.save()
            return res.status(201).json({status:201,message:"Create new category successfully",data:newCategory})
        } catch (error) {
            return res.status(500).json(error)
        }
    }

    async categories(req,res){
        try {
            const categories=await CategoriesModel.find();
            return res.status(200).json({status:200,message:"Get categories successfully",data:categories})
        } catch (error) {
            return res.status(500).json(error)
        }
    }
}
module.exports = new CategoryRepository()