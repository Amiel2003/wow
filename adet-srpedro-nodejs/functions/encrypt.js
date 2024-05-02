const CryptoJS = require('crypto-js');

function encryptEmployeeInfo(user) {
    const secretKey = process.env.CRYPTOJS_SECRET_KEY;

    const user_info = {
        _id: CryptoJS.AES.encrypt(user._id.toString(), secretKey).toString(),
        username: CryptoJS.AES.encrypt(user.username, secretKey).toString(),
        role: CryptoJS.AES.encrypt(user.role, secretKey).toString(),
        email_address: CryptoJS.AES.encrypt(user.email_address, secretKey).toString(),
        first_name: CryptoJS.AES.encrypt(user.first_name, secretKey).toString(),
        middle_name: CryptoJS.AES.encrypt(user.middle_name, secretKey).toString(),
        last_name: CryptoJS.AES.encrypt(user.last_name, secretKey).toString(),
        gender: CryptoJS.AES.encrypt(user.gender, secretKey).toString(),
        citizenship: CryptoJS.AES.encrypt(user.citizenship, secretKey).toString(),
        contact_number: CryptoJS.AES.encrypt(user.contact_number.toString(), secretKey).toString(),
        postal_code: CryptoJS.AES.encrypt(user.postal_code.toString(), secretKey).toString(),
        barangay: CryptoJS.AES.encrypt(user.barangay, secretKey).toString(),
        municipality: CryptoJS.AES.encrypt(user.municipality, secretKey).toString(),
        province: CryptoJS.AES.encrypt(user.province, secretKey).toString(),
        valid_id: CryptoJS.AES.encrypt(user.valid_id, secretKey).toString(),
        birth_certificate: CryptoJS.AES.encrypt(user.birth_certificate, secretKey).toString(),
        date_added: CryptoJS.AES.encrypt(user.date_added.toISOString(), secretKey).toString(),
        birth_date: CryptoJS.AES.encrypt(user.birth_date.toISOString(), secretKey).toString(),
    };

    return user_info;
}

module.exports = {
    encryptEmployeeInfo
};
