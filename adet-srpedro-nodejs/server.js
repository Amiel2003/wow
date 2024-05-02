require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors')
const bodyParser = require('body-parser');
const loginRoute = require('./routes/loginRoute');
const gmailValidationRoute = require('./routes/gmailValidationRoute');
const employeesRoute = require('./routes/employeesRoute')
const verifyTokenRoute = require('./routes/verifyTokenRoute')
const refreshTokenRoute = require('./routes/refreshTokenRoute')
const logoutRoute = require('./routes/logoutRoute')
const branchesRoute = require('./routes/branchesRoute')
const productRoute = require('./routes/productRoute')
const inventoryRoute = require('./routes/inventoryRoute')
const purchaseRoute = require('./routes/purchasesRoute')
const saleRoute = require('./routes/salesRoute')
const {databaseConnection} = require('./database-connection')
const nodemailer = require('nodemailer')

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(
    cors({
      origin: 'http://localhost:3000', // Allow requests only from this origin
    })
  );

// ROUTES
app.use('/refresh',refreshTokenRoute)
app.use('/google',gmailValidationRoute)
app.use('/login', loginRoute);
app.use('/verify', verifyTokenRoute)
app.use('/logout',logoutRoute)
app.use('/employees',employeesRoute)
app.use('/branches',branchesRoute)
app.use('/products',productRoute)
app.use('/inventory',inventoryRoute)
app.use('/purchases',purchaseRoute)
app.use('/sales',saleRoute)

databaseConnection(app)



