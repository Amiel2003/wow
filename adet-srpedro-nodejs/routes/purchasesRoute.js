const express = require('express');
const router = express.Router()
const bodyParser = require('body-parser'); //middleware to POST data
const {insertPurchase,getPurchases,subtractSupply} = require('../controllers/purchasesController')

router.use(bodyParser.urlencoded({ extended: true }));

router.post('/',(req,res)=>{
    insertPurchase(req,res)
})

router.post('/supplies',(req,res)=>{
    subtractSupply(req,res)
})

router.get('/',(req,res)=>{
    getPurchases(req,res)
})

module.exports = router