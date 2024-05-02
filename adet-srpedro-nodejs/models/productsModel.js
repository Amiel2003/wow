const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductsSchema = new Schema({
    _id: String,
    product_name: String,
    price: Number,
    product_description: String,
    category: String,
    date_added: {
        type: Date,
        default: Date.now // Set the default value to the current date
    },
    archived: {
        type: Boolean,
        default: false
      }
});

const Product = mongoose.model('Product', ProductsSchema, 'Products');

module.exports = Product;
