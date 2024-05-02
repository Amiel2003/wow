const express = require('express');
const router = express.Router()
const bodyParser = require('body-parser'); //middleware to POST data
const {getAllReports,insertReport} = require('../controllers/reportController')

router.use(bodyParser.urlencoded({ extended: true }));

router.get('/',(req,res)=>{
    getAllReports(req,res)
})

router.post('/',(req,res)=>{
    insertReport(req,res)
})

module.exports = router