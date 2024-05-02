const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken')
const {showAuthorization} = require('../controllers/verifyTokenController')

router.post('/',verifyToken,(req,res) => {
    showAuthorization(req,res)
})

module.exports = router
