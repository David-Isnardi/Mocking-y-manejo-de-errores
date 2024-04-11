import productModel from '../dao/GeneralModels/product.model.js';
import cartModel from "../dao/GeneralModels/cart.model.js";

export const readViewsProductsController = async (req, res) => {
    try {
      //const products = await ProductModel.find().lean().exec();
      let pageNum = parseInt(req.query.page) || 1;
      let itemsPorPage = parseInt(req.query.limit) || 10;
      const products = await productModel.paginate({}, { page: pageNum , limit: itemsPorPage , lean:true });

      products.prevLink = products.hasPrevPage ? `/products?limit=${itemsPorPage}&page=${products.prevPage}` : '';
      products.nextLink = products.hasNextPage ? `/products?limit=${itemsPorPage}&page=${products.nextPage}` : '';
      
      // console.log(products);
      
      // Obtener los datos del usuario desde la sesión
      const userInfo = {
        first_name: req.session.user.first_name,
        last_name: req.session.user.last_name,
        email: req.session.user.email,
        age: req.session.user.age,
        role: req.session.user.role,
      };
      
      // Renderizar la vista de productos y pasar los datos del usuario
      res.render('home', { ...products, userInfo });
    } catch (error) {
      console.log('Error al leer los productos:', error);
      res.status(500).json({ error: 'Error al leer los productos' });
    }
}

export const readViewsRealTimeProductsController = async (req, res) => {
    try {
      const products = await ProductModel.find().lean().exec();
      res.render('realTimeProducts', { products });
    } catch (error) {
      console.log('Error al leer los productos en tiempo real:', error);
      res.status(500).json({ error: 'Error al leer los productos en tiempo real' });
    }
}

export const readViewsProductController = async (req, res) => {
    try {
      const id = req.params.cid
      const result = await ProductModel.findById(id).lean().exec();
      if (result === null) {
        return res.status(404).json({ status: 'error', error: 'Product not found' });
      }
      res.render('productDetail', result);
    } catch (error) {
      res.status(500).json({ error: 'Error al leer los productos' });
    }
}

export const readViewsCartController = async (req, res) => {
    // ID del carrito: 64a36d28ae5981f3f6e4488e
    try {
      const id = req.params.cid
      const result = await cartModel.findById(id).lean().exec();
      if (result === null) {
        return res.status(404).json({ status: 'error', error: 'Cart not found' });
      }
      res.render('carts', { cid: result._id, products: result.products });
    } catch (error) {
      res.status(500).json({ status: 'error', error: error.message });
    }
}

