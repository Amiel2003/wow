const multer = require('multer');

// Configure Multer storage
const storage = multer.memoryStorage(); // You might want to configure this based on your needs
const upload = multer({ storage: storage });

module.exports = upload;
