const db = require('../models/database.js');

class InvoiceModel {
  static async addInvoice(invoiceData) {
    try {
      const facturaRef = await db.collection('facturas').add(invoiceData);
      const facturaSnapshot = await facturaRef.get();
      return facturaSnapshot;
    } catch (error) {
      throw new Error("Error al agregar la factura a la base de datos: " + error);
    }
  }

  static async getAllInvoices() {
    try {
      const snapshot = await db.collection('facturas').get();
      const invoices = [];
      snapshot.forEach(doc => {
        invoices.push({ id: doc.id, ...doc.data() });
      });
      return invoices;
    } catch (error) {
      throw new Error("Error al obtener todas las facturas de la base de datos: " + error);
    }
  }

  static async getInvoiceById(invoiceId) {
    try {
      const doc = await db.collection('facturas').doc(invoiceId).get();
      if (!doc.exists) {
        return null; // Cliente no encontrado
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error("Error al obtener la factura por ID de la base de datos: " + error);
    }
  }

  static async updateInvoice(invoiceId, updatedData) {
    try {
      await db.collection('facturas').doc(invoiceId).update(updatedData);
      return updatedData;
    } catch (error) {
      throw new Error("Error al actualizar la factura en la base de datos: " + error);
    }
  }

  static async deleteInvoice(invoiceId) {
    try {
      await db.collection('facturas').doc(invoiceId).delete();
    } catch (error) {
      throw new Error("Error al eliminar la factura de la base de datos: " + error);
    }
  }
}

module.exports = InvoiceModel;
