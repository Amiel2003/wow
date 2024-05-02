const { connectToDatabase, closeDatabaseConnection } = require('./functions/database');
const mongoose = require('mongoose');

function databaseConnection(app){
    // Mongoose Connection
    mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    
    const db = mongoose.connection;
    
    db.on('error', (error) => {
        console.error('Error connecting to MongoDB:', error);
    });
    
    db.once('open', () => {
        console.log('Connected to MongoDB using Mongoose');
        app.listen(process.env.PORT,()=>{
                console.log('App is running on Port ',process.env.PORT)
            })
    });
    
    // Close the MongoDB connection when the application exits
    process.on('exit', () => {
        mongoose.connection.close(() => {
        console.log('Closed MongoDB connection.');
        });
    });
    
    process.on('SIGINT', () => {
        mongoose.connection.close(() => {
        console.log('Closed MongoDB connection.');
        process.exit();
        });
    });
    
    
    //DATABASE CONNECTION
    connectToDatabase()
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });
    
    // Handle process exit and SIGINT
    process.on('exit', () => {
        closeDatabaseConnection()
        .then(() => {
            console.log('Closed MongoDB connection.');
        })
        .catch((error) => {
            console.error('Error closing MongoDB connection:', error);
        });
    });
    
    process.on('SIGINT', () => {
        closeDatabaseConnection()
        .then(() => {
            console.log('Closed MongoDB connection.');
            process.exit();
        })
        .catch((error) => {
            console.error('Error closing MongoDB connection:', error);
            process.exit(1); // Exit with an error code
        });
    });//DATABASE CONNECTION (end)
    
    
}

module.exports = {databaseConnection}