require('dotenv').config()
const { sendEmployeeCredentials } = require('../functions/email')
const { MongoClient, ServerApiVersion } = require('mongodb');
const Employee = require('../models/employeeModel')
const Branch = require('../models/branchModel')
const Product = require('../models/productsModel')
const Inventory = require('../models/inventoryModel')
const Purchase = require('../models/purchaseModel')
const Sale = require('../models/saleModel')
const ArchiveEmployee = require('../models/archiveEmployeeModel')
const ArchiveBranch = require('../models/archiveBranchModel')
const mongoose = require('mongoose');
const uri = process.env.DB_CONNECT;
const bcrypt = require('bcrypt');
const ArchiveInventory = require('../models/archiveInventoryModel');

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function connectToDatabase() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

async function closeDatabaseConnection() {
  try {
    await client.close();
    console.log("Closed MongoDB connection.");
  } catch (error) {
    console.error("Error closing MongoDB connection:", error);
  }
}

async function retrieveDataFromCollection(field, argument, model) {
  try {
    // Define the filter object based on the field and argument
    const filter = {};
    filter[field] = argument;

    // Query the Mongoose model to retrieve data
    const data = await model.find(filter);

    return data;
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
  }
}

async function insertRefreshToken(refreshToken, username_filter) {
  try {
    const database = client.db(process.env.DB_NAME);
    const collection = database.collection("Employees");

    const result = await collection.updateOne(
      { username: username_filter },
      {
        $push: {
          refresh_tokens: refreshToken
        }
      }
    )
    if (result.modifiedCount === 1) {
      console.log(`Refresh token inserted for user: ${username_filter}`);
    } else {
      console.log(`User with username ${username_filter} not found`);
    }
  } catch (error) {
    console.error('Error inserting to MongoDB:', error);
  }
}

async function retrieveRefreshTokens(username) {
  try {
    // Call retrieveDataFromCollection to retrieve the document for the specified username
    const userDocument = await retrieveDataFromCollection("username", username, Employee);

    // Check if the user document was found
    if (userDocument.length === 1) {
      const refreshTokens = userDocument[0].refresh_tokens;
      return refreshTokens;
    } else {
      console.log(`User with username ${username} not found`);
      return []; // Return an empty array if the user is not found
    }
  } catch (error) {
    console.error('Error retrieving refresh tokens:', error);
    return []; // Return an empty array in case of an error
  }
}

async function updateRefreshTokens(username, updatedTokens) {
  try {
    await client.connect();
    const database = client.db(process.env.DB_NAME); // Assuming you have a MongoDB client set up
    const collection = database.collection("Employees"); // Assuming "Users" is your collection name

    // Update the document with the specified username to set the new array of tokens
    await collection.updateOne(
      { username: username },
      { $set: { refresh_tokens: updatedTokens } }
    );
  } catch (error) {
    console.error('Error updating tokens in the database:', error);
    // Handle the error appropriately
  }
}

async function deleteRefreshToken(username, token) {
  try {

    const database = client.db(process.env.DB_NAME); // Replace with your database name
    const collection = database.collection('Employees'); // Replace with your collection name

    // Update the user's document to remove the specified token from the refresh_tokens array
    const result = await collection.updateOne(
      { username: username },
      { $pull: { refresh_tokens: token } }
    );

    if (result.modifiedCount === 1) {
      console.log(`Refresh token deleted for user: ${username}`);
    } else {
      console.log(`User with username ${username} not found or token not present`);
    }
  } catch (error) {
    console.error('Error deleting refresh token:', error);
    // Handle the error appropriately
  }
}

async function addEmployee(password, data) {
  try {
    const database = client.db(process.env.DB_NAME);
    const collection = database.collection("Employees");

    const existingEmployee = await collection.findOne({ _id: data._id });
    const existingEmail = await collection.findOne({ email_address: data.email_address })

    if (existingEmail) {
      return { status: 400, message: "Email already already exist" }
    }
    if (existingEmployee) {
      return { status: 400, message: "Employee ID already exist" }
    } else {
      if (data.position === 'supervisor' || data.position === 'cashier') {
        const existingUsername = await collection.findOne({ username: data.username })

        if (existingUsername) {
          return { status: 400, message: "Username already in use" }
        } else {
          const result = saveEmployee(data)
          return result;
        }

      } else {
        const result = saveEmployee(password, data)
        return result;
      }
    }
  } catch (error) {
    console.error('Error adding employee:', error);
    return { status: 500, message: "Error adding employee" }
  }
}

