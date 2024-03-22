const {Router} = require('express');
const CustomerController = require('../controllers/customers.js')
const customerRouter = Router()

customerRouter.post('/', CustomerController.createCustomer)
customerRouter.post('/:id', CustomerController.updateCustomer)
customerRouter.get('/', CustomerController.getAllCustomers)
customerRouter.get('/:id', CustomerController.getCustomerById)
customerRouter.delete('/:id', CustomerController.deleteCustomer)

module.exports = customerRouter