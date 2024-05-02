const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ArchiveBranchSchema = new Schema({
 _id: String,
 supervisor: {type:String, ref:'Employee'},
 barangay: String,
 municipality: String,
 province: String,
 opening_date: Date,
 branch_name: String,
 employees: [{type:String, ref:'Employee'}],
 date_added: Date
});

const ArchiveBranch = mongoose.model('ArchivedBranch', ArchiveBranchSchema, 'ArchivedBranches');

module.exports = ArchiveBranch;
