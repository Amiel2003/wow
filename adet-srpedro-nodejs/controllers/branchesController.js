const { decryptBranchInfo } = require('../functions/decrypt')
const {getValueWithForeign, 
    getCollectionWithForeign, 
    updateData, 
    updateEmployeeArray, 
    handleArchive, 
    unarchiveBranchInDatabase, 
    retrieveArchived, 
    handleInventoryArchive,
    unarchiveInventoryInDatabase } = require('../functions/database')
const { addBranch } = require('../functions/database')
const CryptoJS = require('crypto-js')
const Branch = require('../models/branchModel')
const Employee = require('../models/employeeModel')
const ArchiveBranch = require('../models/archiveBranchModel')
const ArchiveInventory = require('../models/archiveInventoryModel')
const Inventory = require('../models/inventoryModel')
const secretKey = process.env.CRYPTOJS_SECRET_KEY

async function getAllBranches(req, res) {
    const branchesData = await getCollectionWithForeign(Branch, 'supervisor employees')
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(branchesData), secretKey).toString();
    return res.status(200).json({ branches: encryptedData })
}

async function insertBranch(req, res) {
    const data = decryptBranchInfo(req.body)
    const result = await addBranch(data)
    return res.json(result)
}

async function getBranchByID(req, res, id, attribute) {
    let filter = ''
    if(attribute === 'supervisor'){
        filter = { _id: id }
    }else{
        filter = {_id: id}
    }
    const branch = await getValueWithForeign(Branch, 'supervisor employees', filter)
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(branch[0]), secretKey).toString();
    return res.status(200).json({ branch: encryptedData })
}

async function getBranchByIDAsSupervisor(req, res, id, attribute) {
    let filter = ''
    if(attribute === 'supervisor'){
        filter = { [attribute]: id }
    }else{
        filter = {employees: id}
    }
    const branch = await getValueWithForeign(Branch, 'supervisor employees', filter)
    console.log(branch)
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(branch[0]), secretKey).toString();
    return res.status(200).json({ branch: encryptedData })
}

async function updateBranchByID(req, res) {
    const decryptedData = JSON.parse(CryptoJS.AES.decrypt(req.body.data, secretKey).toString(CryptoJS.enc.Utf8));
    const id = decryptedData._id
    const value = decryptedData.value
    const attribute = decryptedData.attribute
    console.log(id, value, attribute)

    const updatedBranch = await updateData(id, value, attribute, Branch)
    if (updatedBranch === true) {
        return res.status(200).json({ message: 'Branch updated successfully!' })
    } else {
        return res.status(500).json({ message: 'Could not update branch' })
    }
}

async function updateBranchEmployee(req, res) {
    const id = req.body.id
    const branch = req.body.branch_id
    const employee = await Employee.find({_id: id, role: {$nin:['supervisor','Supervisor']}})
    if(employee.length > 0){
        const updatedEmployeeArray = await updateEmployeeArray(id,branch)
        if(updatedEmployeeArray === true){
            return res.json({message: 'Employee added successfully',status: 200, employee: employee[0]})
        }else{
            return res.json({ message: 'Employee already exist in a branch or an error occured', status: 500 })
        }
    }else{
        return res.json({ message: 'Employee does not exist', status: 500 })
    }
}

async function deleteBranchEmployee(req,res){
    const id = req.body._id
    const branch = req.body.branch

    const branchIdUpdated = await Branch.findByIdAndUpdate(branch,
        {$pull: {employees: id}},
        {new: true}).populate('employees')
        
    if(!branchIdUpdated){
        return res.json({message: 'Error deleting employee!', status: 500})
    }else{
        return res.json({message: 'Deleted successfully!', status: 200, employees: branchIdUpdated.employees})
    }
}

async function archiveBranch(req,res){
    const decryptedID = CryptoJS.AES.decrypt(req.body._id, secretKey).toString(CryptoJS.enc.Utf8)
    const result = await handleArchive(decryptedID, Branch, '_id', ArchiveBranch)
    const archiveInventory = await handleInventoryArchive(decryptedID, Inventory, 'branch_id', ArchiveInventory) //archives branches' inventory
    return res.json(result)
}

async function getAllArchivedBranches(req,res){
    const data = await await getCollectionWithForeign(ArchiveBranch, 'supervisor employees')
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
    return res.json(encryptedData)
}

async function unarchiveBranch(req,res){
    const id = CryptoJS.AES.decrypt(req.body._id, secretKey).toString(CryptoJS.enc.Utf8)
    const inventory = await unarchiveInventoryInDatabase(id)
    const result = await unarchiveBranchInDatabase(id)
    return res.json(result)
}

module.exports = { getAllBranches, 
    insertBranch, 
    getBranchByID, 
    updateBranchByID, 
    updateBranchEmployee, 
    deleteBranchEmployee, 
    archiveBranch, 
    getAllArchivedBranches, 
    unarchiveBranch,
    getBranchByIDAsSupervisor}