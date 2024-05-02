const express = require('express');
const router = express.Router()
const bodyParser = require('body-parser'); //middleware to POST data
const {getBranchByIDAsSupervisor,getAllBranches,insertBranch,getBranchByID,updateBranchByID,updateBranchEmployee,deleteBranchEmployee,archiveBranch,getAllArchivedBranches,unarchiveBranch} = require('../controllers/branchesController')

router.use(bodyParser.urlencoded({ extended: true }));

router.get('/',(req,res)=>{
    getAllBranches(req,res)
})

router.post('/',(req,res)=>{
    insertBranch(req,res)
})

router.get('/:param/:param2/ioioo', async (req,res) => {
    const id = req.params.param
    const attribute = req.params.param2
    console.log(id,attribute)
    getBranchByID(req,res,id,attribute)
})

router.get('/:param/:param2', async (req,res) => {
    const id = req.params.param
    const attribute = req.params.param2
    console.log(id,attribute)
    getBranchByIDAsSupervisor(req,res,id,attribute)
})

router.post('/update',async (req,res) => {
    updateBranchByID(req,res)
})

router.post('/update/employee',async (req,res) => {
    updateBranchEmployee(req,res)
})

router.post('/delete',async (req,res) => {
    deleteBranchEmployee(req,res)
})

router.post('/archive', async (req,res) => {
    archiveBranch(req,res)
})

router.get('/retrive-archive', async (req,res) => {
    getAllArchivedBranches(req,res)
})

router.post('/unarchive', async (req,res) => {
    unarchiveBranch(req,res)
})

module.exports = router