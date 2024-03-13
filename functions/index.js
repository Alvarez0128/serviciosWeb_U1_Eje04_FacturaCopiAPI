const functions = require('firebase-functions')
const admin = require('firebase-admin') //para poder utilizar la BD
const express = require('express')
//const { error, log } = require('firebase-functions/logger')
const validar = require('./utilities/utilities')

const app = express()

//configurar admin
admin.initializeApp({
  credential: admin.credential.cert('./permisos.json'),//direccion en donde está un archivo que permite autenticar el codigo con firebase
  databaseURL: "https://facturacopiapi-default-rtdb.firebaseio.com" //la direccion donde está la BD, debe ser realtimeDatabase para que proporcione una URL
})

const db = admin.firestore()

app.get('/', (req, res) => {
  return res.status(200).json({ message: "funcionando!" })

})

app.post('/clientes', async (req, res) => {
  try {
    
    //5. Prueba: Crear un nuevo cliente sin nombre legal (legal_name)
    if (!req.body.legal_name) {
      return res.status(400).json({ error: 'El nombre legal del cliente es obligatorio' });
    }
    //6. Prueba: Crear un nuevo cliente sin RFC (tax_id)
    if (!req.body.tax_id) {
      return res.status(400).json({ error: 'El RFC es obligatorio' });
    }
    //7. Prueba: Crear un nuevo cliente sin sistema de impuestos (tax_system)
    if (!req.body.tax_id) {
      return res.status(400).json({ error: 'El regimen fiscal es obligatorio' });
    }

    //8. Prueba: Crear un nuevo cliente con formato de RFC incorrecto
    const rfcValido = validar.RFC(req.body.tax_id);
    if (rfcValido === "invalid") {
      return res.status(400).json({ error: 'El RFC proporcionado es inválido' });
    }

    // Realizar la solicitud fetch a la API de códigos postales
    let addressData; 
    try {
      const addressResponse = await fetch('https://cod-pos-mex-api.vercel.app/api/' + req.body.address.zip);

      //2. Prueba: Crear un nuevo cliente con código postal inválido
      if (!addressResponse.ok) {
        return res.status(400).json({ error: 'El código postal proporcionado es inválido' });
      }
      addressData = await addressResponse.json();//aqui se guarda el JSON del response de la API
    } catch (error) {
      console.error("Error al obtener datos de dirección:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }


    //3. Prueba: Crear un nuevo cliente con tax_system incorrecto
    if (validar.RegimenFiscal(rfcValido, req.body.tax_system) === "invalid") {
      return res.status(400).json({ error: 'El régimen fiscal no coincide con el tipo de persona del RFC' });
    }

    // Crear el nuevo cliente en la base de datos
    const clienteRef = await db.collection('clientes').add({
      legal_name: req.body.legal_name,
      tax_id: req.body.tax_id,
      tax_system: req.body.tax_system,

      //4. Prueba: Crear un nuevo cliente sin dirección de correo electrónico
      email: req.body.email ?? '',

      address: addressData,
      created_at: new Date()
    });

    const clienteSnapshot = await clienteRef.get();
    const clienteData = clienteSnapshot.data();

    //1. Prueba: Crear un nuevo cliente con código postal válido y tax_system correspondiente
    return res.status(201).json({ clienteData });
  } catch (error) {
    console.error("Error al crear cliente:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});



exports.app = functions.https.onRequest(app)