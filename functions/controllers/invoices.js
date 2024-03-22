const InvoiceModel = require('../models/invoice.js')

const CustomerModel = require('../models/customer.js');
const ProductModel = require('../models/product.js');

class InvoiceController {
  static async createInvoice(req, res) {
    try {
      const { customer, items, payment_form, folio_number, series } = req.body;

      // Buscar la factura
      const customerQuery = {
        legal_name: customer.legal_name,
        email: customer.email,
        tax_id: customer.tax_id,
        tax_system: customer.tax_system,
        //address.zip: customer.address.zip
      };
      const foundCustomer = await CustomerModel.findCustomer(customerQuery);
      
      // Verificar existencia dla factura
      if (!foundCustomer) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }

      // Buscar los IDs de los productos
      const products = await Promise.all(items.map(async (item) => {
        const productQuery = {
          description: item.product.description,
          product_key: item.product.product_key,
          price: item.product.price
        };
        const foundProduct = await ProductModel.findProduct(productQuery);
        //console.log(foundProduct)
        return foundProduct;
      }));

      //console.log(products)
      // Verificar existencia de todos los productos
      if (products.some(product => product === null)) {
        return res.status(404).json({ error: 'Uno o más productos no encontrados' });
      }

      // Crear la factura
      const invoiceSnapshot = await InvoiceModel.addInvoice({
        customer: foundCustomer,
        items: items.map(item=>({quantity:item.quantity,products})) ,
        payment_form,
        folio_number,
        series
        
      });

      const InvoiceData = invoiceSnapshot.data()

      return res.status(201).json({ message: 'Factura creada exitosamente', invoice: {InvoiceData} });
    } catch (error) {
      console.error("Error al crear factura:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  static async getAllInvoices(req, res) {
    try {
      const invoices = await InvoiceModel.getAllInvoices();
      return res.status(200).json({ invoices });
    } catch (error) {
      console.error("Error al obtener las facturas:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  static async getInvoiceById(req, res) {
    try {
      const invoiceId = req.params.id;
      const invoice = await InvoiceModel.getInvoiceById(invoiceId);
      if (!invoice) {
        return res.status(404).json({ error: 'Factura no encontrada' });
      }
      return res.status(200).json({ invoice });
    } catch (error) {
      console.error("Error al obtener la factura por ID:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  static async updateInvoice(req, res) {
    try {
      // Validar si el ID de la factura está presente
      const invoiceId = req.params.id;
      if (!invoiceId) {
        return res.status(400).json({ error: 'ID de la factura no proporcionado' });
      }

      // Verificar si la factura existe
      const existingInvoice = await InvoiceModel.getInvoiceById(invoiceId);
      if (!existingInvoice) {
        return res.status(404).json({ error: 'Factura no encontrada' });
      }

      // Extraer los datos de la solicitud
      const { customer, items, payment_form, folio_number, series } = req.body;

      // Verificar si se proporcionó un cliente y buscarlo
      let foundCustomer = null;
      if (customer) {
        const customerQuery = {
          legal_name: customer.legal_name,
          email: customer.email,
          tax_id: customer.tax_id,
          tax_system: customer.tax_system
        };
        foundCustomer = await CustomerModel.findCustomer(customerQuery);
        if (!foundCustomer) {
          return res.status(404).json({ error: 'Cliente no encontrado' });
        }
      }

      // Verificar si se proporcionaron productos y buscar sus IDs
      let productIds = [];
      if (items && items.length > 0) {
        productIds = await Promise.all(items.map(async (item) => {
          const productQuery = {
            description: item.product.description,
            product_key: item.product.product_key,
            price: item.product.price
          };
          const foundProduct = await ProductModel.findProduct(productQuery);
          return foundProduct ? foundProduct._id : null;
        }));
        // Verificar si se encontraron todos los productos
        if (productIds.some(id => id === null)) {
          return res.status(404).json({ error: 'Uno o más productos no encontrados' });
        }
      }

      // Actualizar la factura en la base de datos
      const updatedInvoiceData = {
        customer: foundCustomer || existingInvoice.customer, // Usar el cliente encontrado o el existente
        items: items || existingInvoice.items, // Usar los productos proporcionados o los existentes
        payment_form: payment_form || existingInvoice.payment_form,
        folio_number: folio_number || existingInvoice.folio_number,
        series: series || existingInvoice.series
      };

      await InvoiceModel.updateInvoice(invoiceId, updatedInvoiceData);

      // Obtener los datos actualizados de la factura
      const updatedInvoice = await InvoiceModel.getInvoiceById(invoiceId);

      return res.status(200).json({ updatedInvoice });
    } catch (error) {
      console.error("Error al actualizar factura:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  static async deleteInvoice(req, res) {
    try {
      // Validar si el ID de la factura está presente
      const invoiceId = req.params.id;
      

      // Validar si la factura existe
      const existingInvoice = await InvoiceModel.getInvoiceById(invoiceId);
      if (!existingInvoice) {
        return res.status(404).json({ error: 'Factura no encontrada' });
      }

      // Borrar la factura de la base de datos
      await InvoiceModel.deleteInvoice(invoiceId);

      // Si se llega a este punto, la factura ha sido eliminada con éxito
      return res.status(200).json({ message: 'Factura eliminada correctamente' });
    } catch (error) {
      console.error("Error al eliminar la factura:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }
}

module.exports = InvoiceController;
