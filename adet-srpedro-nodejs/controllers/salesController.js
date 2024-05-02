const { insertSaleToDatabase, getCollectionWithForeign } = require('../functions/database')
const Sale = require('../models/saleModel')
const Employee = require('../models/employeeModel')
const Inventory = require('../models/inventoryModel')
const Branch = require('../models/branchModel')

const secretKey = process.env.CRYPTOJS_SECRET_KEY
const CryptoJS = require('crypto-js')

async function getAllSales(req, res) {
    const salesData = await getCollectionWithForeign(Sale, [
        { path: 'branch', populate: { path: 'supervisor' } },
        'products.product',
        'in_charge'
    ])
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(salesData), secretKey).toString();
    return res.status(200).json({sales: encryptedData})
}

async function insertSale(req, res) {
    const decryptedData = JSON.parse(CryptoJS.AES.decrypt(req.body.data, secretKey).toString(CryptoJS.enc.Utf8));
    const result = await insertSaleToDatabase(decryptedData)
    return res.json(result)
}

async function getInventoryByEmployee(req, res, id){
    const employee = await Employee.find({_id: id})
    switch(employee[0].role){
        case 'admin':
          break;
        case 'supervisor':
          const supervisorBranch = await Branch.find({supervisor: id})
          const supervisorInventory = await Inventory.find({branch_id: supervisorBranch[0]._id})
          const supervisorEncryptedData = CryptoJS.AES.encrypt(JSON.stringify(supervisorInventory), secretKey).toString();
          return res.status(200).json({inventory: supervisorEncryptedData})
          break;
        case 'cashier':
          const cashierBranch = await Branch.find({ employees: id });
          const cashierInventory = await Inventory.find({branch_id: cashierBranch[0]._id})
          const cashierEncryptedData = CryptoJS.AES.encrypt(JSON.stringify(cashierInventory), secretKey).toString();
          return res.status(200).json({inventory: cashierEncryptedData})
          break;
        default:
          null
      }}

module.exports = { getAllSales, insertSale, getInventoryByEmployee }