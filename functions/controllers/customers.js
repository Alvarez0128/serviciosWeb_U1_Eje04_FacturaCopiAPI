const validar = require('../utilities/utilities.js')
const CustomerModel = require('../models/customer.js')

class CustomerController {

  static async createCustomer(req, res) {
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
      const clienteSnapshot = await CustomerModel.addCustomer({
        legal_name: req.body.legal_name,
        tax_id: req.body.tax_id,
        tax_system: req.body.tax_system,

        //4. Prueba: Crear un nuevo cliente sin dirección de correo electrónico
        email: req.body.email ?? '',

        address: addressData,
        created_at: new Date()
      });

      const clienteData = clienteSnapshot.data(); // Obtener los datos insertados
      // Formatear la fecha en el formato deseado
      const formattedDate = new Date(clienteData.created_at._seconds * 1000).toISOString();

      // Modificar el objeto clienteData para incluir la fecha formateada
      clienteData.created_at = formattedDate;
      
      //1. Prueba: Crear un nuevo cliente con código postal válido y tax_system correspondiente
      return res.status(201).json({ clienteData });
    } catch (error) {
      console.error("Error al crear cliente:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  static async getAllCustomers(req, res) {
    try {
      const customers = await CustomerModel.getAllCustomers();
      return res.status(200).json({ customers });
    } catch (error) {
      console.error("Error al obtener clientes:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  static async getCustomerById(req, res) {
    try {
      const customerId = req.params.id;
      const customer = await CustomerModel.getCustomerById(customerId);
      if (!customer) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }
      return res.status(200).json({ customer });
    } catch (error) {
      console.error("Error al obtener cliente por ID:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  static async updateCustomer(req, res) {
    try {
      // Validar si el ID del cliente está presente
      const customerId = req.params.id;
      if (!customerId) {
        return res.status(400).json({ error: 'ID de cliente no proporcionado' });
      }

      // Validar si el cliente existe
      const existingCustomer = await CustomerModel.getCustomerById(customerId);
      if (!existingCustomer) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }

      // Realizar las mismas validaciones que en createCustomer

      // Validar nombre legal
      if (!req.body.legal_name) {
        return res.status(400).json({ error: 'El nombre legal del cliente es obligatorio' });
      }
      // Validar RFC
      if (!req.body.tax_id) {
        return res.status(400).json({ error: 'El RFC es obligatorio' });
      }
      // Validar régimen fiscal
      if (!req.body.tax_system) {
        return res.status(400).json({ error: 'El régimen fiscal es obligatorio' });
      }
      const rfcValido = validar.RFC(req.body.tax_id);
      if (rfcValido === "invalid") {
        return res.status(400).json({ error: 'El RFC proporcionado es inválido' });
      }

      // Realizar la solicitud fetch a la API de códigos postales y validar
      let addressData;
      try {
        const addressResponse = await fetch('https://cod-pos-mex-api.vercel.app/api/' + req.body.address.zip);
        if (!addressResponse.ok) {
          return res.status(400).json({ error: 'El código postal proporcionado es inválido' });
        }
        addressData = await addressResponse.json();
      } catch (error) {
        console.error("Error al obtener datos de dirección:", error);
        return res.status(500).json({ error: "Error interno del servidor" });
      }

      // Crear el nuevo cliente en la base de datos
      const updatedCustomerData = {
        legal_name: req.body.legal_name,
        tax_id: req.body.tax_id,
        tax_system: req.body.tax_system,
        email: req.body.email ?? '',
        address: addressData,
        created_at: new Date()
      };

      await CustomerModel.updateCustomer(customerId, updatedCustomerData);

      // Obtener los datos actualizados del cliente
      const updatedCustomer = await CustomerModel.getCustomerById(customerId);

      return res.status(200).json({ updatedCustomer });
    } catch (error) {
      console.error("Error al actualizar cliente:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  static async deleteCustomer(req, res) {
    try {
      // Validar si el ID del cliente está presente
      const customerId = req.params.id;

      // Validar si el cliente existe
      const existingCustomer = await CustomerModel.getCustomerById(customerId);
      if (!existingCustomer) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }

      // Borrar el cliente de la base de datos
      await CustomerModel.deleteCustomer(customerId);

      // Si se llega a este punto, el cliente ha sido eliminado con éxito
      return res.status(200).json({ message: 'Cliente eliminado correctamente' });
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }
}

module.exports = CustomerController;