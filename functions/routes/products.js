const {Router} = require('express');
const ProductController = require('../controllers/products.js')
const productRouter = Router()

productRouter.post('/', ProductController.createProduct)
productRouter.post('/:id', ProductController.updateProduct)
productRouter.get('/', ProductController.getAllProducts)
productRouter.get('/:id', ProductController.getProductById)
productRouter.delete('/:id', ProductController.deleteProduct)

module.exports = productRouter