async function saveEmployee(password, data) {

  try {
    const newEmployee = new Employee(data)
    const result = await newEmployee.save()
    if (result) {
      sendEmployeeCredentials(password, data)
      if(data.user_role === 'supervisor'){
          BranchEmployeeInsertion(data)
      }
      return { status: 200, message: "Employee added succesfully" }
    }
  } catch (error) {
    console.error('Error adding employee to database:', error);
    return { status: 500, message: "Error adding employee" }
  }
}

async function BranchEmployeeInsertion(data){
    try {
      const update = await Branch.findOneAndUpdate(
        {supervisor: data.user_id},
        {$push:{employees: data._id}},
        {new: true}
      )
    } catch (error) {
      console.error('Error adding employee to branch:', error);
      return { status: 500, message: "Error adding employee" }
    }
}

async function retrieveCollection(prop) {
  try {
    const database = client.db(process.env.DB_NAME);
    const collection = database.collection(prop);

    const documents = await collection.find({}).toArray();
    return documents

  } catch (error) {
    console.error('Error retrieving collection:', error);
    return { status: 500, message: "Error retrieving collection" }
  }
}

async function getCollectionWithForeign(Model, param) {
  try {
    return new Promise((resolve, reject) => {
      // Populates foreign keys
      Model.find().populate(param)
        .then((data) => {
          resolve(data);
        })
        .catch((error) => {
          console.error('Error retrieving populated data:', error);
          reject(error);
        });
    });
  } catch (error) {
    console.error('Error retrieving collection:', error);
    return { status: 500, message: "Error retrieving collection" }
  }
}

async function getValueWithForeign(Model, param, filter) {
  try {
    return new Promise((resolve, reject) => {
      // Populates foreign keys
      Model.find(filter).populate(param)
        .then((data) => {
          resolve(data);
        })
        .catch((error) => {
          console.error('Error retrieving populated data:', error);
          reject(error);
        });
    });
  } catch (error) {
    console.error('Error retrieving collection:', error);
    return { status: 500, message: "Error retrieving collection" }
  }
}

async function addBranch(data) {
  try {
    const database = client.db(process.env.DB_NAME);
    const collection = database.collection("Branches");

    const existingBranch = await collection.findOne({ _id: data._id });
    const occupiedSupervisor = await checkSupervisorIdInBranches(data.supervisor)

    if (existingBranch) {
      return { status: 400, message: "Branch ID already exist" }
    } else {
      if (occupiedSupervisor) {
        return { status: 400, message: "Supervisor assigned to a branch" }
      } else {
        const productsArray = await retrieveCollection('Products')
        const inventory = await saveInventory(productsArray, data._id)
        if (inventory) {
          const newBranch = new Branch(data)
          const result = await newBranch.save()
          if (result) {
            return { status: 200, message: "Branch added succesfully" }
          }
        }
      }

    }
  } catch (error) {
    console.error('Error adding branch:', error);
    return { status: 500, message: "Error adding branch" }
  }
}

async function saveInventory(products, branchID) {

  const inventoryProducts = products.map((product) => ({
    product: product._id,
    stock: 0,
    last_restock: null,
    status: 'Out of stock',
  }));

  const inventory_info = {
    branch_id: branchID,
    products: inventoryProducts
  }
  console.log('uSHERR', branchID)

  const newInventory = new Inventory(inventory_info)
  const result = await newInventory.save()
  if (result) {
    return true
  } else {
    return null
  }
}

async function checkSupervisorIdInBranches(id) {
  try {
    const database = client.db(process.env.DB_NAME);
    const collection = database.collection("Branches");

    const query = { supervisor: id };
    const branchesWithEmployee = await collection.find(query).toArray();

    if (branchesWithEmployee.length > 0) {
      console.log('Supervisor ID already exists in a branch')
      return true;
    } else {
      console.log('Supervisor ID is not found in any branch')
      return false;
    }
  } catch (error) {
    console.error('Error checking employee ID in branches:', error);
    return { status: 500, message: "Error checking employee ID in branches" };
  }
}

