const { insertRefreshToken } = require('../functions/database');
const { validateLoginInput } = require('../functions/validate')
const { encryptEmployeeInfo } = require('../functions/encrypt')
const CryptoJS = require('crypto-js')
const jwt = require('jsonwebtoken')
const axios = require('axios')

function handleLogin(req, res) {
  const inputs = {
    "username": req.body.username,
    "password": req.body.password
    , "recaptchaResponse": req.body.recaptchaResponse
  };
  const secretKey = process.env.CRYPTOJS_SECRET_KEY;
  const recaptchaSecretKey = process.env.RECAPTCHA_SECRET_KEY;

  try {
    // Verify reCAPTCHA response with Google
    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify`;
    const data = new URLSearchParams();
    data.append('secret', recaptchaSecretKey);
    data.append('response', inputs.recaptchaResponse);

    axios.post(verificationUrl, data)
      .then(async response => {
        const body = response.data;

        if (!body.success) {
          // reCAPTCHA verification failed
          console.log("RECAPTCHA failed!")
          return res.status(403).json({ message: 'reCAPTCHA failed' });
        } else {
          // reCAPTCHA verification passed
          console.log("RECAPTCHA passed!")
          const user = await validateLoginInput(inputs);

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
                const accessToken = jwt.sign(user_info, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_TIME })
                const refreshToken = jwt.sign(user_info, process.env.REFRESH_TOKEN_SECRET)
                await insertRefreshToken(refreshToken, user.username)
                return res.status(200).json({ user: user_info, access_token: accessToken, refresh_token: refreshToken });
              }
        }
      })
  } catch (error) {
    console.error("Error verifying reCAPTCHA:", error);
    return res.status(403).json({ message: 'Error verifying reCAPTCHA' });
  }
}

module.exports = { handleLogin }