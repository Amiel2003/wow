const express = require('express');
const router = express.Router()
const bodyParser = require('body-parser'); //middleware to POST data
const {getAllEmployees,insertEmployee,getEmployeeByID,updateEmployeeByID,updateFiles, archiveEmployee, getAllArchivedEmployees, unarchiveEmployee} = require('../controllers/employeesController')
const upload = require('../middlewares/multerConfig')

router.use(bodyParser.urlencoded({ extended: true }));

router.get('/', async (req, res) =>{
   getAllEmployees(req,res)
})

router.post('/', upload.any(),async (req,res) => {
    console.log(req.body)
    insertEmployee(req,res)
})

router.get('/:id', async (req,res) => {
    const id = req.params.id
    getEmployeeByID(req,res,id)
})

router.post('/update', async (req,res) => {
    updateEmployeeByID(req,res)
})

router.post('/update/files',upload.single('file'),async (req,res) => {
    updateFiles(req,res)
})

router.post('/archive', async (req,res) => {
    archiveEmployee(req,res)
})

router.get('/archive/all', async (req,res) => {
    getAllArchivedEmployees(req,res)
})

router.post('/unarchive', async (req,res) => {
    unarchiveEmployee(req,res)
})

module.exports = router;
