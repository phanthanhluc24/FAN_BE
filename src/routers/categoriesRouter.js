const express=require("express")
const router=express.Router()
const CategoriesController=require("../controllers/CategoriesController")
router.route("/")
.get(CategoriesController.categories)
.post(CategoriesController.createCategory)

module.exports=router