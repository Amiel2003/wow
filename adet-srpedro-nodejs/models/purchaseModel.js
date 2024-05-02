const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PurchaseSchema = new Schema({
    branch_id: {type: String, ref: 'Branch'},
    total_amount: Number,
    product: {type: String, ref: 'Product'},
    quantity: Number,
    date_added: {
        type: Date,
        default: Date.now // Set the default value to the current date
    }
});

const Purchase = mongoose.model('Purchase', PurchaseSchema, 'Purchases');

module.exports = Purchase;
