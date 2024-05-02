const { retrieveDataFromCollection, insertRefreshToken } = require('../functions/database');
const jwt = require('jsonwebtoken')
const CryptoJS = require('crypto-js')
const EmployeeModel = require('../models/employeeModel')
const { encryptEmployeeInfo } = require('../functions/encrypt')

async function handleGoogleSignIn(req, res) {
    const { email } = req.body;
    const userFound = await retrieveDataFromCollection("email_address", email, EmployeeModel)
    if (userFound.length === 0) {
        return res.json({ message: "Email is not registered!", found: false })
    } else {
        const user = userFound[0]
        if (user.archived === true) {
            return res.json({ message: "User has been archived", found: false })
        } else {
            const user_info = encryptEmployeeInfo(user);
            const accessToken = jwt.sign(user_info, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_TIME })
            const refreshToken = jwt.sign(user_info, process.env.REFRESH_TOKEN_SECRET)
            await insertRefreshToken(refreshToken, user.username)
            return res.status(200).json({ user: user_info, access_token: accessToken, refresh_token: refreshToken });
        }

    }
}

module.exports = { handleGoogleSignIn }