const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ArchiveEmployeeSchema = new Schema({
  _id: String,
  username: String,
  password: String,
  role: String,
  email_address: String,
  first_name: String,
  middle_name: String,
  last_name: String,
  gender: String,
  birth_date: Date,
  citizenship: String,
  contact_number: Number,
  postal_code: Number,
  barangay: String,
  municipality: String,
  province: String,
  valid_id: String,
  birth_certificate: String,
  refresh_tokens: Array,
  date_added: Date
});

const ArchiveEmployee = mongoose.model('ArchivedEmployee', ArchiveEmployeeSchema, 'ArchivedEmployees');

module.exports = ArchiveEmployee;
