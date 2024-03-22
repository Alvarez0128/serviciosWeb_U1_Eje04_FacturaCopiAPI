const db = require('../models/database.js');

class CustomerModel {
  static async addCustomer(customerData) {
    try {
      const clienteRef = await db.collection('clientes').add(customerData);
      const clienteSnapshot = await clienteRef.get();
      return clienteSnapshot;
    } catch (error) {
      throw new Error("Error al agregar cliente a la base de datos: " + error);
    }
  }

  static async getAllCustomers() {
    try {
      const snapshot = await db.collection('clientes').get();
      const customers = [];
      snapshot.forEach(doc => {
        customers.push({ id: doc.id, ...doc.data() });
      });
      return customers;
    } catch (error) {
      throw new Error("Error al obtener todos los clientes de la base de datos: " + error);
    }
  }

  static async getCustomerById(customerId) {
    try {
      const doc = await db.collection('clientes').doc(customerId).get();
      if (!doc.exists) {
        return null; // Cliente no encontrado
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error("Error al obtener cliente por ID de la base de datos: " + error);
    }
  }

  static async updateCustomer(customerId, updatedData) {
    try {
      await db.collection('clientes').doc(customerId).update(updatedData);
      return updatedData;
    } catch (error) {
      throw new Error("Error al actualizar cliente en la base de datos: " + error);
    }
  }

  static async deleteCustomer(customerId) {
    try {
      await db.collection('clientes').doc(customerId).delete();
    } catch (error) {
      throw new Error("Error al eliminar cliente de la base de datos: " + error);
    }
  }

  static async findCustomer(query) {
    try {
      //if (!query.address || !query.address.zip) {
        //return null; // Si no se proporciona la dirección o el código postal, no se puede buscar el cliente
      //}
  
      const snapshot = await db.collection('clientes').where('legal_name', '==', query.legal_name)
        .where('email', '==', query.email)
        .where('tax_id', '==', query.tax_id)
        .where('tax_system', '==', query.tax_system)
        //.where('address.zip', '==', query.address.zip)
        .get();
  
      if (snapshot.empty) {
        return null; // Cliente no encontrado
      }
  
      let foundCustomer;
      snapshot.forEach(doc => {
        foundCustomer = { id: doc.id, ...doc.data() };
      });
  
      return foundCustomer;
    } catch (error) {
      throw new Error("Error al buscar cliente en la base de datos: " + error);
    }
  }
  
}

module.exports = CustomerModel;
