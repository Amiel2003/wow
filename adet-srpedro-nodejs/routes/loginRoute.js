const express = require('express');
const router = express.Router()
const {handleLogin} = require('../controllers/loginController2')

router.post('/',async (req,res) => {
    handleLogin(req,res)
})

module.exports = router;