async function addProduct(data) {
  try {
    const database = client.db(process.env.DB_NAME);
    const collection = database.collection("Products");

    const existingProduct = await collection.findOne({ _id: data._id });

    if (existingProduct) {
      return { status: 400, message: "Product ID already exist" }
    } else {
      const pushProduct = pushToProductsInInventory(data._id)
      if (pushProduct) {
        const newProduct = new Product(data)
        const result = await newProduct.save()
        if (result) {
          return { status: 200, message: "Product added succesfully" }
        }
      } else {
        return { status: 500, message: "Error pushing product to inventories" }
      }
    }
  } catch (error) {
    console.error('Error adding product:', error);
    return { status: 500, message: "Error adding product" }
  }
}

async function pushToProductsInInventory(id) {
  try {
    const newProduct = {
      product: id,
      stock: 0,
      last_restock: null,
      status: 'Out of stock'
    }
    // Update all documents in the Inventory collection
    const result = await Inventory.updateMany(
      {},
      { $push: { products: newProduct } }
    );

    if (result) {
      console.log('Products added to all documents in Inventory collection.');
      return true;
    } else {
      console.log('No documents updated.');
      return false;
    }
  } catch (error) {
    console.error('Error updating documents:', error);
  }
}

async function updateData(id, value, attribute, model) {
  try {
    const filter = { _id: id };
    const update = { [attribute]: value };

    const doc = await model.findOneAndUpdate(filter, update).exec();

    if (doc) {
      return true;
    } else {
      console.log('Document not found.');
      return false;
    }
  } catch (error) {
    console.error('Error updating employee in nodejs server', error);
    return false;
  }
}

async function updatePositionCredentials(id, userName, passWord) {
  try {
    const filter = { _id: id };
    const username = userName
    const password = passWord
    const hashedPassword = await bcrypt.hash(password, 10);

    const doc = await Employee.findOneAndUpdate(filter,
      {
        $set: {
          username: username,
          password: hashedPassword
        }
      }).exec();

    if (doc) {
      console.log('Updated document:', doc);
      return true;
    } else {
      console.log('Document not found.');
      return false;
    }

  } catch (error) {
    console.error('Error updating employee credentials in nodejs server', error);
    return false;
  }
}

async function removeCredentials(id) {
  try {
    const filter = { _id: id };


    const doc = await Employee.findOneAndUpdate(filter,
      {
        $unset: {
          username: 1,
          password: 1
        }
      }).exec();

    if (doc) {
      console.log('Deleted credentials for doc:', doc);
      return true;
    } else {
      console.log('Document not found.');
      return false;
    }

  } catch (error) {
    console.error('Error removing employee credentials in nodejs server', error);
    return false;
  }
}

async function removeSupervisorFromBranch(id) {
  try {
    const filter = { supervisor: id };
    const update = { supervisor: "" };

    const doc = await Branch.findOneAndUpdate(filter, update).exec();

    if (doc) {
      console.log('Supervisor is present in a branch and is removed')
    } else {
      console.log('Supervisor is not found in any branch');
    }
  } catch (error) {
    console.error('Error removing supervisor from branch: ', error)
  }

}

async function updateEmployeeArray(id, branch) {
  try {
    //checks if employee already exist in the branch
    const doesEmployeeExistInBranch = await Branch.findOne({ employees: { $in: [id] } })

    if (doesEmployeeExistInBranch) {
      return false;
    } else {
      const updatedBranch = await Branch.findOneAndUpdate(
        { _id: branch },
        { $push: { employees: id } },
        { new: true }
      )

      if (updatedBranch) {
        return true;
      } else {
        return false;
      }
    }

  } catch (error) {
    console.error('Error updating employee array of branch: ', error)
  }
}

async function updateSupply(data) {
  try {
    const stock = data.old_stock - data.quantity;
    const updatedStock = await Inventory.findOneAndUpdate(
      {
        branch_id: data.branch_id,
        'products.product': data.supply, // Specify the productID to identify the array element
      },
      {
        $set: {
          'products.$.status': (stock <= 20) ? 'Low stock' : (stock > 20) ? 'In stock' : 'Out of stock',
        },
        $inc: {
          'products.$.stock': -data.quantity,
        },
      },
      { new: true } // Set to true to return the modified document
    );
    
    console.log('updateStock', updatedStock);
    console.log('data:', data);
    return { status: 200, message: "Supply updated" }
  } catch (error) {
    console.error('Error updating supply: ', error);
  }
}

