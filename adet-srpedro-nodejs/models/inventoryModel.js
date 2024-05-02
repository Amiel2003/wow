const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InventorySchema = new Schema({
    branch_id: {type: String, ref: 'Branch'},
    products: [
        {
            product: {type: String, ref: 'Product'},
            stock: {type: Number, default: 0},
            last_restock: Date,
            status: String
        }
    ],
    archived: {
        type: Boolean,
        default: false
      }
});

const Inventory = mongoose.model('Inventory', InventorySchema, 'Inventories');

module.exports = Inventory;
