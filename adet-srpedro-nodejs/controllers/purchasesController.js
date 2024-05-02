const CryptoJS = require('crypto-js')
const secretKey = process.env.CRYPTOJS_SECRET_KEY
const {addPurchase,retrieveCollection,updateSupply,getCollectionWithForeign} = require('../functions/database')
const Purchase = require('../models/purchaseModel')

async function insertPurchase(req,res){
    const decryptedData = JSON.parse(CryptoJS.AES.decrypt(req.body.data, secretKey).toString(CryptoJS.enc.Utf8));
    const result = await addPurchase(decryptedData)
    return res.json(result)
}

async function getPurchases(req,res){
    const purchases = await getCollectionWithForeign(Purchase, 'branch_id product')
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(purchases), secretKey).toString();
    return res.status(200).json({ purchases: encryptedData })
}

async function subtractSupply(req,res){
    const decryptedData = JSON.parse(CryptoJS.AES.decrypt(req.body.supply, secretKey).toString(CryptoJS.enc.Utf8));
    const result = await updateSupply(decryptedData)
    console.log(result)
    return res.json(result)
}

module.exports = {insertPurchase,getPurchases,subtractSupply}