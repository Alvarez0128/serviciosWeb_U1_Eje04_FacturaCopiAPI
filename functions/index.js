const functions = require('firebase-functions')

const express = require('express')
//const { error, log } = require('firebase-functions/logger')
const customerRouter = require('./routes/customers.js')
const productRouter = require('./routes/products.js')
const invoiceRouter = require('./routes/invoices.js')
const app = express()


app.get('/', (req, res) => {
  return res.status(200).json({ message: "API funcionando!" })
})

app.use('/clientes', customerRouter);
app.use('/productos', productRouter);
app.use('/facturas', invoiceRouter);



exports.app = functions.https.onRequest(app)