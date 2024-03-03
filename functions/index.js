const functions = require('firebase-functions')
const admin = require('firebase-admin') //para poder utilizar la BD
const express = require('express')

const app = express()

//configurar admin
admin.initializeApp({
  credential: admin.credential.cert('./permisos.json'),//direccion en donde está un archivo que permite autenticar el codigo con firebase
  databaseURL:"https://facturacopiapi-default-rtdb.firebaseio.com" //la direccion donde está la BD, debe ser realtimeDatabase para que proporcione una URL
})

const db = admin.firestore()

app.get('/', (req, res) => {
  return res.status(200).json({ message: "hellooo" })
})

app.post('/clientes', async (req, res) => {
  try {
    await db.collection('clientes').doc().create({
      legal_name: req.body.legal_name,
      tax_id: req.body.tax_id,
      tax_system: req.body.tax_system,
      email: req.body.email,
      address: {
        zip: req.body.address.zip
      }
    })
    return res.status(201).json();
  } catch (error) {
    console.error("Error al crear cliente:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
})


exports.app = functions.https.onRequest(app)