const express = require('express');
const router = express.Router()
const {handleLogout} = require('../controllers/logoutController')
const verifyToken = require('../middlewares/verifyToken')

router.post('/', verifyToken, async (req,res) => {
    handleLogout(req,res)
})

module.exports = router;