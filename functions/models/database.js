const admin = require('firebase-admin') //para poder utilizar la BD

//configurar admin
admin.initializeApp({
  credential: admin.credential.cert('./permisos.json'),//direccion en donde está un archivo que permite autenticar el codigo con firebase
  databaseURL: "https://facturacopiapi-default-rtdb.firebaseio.com" //la direccion donde está la BD, debe ser realtimeDatabase para que proporcione una URL
})

const db = admin.firestore();

module.exports = db;