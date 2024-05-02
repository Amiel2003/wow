const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EmployeeSchema = new Schema({
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
  refresh_tokens: Array,
  date_added: {
    type: Date,
    default: Date.now // Set the default value to the current date
  },
  archived: {
    type: Boolean,
    default: false
  }
});

const Employee = mongoose.model('Employee', EmployeeSchema, 'Employees');

module.exports = Employee;
