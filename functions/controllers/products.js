
const ProductModel = require('../models/product.js')

class ProductController {

  static async createProduct(req, res) {
    try {
      // Validar y establecer el valor por defecto para tax_included
      let taxIncluded = true; // Por defecto, se incluye el impuesto
      if (req.body.tax_included !== undefined) {
        if (typeof req.body.tax_included !== 'boolean') {
          return res.status(400).json({ error: 'El valor de tax_included debe ser true o false' });
        }
        taxIncluded = req.body.tax_included;
      }

      // Validar y establecer el valor por defecto para taxes
      let taxes = [];
      if (req.body.taxes !== undefined) {
        if (!Array.isArray(req.body.taxes)) {
          return res.status(400).json({ error: 'El valor de taxes debe ser un arreglo' });
        }
        taxes = req.body.taxes.map(tax => {
          const allowedTypes = ['IVA', 'ISR', 'IEPS'];
          const allowedFactors = ['Tasa', 'Cuota', 'Exento'];
          const allowedIepsModes = ['sum_before_taxes', 'break_down', 'unit', 'subtract_before_break_down'];

          const defaultTax = {
            rate: 0.16, // Valor por defecto para rate
            type: 'IVA', // Valor por defecto para type
            factor: 'Tasa', // Valor por defecto para factor
            withholding: false // Valor por defecto para withholding
          };

          // Validar type
          if (tax.type !== undefined && !allowedTypes.includes(tax.type)) {
            return res.status(400).json({ error: 'El valor del atributo type solo puede ser IVA, ISR o IEPS' });
          }

          // Validar factor
          if (tax.factor !== undefined && !allowedFactors.includes(tax.factor)) {
            return res.status(400).json({ error: 'El valor del atributo factor solo puede ser Tasa, Cuota o Exento' });
          }

          // Validar ieps_mode si type es IEPS
          if (tax.type === 'IEPS' && tax.ieps_mode !== undefined && !allowedIepsModes.includes(tax.ieps_mode)) {
            return res.status(400).json({ error: 'El valor del atributo ieps_mode solo puede ser sum_before_taxes, break_down, unit o subtract_before_break_down' });
          }

          return { ...defaultTax, ...tax };
        });
      } else {
        // Si no se especifica taxes en el cuerpo de la solicitud, se agrega el valor por defecto
        const defaultTax = {
          rate: 0.16, // Valor por defecto para rate
          type: 'IVA', // Valor por defecto para type
          factor: 'Tasa', // Valor por defecto para factor
          withholding: false // Valor por defecto para withholding
        };
        taxes.push(defaultTax);
      }

      // Validar y establecer el valor por defecto para local_taxes
      let localTaxes = [];
      if (req.body.local_taxes !== undefined) {
        if (!Array.isArray(req.body.local_taxes)) {
          return res.status(400).json({ error: 'El valor de local_taxes debe ser un arreglo' });
        }
        localTaxes = req.body.local_taxes.map(tax => {
          const defaultLocalTax = {
            rate: 0, // Valor por defecto para rate
            type: '', // No hay valor por defecto para type
            withholding: false // Valor por defecto para withholding
          };
          return { ...defaultLocalTax, ...tax };
        });
      }

      // Mapeo de unit_key a unit_name
      const unitMap = {
        'A10': 'Gramos',
        'A11': 'Kilogramos',
        'A12': 'Toneladas',
        'B10': 'Mililitros',
        'B11': 'Litros',
        'B12': 'Galones',
        'C10': 'Metros',
        'C11': 'Centímetros',
        'C12': 'Kilómetros',
        'C13': 'Pulgadas',
        'H87': 'Pieza'
      };

      // Establecer por defecto los valores de unit_key y unit_name si están vacíos
      let unitKey = req.body.unit_key || 'H87'; // Por defecto: H87
      let unitName = req.body.unit_name || 'Pieza'; // Por defecto: Pieza

      // Validar unit_key y unit_name
      if (!(unitKey in unitMap) || !(Object.values(unitMap).includes(unitName))) {
        return res.status(400).json({ error: 'El valor de unit_key o unit_name no es válido' });
      }

      // Crear el nuevo producto en la base de datos
      const productoSnapshot = await ProductModel.addProduct({
        description: req.body.description,
        product_key: req.body.product_key,
        price: req.body.price,

        //Prueba: Crear un nuevo producto sin identificador de uso interno designado por la empresa
        sku: req.body.sku || '',

        tax_included: taxIncluded,
        //livemode: false,
        taxes: taxes,
        created_at: new Date(),
        local_taxes: localTaxes,
        unit_key: unitKey,
        unit_name: unitName,
      });

      const productoData = productoSnapshot.data(); // Obtener los datos insertados
      return res.status(201).json({ productoData });

    } catch (error) {
      console.error("Error al crear producto:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }



  static async getAllProducts(req, res) {
    try {
      const products = await ProductModel.getAllProducts();
      return res.status(200).json({ products });
    } catch (error) {
      console.error("Error al obtener productos:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  static async getProductById(req, res) {
    try {
      const productId = req.params.id;
      const product = await ProductModel.getProductById(productId);
      if (!product) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      return res.status(200).json({ product });
    } catch (error) {
      console.error("Error al obtener producto por ID:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  static async updateProduct(req, res) {
    try {
      // Validar si el ID del producto está presente
      const productId = req.params.id;
      if (!productId) {
        return res.status(400).json({ error: 'ID de producto no proporcionado' });
      }

      // Validar si el producto existe
      const existingProduct = await ProductModel.getProductById(productId);
      if (!existingProduct) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      // Realizar las mismas validaciones que en createProduct

      // Validar y establecer el valor por defecto para tax_included
      let taxIncluded = true; // Por defecto, se incluye el impuesto
      if (req.body.tax_included !== undefined) {
        if (typeof req.body.tax_included !== 'boolean') {
          return res.status(400).json({ error: 'El valor de tax_included debe ser true o false' });
        }
        taxIncluded = req.body.tax_included;
      }

      // Validar y establecer el valor por defecto para taxes
      let taxes = [];
      if (req.body.taxes !== undefined) {
        if (!Array.isArray(req.body.taxes)) {
          return res.status(400).json({ error: 'El valor de taxes debe ser un arreglo' });
        }
        taxes = req.body.taxes.map(tax => {
          const allowedTypes = ['IVA', 'ISR', 'IEPS'];
          const allowedFactors = ['Tasa', 'Cuota', 'Exento'];
          const allowedIepsModes = ['sum_before_taxes', 'break_down', 'unit', 'subtract_before_break_down'];

          const defaultTax = {
            rate: 0.16, // Valor por defecto para rate
            type: 'IVA', // Valor por defecto para type
            factor: 'Tasa', // Valor por defecto para factor
            withholding: false // Valor por defecto para withholding
          };

          // Validar type
          if (tax.type !== undefined && !allowedTypes.includes(tax.type)) {
            return res.status(400).json({ error: 'El valor del atributo type solo puede ser IVA, ISR o IEPS' });
          }

          // Validar factor
          if (tax.factor !== undefined && !allowedFactors.includes(tax.factor)) {
            return res.status(400).json({ error: 'El valor del atributo factor solo puede ser Tasa, Cuota o Exento' });
          }

          // Validar ieps_mode si type es IEPS
          if (tax.type === 'IEPS' && tax.ieps_mode !== undefined && !allowedIepsModes.includes(tax.ieps_mode)) {
            return res.status(400).json({ error: 'El valor del atributo ieps_mode solo puede ser sum_before_taxes, break_down, unit o subtract_before_break_down' });
          }

          return { ...defaultTax, ...tax };
        });
      } else {
        // Si no se especifica taxes en el cuerpo de la solicitud, se agrega el valor por defecto
        const defaultTax = {
          rate: 0.16, // Valor por defecto para rate
          type: 'IVA', // Valor por defecto para type
          factor: 'Tasa', // Valor por defecto para factor
          withholding: false // Valor por defecto para withholding
        };
        taxes.push(defaultTax);
      }

      // Validar y establecer el valor por defecto para local_taxes
      let localTaxes = [];
      if (req.body.local_taxes !== undefined) {
        if (!Array.isArray(req.body.local_taxes)) {
          return res.status(400).json({ error: 'El valor de local_taxes debe ser un arreglo' });
        }
        localTaxes = req.body.local_taxes.map(tax => {
          const defaultLocalTax = {
            rate: 0, // Valor por defecto para rate
            type: '', // No hay valor por defecto para type
            withholding: false // Valor por defecto para withholding
          };
          return { ...defaultLocalTax, ...tax };
        });
      }

      // Mapeo de unit_key a unit_name
      const unitMap = {
        'A10': 'Gramos',
        'A11': 'Kilogramos',
        'A12': 'Toneladas',
        'B10': 'Mililitros',
        'B11': 'Litros',
        'B12': 'Galones',
        'C10': 'Metros',
        'C11': 'Centímetros',
        'C12': 'Kilómetros',
        'C13': 'Pulgadas',
        'H87': 'Pieza'
      };

      // Establecer por defecto los valores de unit_key y unit_name si están vacíos
      let unitKey = req.body.unit_key || 'H87'; // Por defecto: H87
      let unitName = req.body.unit_name || 'Pieza'; // Por defecto: Pieza

      // Validar unit_key y unit_name
      if (!(unitKey in unitMap) || !(Object.values(unitMap).includes(unitName))) {
        return res.status(400).json({ error: 'El valor de unit_key o unit_name no es válido' });
      }

      // Actualizar el producto en la base de datos
      const updatedProductData = {
        description: req.body.description,
        product_key: req.body.product_key,
        price: req.body.price,
        sku: req.body.sku || '',
        tax_included: taxIncluded,
        taxes: taxes,
        //livemode: false,
        created_at: new Date(),
        local_taxes: localTaxes,
        unit_key: unitKey,
        unit_name: unitName,
      };

      await ProductModel.updateProduct(productId, updatedProductData);

      // Obtener los datos actualizados del producto
      const updatedProduct = await ProductModel.getProductById(productId);

      return res.status(200).json({ updatedProduct });
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  static async deleteProduct(req, res) {
    try {
      // Validar si el ID del producto está presente
      const productId = req.params.id;
      if (!productId) {
        return res.status(400).json({ error: 'ID de producto no proporcionado' });
      }

      // Validar si el producto existe
      const existingProduct = await ProductModel.getProductById(productId);
      if (!existingProduct) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      // Borrar el producto de la base de datos
      await ProductModel.deleteProduct(productId);

      // Si se llega a este punto, el producto ha sido eliminado con éxito
      return res.status(200).json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }
}

module.exports = ProductController;