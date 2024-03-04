const functions = require('firebase-functions')
const admin = require('firebase-admin') //para poder utilizar la BD
const express = require('express')
const { error } = require('firebase-functions/logger')

const app = express()

//configurar admin
admin.initializeApp({
  credential: admin.credential.cert('./permisos.json'),//direccion en donde está un archivo que permite autenticar el codigo con firebase
  databaseURL: "https://facturacopiapi-default-rtdb.firebaseio.com" //la direccion donde está la BD, debe ser realtimeDatabase para que proporcione una URL
})

const db = admin.firestore()

app.get('/', (req, res) => {
  return res.status(200).json({ message: "hellooo" })
  
})

app.post('/clientes', async (req, res) => {
  try {
    // Realizar la solicitud fetch a la api y espera a que se resuelva antes de continuar
    const addressResponse = await fetch('https://cod-pos-mex-api.vercel.app/api/' + req.body.address.zip);
    if (!addressResponse.ok) {
      return res.status(400).json({ error: 'El código postal proporcionado es inválido' });
    }

    const addressData = await addressResponse.json();
    
    
    const clienteRef = await db.collection('clientes').add({
      legal_name: req.body.legal_name,
      tax_id: req.body.tax_id,
      tax_system: req.body.tax_system,
      email: req.body.email ?? '',
      /*address: {
        zip: req.body.address.zip
      }*/
      address: addressData
    });

    const clienteSnapshot = await clienteRef.get();
    const clienteData = clienteSnapshot.data();

    return res.status(201).json({ clienteData });
  } catch (error) {
    console.error("Error al crear cliente:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
})


exports.app = functions.https.onRequest(app)