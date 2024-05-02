const express = require('express');
const router = express.Router();
const {handleGoogleSignIn} = require('../controllers/googleController')

router.post('/',async(req,res) => {
    handleGoogleSignIn(req,res)
})


module.exports = router
