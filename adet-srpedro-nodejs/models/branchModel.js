const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BranchSchema = new Schema({
 _id: String,
 supervisor: {type:String, ref:'Employee'},
 barangay: String,
 municipality: String,
 province: String,
 opening_date: Date,
 branch_name: String,
 employees: [{type:String, ref:'Employee'}],
 date_added: {
    type: Date,
    default: Date.now // Set the default value to the current date
  },
  archived: {
    type: Boolean,
    default: false
  }
});

const Branch = mongoose.model('Branch', BranchSchema, 'Branches');

module.exports = Branch;
