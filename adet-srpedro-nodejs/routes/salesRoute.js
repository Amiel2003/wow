const express = require('express');
const router = express.Router()
const bodyParser = require('body-parser'); //middleware to POST data
const {getAllSales,insertSale,getInventoryByEmployee} = require('../controllers/salesController')

router.use(bodyParser.urlencoded({ extended: true }));

router.get('/',(req,res)=>{
    getAllSales(req,res)
})

router.post('/',(req,res)=>{
    insertSale(req,res)
})

router.get('/:id',(req,res)=>{
    const id = req.params.id
    getInventoryByEmployee(req,res,id)
})


module.exports = router