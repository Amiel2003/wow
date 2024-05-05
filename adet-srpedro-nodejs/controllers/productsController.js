const CryptoJS = require('crypto-js')
const secretKey = process.env.CRYPTOJS_SECRET_KEY
const {addProduct,updateData,handleArchive} = require('../functions/database')
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
    productInfo = req.body.data
    const id = productInfo._id
    const value = productInfo.value
    const attribute = productInfo.attribute
    const updateProduct = await updateData(id, value, attribute, ProductModel)
    if (updateProduct === true) {
        return res.status(200).json({message: 'Product updated successfully!'})
    }
}

async function getProductByID(req,res,id){
    const product = await retrieveDataFromCollection('_id',id,ProductModel)
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(product), secretKey).toString();
    return res.status(200).json({product: product})
}

async function archiveProduct(req,res){
    id = req.body.id
    // const decryptedID = CryptoJS.AES.decrypt(req.body.id, secretKey).toString(CryptoJS.enc.Utf8)
    const result = await handleArchive(id, ProductModel, '_id', ArchiveProduct)
    return res.json(result)
}

module.exports = {getAllProducts,insertProduct,getProductByID,editProduct,archiveProduct}