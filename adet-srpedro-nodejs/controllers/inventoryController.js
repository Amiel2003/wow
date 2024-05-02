const {getCollectionWithForeign,getValueWithForeign,retrieveCollection} = require('../functions/database')
const secretKey = process.env.CRYPTOJS_SECRET_KEY
const CryptoJS = require('crypto-js')
const Inventory = require('../models/inventoryModel')

async function getAllInventory(req,res){
    const inventoriesData = await getCollectionWithForeign(Inventory,  [
        { path: 'branch_id', populate: { path: 'supervisor' } },
        'products.product'
      ])
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(inventoriesData), secretKey).toString();
    return res.status(200).json({inventories: encryptedData})
}

async function getAllInventoryWithoutForeign(req,res){
    const inventoriesData = await retrieveCollection('Inventories')
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(inventoriesData), secretKey).toString();
    return res.status(200).json({inventories: encryptedData})
}

function insertInventory(req,res){
    console.log('Sale added successfully')
}

async function getInventoryByBranch(req,res,id){
    const filter = {branch_id:id}
    const inventory = await getValueWithForeign(Inventory,'branch_id products.product',filter)
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(inventory), secretKey).toString();
    return res.status(200).json({inventory: encryptedData})
}

module.exports = {getAllInventory,insertInventory,getInventoryByBranch,getAllInventoryWithoutForeign}