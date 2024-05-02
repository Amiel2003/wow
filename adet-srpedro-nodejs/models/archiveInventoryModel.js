const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ArchiveInventorySchema = new Schema({
    branch_id: String,
    products: [
        {
            product: String,
            stock: Number,
            last_restock: Date,
            status: String
        }
    ]
});

const ArchiveInventory = mongoose.model('ArchivedInventory', ArchiveInventorySchema, 'ArchivedInventories');

module.exports = ArchiveInventory;
