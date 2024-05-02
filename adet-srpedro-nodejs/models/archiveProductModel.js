const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ArchiveProductSchema = new Schema({
    _id: String,
    product_name: String,
    price: Number,
    product_description: String,
    category: String,
    date_added: Date,
});

const ArchiveProduct = mongoose.model('ArchivedProduct', ArchiveProductSchema, 'ArchivedProducts');

module.exports = ArchiveProduct;