const { retrieveDataFromCollection, retrieveCollection, addEmployee, 
     updatePositionCredentials, removeCredentials, removeSupervisorFromBranch, updateData, handleArchive, retrieveArchived, unarchiveEmployeeInDatabase } = require('../functions/database')
const {sendEmployeeCredentials} = require('../functions/email')
const CryptoJS = require('crypto-js')
const { decryptEmployeeInfo } = require('../functions/decrypt')
const EmployeeModel = require('../models/employeeModel')
const ArchiveEmployee = require('../models/archiveEmployeeModel')
const secretKey = process.env.CRYPTOJS_SECRET_KEY
const fs = require('fs').promises

async function getAllEmployees(req, res) {
    const employeesData = await retrieveCollection('Employees')
    const secretKey = process.env.CRYPTOJS_SECRET_KEY
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(employeesData), secretKey).toString();
    return res.status(200).json({ employees: encryptedData })
}

async function insertEmployee(req, res) {
    const employeeInfo = await decryptEmployeeInfo(req.body, req.files)
    if (employeeInfo.role === 'supervisor' || employeeInfo.role === 'cashier') {
        const password = CryptoJS.AES.decrypt(req.body.password, secretKey).toString(CryptoJS.enc.Utf8)
        const result = await addEmployee(password, employeeInfo)
        return res.json(result)
    } else {
        const password = ''
        const result = await addEmployee(password, employeeInfo)
        return res.json(result)
    }
}

async function getEmployeeByID(req, res, id) {
    const employee = await retrieveDataFromCollection('_id', id, EmployeeModel)
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(employee), secretKey).toString();
    return res.status(200).json({ employee: encryptedData })
}

async function updateEmployeeByID(req, res) {
    const decryptedData = JSON.parse(CryptoJS.AES.decrypt(req.body.data, secretKey).toString(CryptoJS.enc.Utf8));

    const id = decryptedData._id
    const value = decryptedData.value
    const attribute = decryptedData.attribute
    const userName = decryptedData.username
    const passWord = decryptedData.password
    const emailAdd = decryptedData.email
    const oldRole = decryptedData.role

    if (attribute === 'email_address') {
        const doesEmailExist = await retrieveDataFromCollection(attribute, value, EmployeeModel)
        if (doesEmailExist.length !== 0) {
            return res.status(200).json({ message: 'Email already in use' })
        }
    }

    if(oldRole === 'supervisor'){
        await removeSupervisorFromBranch(id)
    }

    const updatedEmployee = await updateData(id, value, attribute, EmployeeModel)
    if (updatedEmployee === true) {
        const emailForPositionChange = {
            role: value,
            username: userName,
            email_address: emailAdd
        }
        //creates username & password fields when changing to regular employee to supervisor/cashier
        if (attribute === 'role' && value === 'supervisor' || attribute === 'role' && value === 'cashier') {
            const udpatePosition = await updatePositionCredentials(id, userName, passWord)
            if(udpatePosition === true){
                sendEmployeeCredentials(passWord,emailForPositionChange)
                return res.status(200).json({message: 'Employee updated successfully!'})
            }
        }else 
        if(attribute === 'role' && value !== 'supervisor' || attribute === 'role' && value !== 'cashier'){
            //deletes username and password when changing to supervisor/cashier to regular employee
            const removeEmployeeCredentials = await removeCredentials(id)
            if(removeEmployeeCredentials === true){
                sendEmployeeCredentials(passWord,emailForPositionChange)
                return res.status(200).json({message: 'Employee updated successfully!'})
            }
        } else {
            return res.status(200).json({ message: 'Employee updated successfully!' })
        }
    } else {
        return res.status(500).json({ message: 'Could not update employee' })
    }
}

async function updateFiles(req,res){
    const path = req.file.path
    const id = CryptoJS.AES.decrypt(req.body._id, secretKey).toString(CryptoJS.enc.Utf8)
    const attribute = CryptoJS.AES.decrypt(req.body.attribute, secretKey).toString(CryptoJS.enc.Utf8)
    
    const update = await updateData(id,path,attribute,EmployeeModel)
    if(update === true){
        const oldValue = CryptoJS.AES.decrypt(req.body.old_value, secretKey).toString(CryptoJS.enc.Utf8)
        try {
            try {
                await fs.unlink(oldValue); // Use fs.unlink to delete the file
                console.log('File deleted successfully');
              } catch (error) {
                console.error('Error deleting the file:', error);
              }
        } catch (error) {
            console.error('Error deleting the file:', error);
        }

        return res.status(200).json({message:'Employee updated successfully!',path: path})
    }
}

async function archiveEmployee(req,res){
    const decryptedID = CryptoJS.AES.decrypt(req.body.id, secretKey).toString(CryptoJS.enc.Utf8)
    const result = await handleArchive(decryptedID, EmployeeModel, '_id', ArchiveEmployee)
    return res.json(result)
}

async function getAllArchivedEmployees(req,res){
    const data = await retrieveArchived('ArchivedEmployees')
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
    return res.json(encryptedData)
}

async function unarchiveEmployee(req,res){
    const id = CryptoJS.AES.decrypt(req.body._id, secretKey).toString(CryptoJS.enc.Utf8)
    const result = unarchiveEmployeeInDatabase(id)
    return res.json(result)
}

module.exports = { getAllEmployees, 
    insertEmployee, 
    getEmployeeByID, 
    updateEmployeeByID, 
    updateFiles, 
    archiveEmployee, 
    getAllArchivedEmployees,
    unarchiveEmployee }