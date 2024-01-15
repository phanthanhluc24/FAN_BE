const CategoryRepository=require("../repositories/CategoryRepository")
class CategoriesController{
    async createCategory(req,res){
        await CategoryRepository.creteCategory(req,res)
    }

    async categories(req,res){
        await CategoryRepository.categories(req,res)
    }
}
module.exports=new CategoriesController()