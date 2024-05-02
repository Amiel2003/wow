const express = require('express');
const router = express.Router()
const bodyParser = require('body-parser'); //middleware to POST data
const {getAllInventory,insertInventory,getInventoryByBranch,getAllInventoryWithoutForeign} = require('../controllers/inventoryController')

router.use(bodyParser.urlencoded({ extended: true }));

router.get('/',(req,res)=>{
    getAllInventory(req,res)
})

router.post('/',(req,res)=>{
    insertInventory(req,res)
})

router.get('/:id',(req,res)=>{
    const id = req.params.id
    getInventoryByBranch(req,res,id)
})

router.get('/sale/get',(req,res)=>{
    getAllInventoryWithoutForeign(req,res)
})

module.exports = router