async function addPurchase(data) {
  try {
    const newPurchase = new Purchase(data)
    const result = await newPurchase.save()
    if (result) {
      updateStocks(data)
      return { status: 200, message: "Purchase added succesfully" }
    }

  } catch (error) {
    console.error('Error inserting purchase: ', error)
    return { status: 500, message: "Error adding purchase" }
  }
}

async function updateStocks(data) {
  try {
    const stock = data.old_stock + data.quantity;
    const updatedStock = await Inventory.findOneAndUpdate(
      {
        branch_id: data.branch_id,
        'products.product': data.product, // Specify the productID to identify the array element
      },
      {
        $set: {
          'products.$.last_restock': new Date(),
          'products.$.status': (stock <= 20) ? 'Low stock' : (stock > 20) ? 'In stock' : 'Out of stock',
        },
        $inc: {
          'products.$.stock': data.quantity,
        },
      },
      { new: true } // Set to true to return the modified document
    );
    
    console.log('updateStock', updatedStock);
    console.log('data:', data);

  } catch (error) {
    console.error('Error updating stocks: ', error);
  }
}

async function insertSaleToDatabase(data){
  try {
    const {in_charge} = data

    const user = await Employee.find({_id: in_charge})

    switch(user[0].role){
      case 'admin':
        break;
      case 'supervisor':
        const supervisorBranch = await Branch.find({supervisor: in_charge})
        setBranchToSale(data,supervisorBranch[0]._id)
        break;
      case 'cashier':
        const cashierBranch = await Branch.find({ employees: in_charge });
        setBranchToSale(data,cashierBranch[0]._id)
        break;
      default:
        null
    }

  } catch (error) {
    console.error('Error inserting sale: ',error)
  }
}

async function setBranchToSale(data,branchID){
  try {

    let initalSaleFormat = [];
    data.products.forEach((product,index)=>{
      initalSaleFormat.push({
        product:product._id, 
        quantity:product.quantity,
        total_amount: product.quantity * product.price})
    })

    const sale = {
      selling_id: data.selling_id,
      in_charge: data.in_charge,
      products: initalSaleFormat,
      total_quantity: data.total_quantity,
      total_amount: data. total_amount,
      branch: branchID
    }

    const newSale = new Sale(sale)
    const result = await newSale.save()
    if (result) {
      subtractInventoryStock(sale)
      return { status: 200, message: "Sale added succesfully" }
    }
    
  } catch (error) {
    console.error('Error setting branch to sale: ',error)
    return { status: 500, message: "Error adding sale" }
  }
}

async function subtractInventoryStock(sale){
  try {
    sale.products.forEach(async(product,index) => {

      let stock = 0;
      //check stock of that product
      try {
        const inventory = await Inventory.findOne(
          { branch_id: sale.branch, 'products.product': product.product }, // Match the branch and the product
          { 'products.$': 1 } // Projection to retrieve only the stock of the matched product
        );
  
        stock = inventory.products[0].stock;
      } catch (error) {
        console.error('Error getting quantity:',error)
      }     


      // update quantity and status of the inventory stock
      const updatedStock = await Inventory.findOneAndUpdate(
        {
          branch_id: sale.branch,
          'products.product': product.product, // Specify the productID to identify the array element
        },
        {
          $set: {
            'products.$.status': ((stock - product.quantity) < 20 && (stock - product.quantity) !== 0) ? 'Low stock' 
                               : ((stock - product.quantity)  > 20) ? 'In stock' 
                               : ((stock - product.quantity)  === 0) ? 'Out of stock' : null
          },
          $inc: {
            'products.$.stock': -product.quantity,
          },
        },
        { new: true } // Set to true to return the modified document
      );
    })

  } catch (error) {
    console.error('Error subtracting stock in nventory: ',error)
    return { status: 500, message: "Error subtracting stock in inventory" }
  }
}

