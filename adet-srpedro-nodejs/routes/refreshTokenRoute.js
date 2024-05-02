const express = require('express');
const router = express.Router()
const {handleRefreshTokens} = require('../controllers/refreshTokenController')

router.post('/',async (req,res) => {
    handleRefreshTokens(req,res)
})

module.exports = router;