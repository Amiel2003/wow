const { retrieveDataFromCollection } = require('../functions/database'); 
const CryptoJS = require('crypto-js')
const bcrypt = require('bcrypt');
const EmployeeModel = require('../models/employeeModel')

async function validateEmail(data){

        if(data.length==1){
            const role = data[0].role.toUpperCase()
            return role;
        }
        if(data.length==0){
            const role = "UNREGISTERED"
            return role;
        }
}

async function validateLoginInput(input){
    const secretKey = process.env.CRYPTOJS_SECRET_KEY;
    try{
        const username_input = input.username;
        const password_input = input.password;
        const decryptedUsername = CryptoJS.AES.decrypt(username_input, secretKey).toString(CryptoJS.enc.Utf8);
        const data = await retrieveDataFromCollection("username", decryptedUsername, EmployeeModel);

        if(data.length>0){
            const retrievedUser = data[0]
            const retrievedPassword = retrievedUser.password
            const decryptedPassword = CryptoJS.AES.decrypt(password_input, secretKey).toString(CryptoJS.enc.Utf8);
            console.log(decryptedPassword)
            
            const isCorrect = await new Promise((resolve, reject) => {
                bcrypt.compare(decryptedPassword, retrievedPassword, (err, result) => {
                  if (err) {
                    reject('Error comparing passwords');
                  } else {
                    resolve(result);
                  }
                });
              });
              
              console.log(isCorrect)

              if (isCorrect) {
                // Password is correct, return the retrievedUser
                return retrievedUser;
              } else {
                // Password is incorrect
                return 'Incorrect Password';
              }
            
        }else{
            //User not found
            return null;
        }
    }catch(error){
        console.error("Error validating input:", error);
        throw error;
    }
    
}

async function validateLoginInput2(input){
  const secretKey = process.env.CRYPTOJS_SECRET_KEY;
  try{
      const username_input = input.username;
      const password_input = input.password;
      // const decryptedUsername = CryptoJS.AES.decrypt(username_input, secretKey).toString(CryptoJS.enc.Utf8);
      const data = await retrieveDataFromCollection("username", username_input, EmployeeModel);

      if(data.length>0){
          const retrievedUser = data[0]
          const retrievedPassword = retrievedUser.password
          // const decryptedPassword = CryptoJS.AES.decrypt(password_input, secretKey).toString(CryptoJS.enc.Utf8);
          // console.log(decryptedPassword)
          
          const isCorrect = await new Promise((resolve, reject) => {
              bcrypt.compare(password_input, retrievedPassword, (err, result) => {
                if (err) {
                  reject('Error comparing passwords');
                } else {
                  resolve(result);
                }
              });
            });
            
            console.log(isCorrect)

            if (isCorrect) {
              // Password is correct, return the retrievedUser
              return retrievedUser;
            } else {
              // Password is incorrect
              return 'Incorrect Password';
            }
          
      }else{
          //User not found
          return null;
      }
  }catch(error){
      console.error("Error validating input:", error);
      throw error;
  }
  
} 

module.exports = {validateEmail,validateLoginInput,validateLoginInput2};
