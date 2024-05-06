const CryptoJS = require('crypto-js')
const secretKey = process.env.CRYPTOJS_SECRET_KEY
const {addProduct,updateData,handleArchive,deleteDataFromCollection} = require('../functions/database')
const {retrieveCollection,retrieveDataFromCollection} = require('../functions/database')
const ProductModel = require('../models/productsModel')
const ArchiveProduct = require('../models/archiveProductModel')

async function getAllProducts(req,res){
    const productsData = await retrieveCollection('Products')
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(productsData), secretKey).toString();
    console.log(productsData)
    console.log("Someone is getting the products")
    return res.status(200).json({products: productsData})
}

async function insertProduct(req,res){
    product = req.body
    console.log('This is the product (controller): ', product.nameValuePairs)
    const result = await addProduct(product.nameValuePairs)
    return res.json(result)
}

async function editProduct(req,res){
    productInfo = req.body.nameValuePairs
    console.log(productInfo)
    const id = productInfo._id
    try {
        // Use findOneAndUpdate to find and update the product
        const result = await ProductModel.findOneAndUpdate(
            { _id: id }, // Query: Find product by ID
            { $set: updatedProduct }, // Update: Set new product data
            { new: true } // Options: Return the updated document
        );

        if (!result) {
            return res.status(404).json({ error: "Product not found" });
        }

        return res.json(result); // Return the updated product
    } catch (error) {
        console.error("Error editing product:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function getProductByID(req,res,id){
    const product = await retrieveDataFromCollection('_id',id,ProductModel)
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(product), secretKey).toString();
    return res.status(200).json({product: product})
}

async function archiveProduct(req,res,id){
    console.log("id to be deleted (controller): ", id)
    const result = await deleteDataFromCollection('_id',id,ProductModel)
    return res.json(result)
}

module.exports = {getAllProducts,insertProduct,getProductByID,editProduct,archiveProduct}