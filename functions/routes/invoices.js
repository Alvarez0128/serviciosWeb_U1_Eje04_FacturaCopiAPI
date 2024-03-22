const {Router} = require('express');
const InvoiceController = require('../controllers/invoices.js')
const invoiceRouter = Router()

invoiceRouter.post('/', InvoiceController.createInvoice)
invoiceRouter.post('/:id', InvoiceController.updateInvoice)
invoiceRouter.get('/', InvoiceController.getAllInvoices)
invoiceRouter.get('/:id', InvoiceController.getInvoiceById)
invoiceRouter.delete('/:id', InvoiceController.deleteInvoice)

module.exports = invoiceRouter