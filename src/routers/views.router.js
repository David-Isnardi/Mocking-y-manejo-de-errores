import { Router } from "express"
import  productModel  from "../dao/GeneralModels/product.model.js";
import  cartModel  from "../dao/GeneralModels/cart.model.js";
import { isAuthenticated, isAdmin, hasAdminCredentials } from "../public/js/authMiddleware.js";
import { 
  readViewsProductsController, 
  readViewsRealTimeProductsController, 
  readViewsProductController,
  readViewsCartController 
} from "../controllers/views.controller.js";

const router = Router();

router.get('/', isAuthenticated, readViewsProductsController); // Devuelve todos los productos
  
router.get('/realtimeproducts', isAuthenticated, isAdmin, readViewsRealTimeProductsController); // Devuelve todos los productos en tiempo real

router.get('/:cid', isAuthenticated, readViewsProductController) // Devuelve un producto según su id

router.get('/carts/:cid', isAuthenticated, readViewsCartController) // Devuelve un carrito según su id
  
export default router;