async function handleArchive(id, Model, attribute, Archive){
  try {
    // Find the employee in the Employee collection
    const data = await Model.findById(id);

    if (!data) {
      console.error('Value not found for archiving');
      return { status: 404, message: 'Value not found for archiving' };
    }

    // Create a new ArchiveEmployee document using the found employee data
    const archiveEmployee = new Archive(data.toObject());

    // Save the ArchiveEmployee document to the ArchiveEmployee collection
    const result = await archiveEmployee.save();

    const updateArchive = await Model.findOneAndUpdate(
      {_id: id},
      { $set: { archived: true } }, // Set the 'archived' attribute to true
      { new: true })

    console.log('Archived successfully');
    return { status: 200, message: 'Archived successfully' };
    
  } catch (error) {
    console.error('Error archiving data: ',error)
    return { status: 500, message: "Error archiving data" }
  }
}

async function handleInventoryArchive(id, Model, attribute, Archive){
  try {
    // Find the employee in the Employee collection
    const data = await Model.findOne({branch_id: id});

    if (!data) {
      console.error('Value not found for archiving');
      return { status: 404, message: 'Value not found for archiving' };
    }

    // Create a new ArchiveEmployee document using the found employee data
    const archiveEmployee = new Archive(data.toObject());

    // Save the ArchiveEmployee document to the ArchiveEmployee collection
    const result = await archiveEmployee.save();

    const updateArchive = await Inventory.findOneAndUpdate(
      {branch_id: id},
      { $set: { archived: true } }, // Set the 'archived' attribute to true
      { new: true })

    console.log('Archived successfully');
    return { status: 200, message: 'Archived successfully' };
    
  } catch (error) {
    console.error('Error archiving data: ',error)
    return { status: 500, message: "Error archiving data" }
  }
}

async function retrieveArchived(prop,param){
  try {
    const database = client.db(process.env.DB_NAME);
    const collection = database.collection(prop);

    const documents = await collection.find({}).toArray();
    return documents

  } catch (error) {
    console.error('Error retrieving archived employees: ',error)
    return { status: 500, message: "Error retrieving archived employees" }
  }
}

async function unarchiveEmployeeInDatabase(id){
  try {
    const unarchive = await ArchiveEmployee.findOneAndDelete({_id: id})
    const update = await Employee.findOneAndUpdate(
      {_id: id},
      { $set: { archived: false } }, // Set the 'archived' attribute to false
      { new: true })
    return {status: 200, message: "Employee returned to active"}
  } catch (error) {
    console.error('Error unarchiving employee: ',error)
    return { status: 500, message: "Error unarchiving employee" }
  }
}

async function unarchiveBranchInDatabase(id){
  try {
    const unarchive = await ArchiveBranch.findOneAndDelete({_id: id})
    const update = await Branch.findOneAndUpdate(
      {_id: id},
      { $set: { archived: false } }, // Set the 'archived' attribute to false
      { new: true })
    return {status: 200, message: "Branch returned to active"}
  } catch (error) {
    console.error('Error unarchiving employee: ',error)
    return { status: 500, message: "Error unarchiving employee" }
  }
}

async function unarchiveInventoryInDatabase(id){
  try {
    const unarchive = await ArchiveInventory.findOneAndDelete({branch_id: id})
    const update = await Inventory.findOneAndUpdate(
      {branch_id: id},
      { $set: { archived: false } }, // Set the 'archived' attribute to false
      { new: true })
    return {status: 200, message: "Inventory returned to active"}
  } catch (error) {
    console.error('Inventory unarchiving employee: ',error)
    return { status: 500, message: "Branch unarchiving employee" }
  }
}

module.exports = {
  connectToDatabase,
  closeDatabaseConnection,
  retrieveDataFromCollection,
  insertRefreshToken,
  retrieveRefreshTokens,
  updateRefreshTokens,
  deleteRefreshToken,
  addEmployee,
  retrieveCollection,
  addBranch,
  getCollectionWithForeign,
  addProduct,
  getValueWithForeign,
  updateData,
  updatePositionCredentials,
  removeCredentials,
  removeSupervisorFromBranch,
  updateEmployeeArray,
  addPurchase,
  insertSaleToDatabase,
  handleArchive,
  retrieveArchived,
  unarchiveEmployeeInDatabase,
  unarchiveBranchInDatabase,
  handleInventoryArchive,
  unarchiveInventoryInDatabase,
  updateSupply
};
