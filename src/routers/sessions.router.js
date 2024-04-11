import { Router } from "express";
import passport from 'passport';
import Cart from '../dao/GeneralModels/cart.model.js'
import { 
  createUserController, 
  failCreateUserController, 
  loginUserController, 
  errorLoginUserController, 
  failLoginUserController,
  githubLoginUserController,
  githubCallbackLoginUserController,
  readInfoUserController 
} from "../controllers/session.controller.js";

const router = Router();

router.post('/register', createUserController); // crea un usuario

router.get('/failRegister', failCreateUserController) // devuelve un error al registrar un usuario

router.post('/login', passport.authenticate('login', { failureRedirect: '/api/sessions/failLogin'}), loginUserController, errorLoginUserController); // inicia sesión

router.get('/failLogin', failLoginUserController) // devuelve un error al iniciar sesión

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }), githubLoginUserController) // inicia sesión con GitHub

router.get('/githubcallback', passport.authenticate('github', { failureRedirect: '/login' }), githubCallbackLoginUserController) // callback de GitHub para iniciar sesión

router.get('/current', readInfoUserController); // devuelve los detalles del usuario actual

export default router;