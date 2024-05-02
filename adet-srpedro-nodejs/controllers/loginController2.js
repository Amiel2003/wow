const { insertRefreshToken } = require('../functions/database');
const { validateLoginInput, validateLoginInput2 } = require('../functions/validate')
const { encryptEmployeeInfo } = require('../functions/encrypt')
const CryptoJS = require('crypto-js')
const jwt = require('jsonwebtoken')
const axios = require('axios')

async function handleLogin(req, res) {
  const inputs = {
    "username": req.body.username,
    "password": req.body.password
  };
  
          const user = await validateLoginInput2(inputs);

          if (user == null) {
            console.log('null siya gurl')

            return res.status(403).json({ message: 'User not found' });
          } else
            if (typeof user === 'string') {

              return res.status(403).json({ message: user });
            } else
              if (user.archived === true) {
                return res.status(403).json({ message: 'User has been archived' });
              }
              else {
                const user_info = encryptEmployeeInfo(user);
                // const accessToken = jwt.sign(user_info, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_TIME })
                // const refreshToken = jwt.sign(user_info, process.env.REFRESH_TOKEN_SECRET)
                // await insertRefreshToken(refreshToken, user.username)
                return res.status(200).json({ user: user});
              }
        
}

module.exports = { handleLogin }