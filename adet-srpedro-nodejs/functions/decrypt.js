const CryptoJS = require('crypto-js')
const bcrypt = require('bcrypt');
const secretKey = process.env.CRYPTOJS_SECRET_KEY

async function decryptEmployeeInfo(data,files){
    
    const employeeInfo = {
        _id: CryptoJS.AES.decrypt(data._id, secretKey).toString(CryptoJS.enc.Utf8),
        first_name: CryptoJS.AES.decrypt(data.first_name, secretKey).toString(CryptoJS.enc.Utf8),
        middle_name: CryptoJS.AES.decrypt(data.middle_name, secretKey).toString(CryptoJS.enc.Utf8),
        last_name: CryptoJS.AES.decrypt(data.last_name, secretKey).toString(CryptoJS.enc.Utf8),
        gender: CryptoJS.AES.decrypt(data.gender, secretKey).toString(CryptoJS.enc.Utf8),
        citizenship: CryptoJS.AES.decrypt(data.citizenship, secretKey).toString(CryptoJS.enc.Utf8),
        email_address: CryptoJS.AES.decrypt(data.email_address, secretKey).toString(CryptoJS.enc.Utf8),
        contact_number: CryptoJS.AES.decrypt(data.contact_number, secretKey).toString(CryptoJS.enc.Utf8),
        postal_code: CryptoJS.AES.decrypt(data.postal_code, secretKey).toString(CryptoJS.enc.Utf8),
        barangay: CryptoJS.AES.decrypt(data.barangay, secretKey).toString(CryptoJS.enc.Utf8),
        municipality: CryptoJS.AES.decrypt(data.municipality, secretKey).toString(CryptoJS.enc.Utf8),
        province: CryptoJS.AES.decrypt(data.province, secretKey).toString(CryptoJS.enc.Utf8),
        role: CryptoJS.AES.decrypt(data.position, secretKey).toString(CryptoJS.enc.Utf8),
        birth_date: CryptoJS.AES.decrypt(data.birth_date, secretKey).toString(CryptoJS.enc.Utf8),
        user_role: CryptoJS.AES.decrypt(data.user_role, secretKey).toString(CryptoJS.enc.Utf8),
        user_id: CryptoJS.AES.decrypt(data.user_id, secretKey).toString(CryptoJS.enc.Utf8)
    }

    if (employeeInfo.role === 'supervisor' || employeeInfo.role === 'cashier'){
        try {
            const password = CryptoJS.AES.decrypt(data.password, secretKey).toString(CryptoJS.enc.Utf8)
            const hash = await bcrypt.hash(password, 10);
            employeeInfo.password = hash; // Add the hashed password to the object
            employeeInfo.username = CryptoJS.AES.decrypt(data.username, secretKey).toString(CryptoJS.enc.Utf8)
            employeeInfo.refresh_tokens = []
            return employeeInfo;
        } catch (error) {
            throw error;
        }
    }else{
        return employeeInfo;
    }
}

function decryptBranchInfo(data){

    const branchInfo = {
        _id: CryptoJS.AES.decrypt(data._id, secretKey).toString(CryptoJS.enc.Utf8),
        supervisor: CryptoJS.AES.decrypt(data.supervisor, secretKey).toString(CryptoJS.enc.Utf8),
        barangay: CryptoJS.AES.decrypt(data.barangay, secretKey).toString(CryptoJS.enc.Utf8),
        municipality: CryptoJS.AES.decrypt(data.municipality, secretKey).toString(CryptoJS.enc.Utf8),
        province: CryptoJS.AES.decrypt(data.province, secretKey).toString(CryptoJS.enc.Utf8),
        opening_date: CryptoJS.AES.decrypt(data.opening_date, secretKey).toString(CryptoJS.enc.Utf8),
        branch_name: CryptoJS.AES.decrypt(data.branch_name, secretKey).toString(CryptoJS.enc.Utf8),
        employees: data.employees.map((value) => decryptArrayElements(value, secretKey))
    }

    return branchInfo
}

function decryptArrayElements(value){
    return CryptoJS.AES.decrypt(value, secretKey).toString(CryptoJS.enc.Utf8);
}

module.exports = {
    decryptEmployeeInfo,
    decryptBranchInfo
}