const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SaleSchema = new Schema({
    selling_id: String,
    in_charge: {type: String, ref: 'Employee'},
    products: [ {
        product: {type: String, ref: 'Product'},
        quantity: Number,
        total_amount: Number
    }],
    total_quantity: Number,
    total_amount: Number,
    branch: {type: String, ref: 'Branch'},
    date_added: {
        type: Date,
        default: Date.now // Set the default value to the current date
      } 
});

const Sale = mongoose.model('Sale', SaleSchema, 'Sales');

module.exports = Sale;

