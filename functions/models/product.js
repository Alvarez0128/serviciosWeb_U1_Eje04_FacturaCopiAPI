const db = require('../models/database.js');

class ProductModel {
  static async addProduct(productData) {
    try {
      const productoRef = await db.collection('productos').add(productData);
      const productoSnapshot = await productoRef.get();
      return productoSnapshot;
    } catch (error) {
      throw new Error("Error al agregar producto a la base de datos: " + error);
    }
  }

  static async getAllProducts() {
    try {
      const snapshot = await db.collection('productos').get();
      const products = [];
      snapshot.forEach(doc => {
        products.push({ id: doc.id, ...doc.data() });
      });
      return products;
    } catch (error) {
      throw new Error("Error al obtener todos los productos de la base de datos: " + error);
    }
  }

  static async getProductById(productId) {
    try {
      const doc = await db.collection('productos').doc(productId).get();
      if (!doc.exists) {
        return null; // Cliente no encontrado
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error("Error al obtener producto por ID de la base de datos: " + error);
    }
  }

  static async updateProduct(productId, updatedData) {
    try {
      await db.collection('productos').doc(productId).update(updatedData);
      return updatedData;
    } catch (error) {
      throw new Error("Error al actualizar producto en la base de datos: " + error);
    }
  }

  static async deleteProduct(productId) {
    try {
      await db.collection('productos').doc(productId).delete();
    } catch (error) {
      throw new Error("Error al eliminar producto de la base de datos: " + error);
    }
  }

  static async findProduct(query) {
    try {
      const snapshot = await db.collection('productos').where('description', '==', query.description)
        .where('product_key', '==', query.product_key)
        .where('price', '==', query.price)
        .get();

      if (snapshot.empty) {
        return null; // Producto no encontrado
      }

      let foundProduct;
      snapshot.forEach(doc => {
        foundProduct = { id: doc.id, ...doc.data() };
      });

      return foundProduct;
    } catch (error) {
      throw new Error("Error al buscar producto en la base de datos: " + error);
    }
  }
}

module.exports = ProductModel;
