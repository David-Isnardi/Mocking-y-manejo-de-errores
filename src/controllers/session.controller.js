import passport from 'passport';
import Cart from '../dao/GeneralModels/cart.model.js'
import jwt from 'jsonwebtoken';
import express from 'express';

const app = express();
app.use(express.json());

export const createUserController = async (req, res, next) => {
    passport.authenticate('register', async (err, user, info) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to register' });
      } // Si hay un error, devuelve un error 500 (Internal Server Error)
      if (!user) {
        return res.status(400).json({ error: 'Failed to register' });
      } // Si el usuario ya existe, devuelve un error 400 (Bad Request)
      try {
        // Crear un nuevo carrito para el usuario
        const newCart = await Cart.create({ products: [] });

        // Asociar el ID del nuevo carrito al campo "cart" del usuario
        user.cart = newCart._id;
        await user.save();

        // Iniciar sesión después del registro
        req.login(user, (err) => {
            if (err) {
                return next(err);
            }
            return res.status(200).json({ message: 'Registration and login successful' });
        });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to registerr' });
    }
    })(req, res, next);
}

export const failCreateUserController = (req, res) => {
    res.send({ error: 'Failed to register' })
}

export const loginUserController = async (req, res) => {
    req.session.user = req.user;
    res.status(200).json({ message: 'Login successful' });
}
export const errorLoginUserController = (err) => {
    console.error("Error en la autenticación:", err);
    res.status(500).send({ error: 'Error de servidor' });
}

export const failLoginUserController = (req, res) => {
    res.send({ error: 'Failed to login' })
}

export const githubLoginUserController = async (req, res) => {

}

export const githubCallbackLoginUserController = async (req, res) => {
    console.log('Callback: ', req.user)
    req.session.user = req.user;
    console.log('User session: ', req.session.user)
    res.redirect('/');
}


// Middleware de autenticación JWT
export const authenticateJWT = (req, res, next) => {
    const token = req.headers.authorization;

    if (token) {
        jwt.verify(token, secretKey, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }

            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

// Middleware de autorización para roles específicos
export const authorize = (roles) => {
    return (req, res, next) => {
        if (roles.includes(req.user.role)) {
            next();
        } else {
            res.sendStatus(403);
        }
    };
};

// Función controladora para leer la información del usuario
export const readInfoUserController = (req, res) => {
    if (req.isAuthenticated()) {
        // Si el usuario está autenticado, crea un objeto UserDTO con los datos del usuario actual
        const userDTO = new UserDTO(
            req.user._id,
            req.user.first_name,
            req.user.last_name,
            req.user.email,
            req.user.age,
            req.user.role
        );
        console.log('User: ', userDTO);

        // Envía el objeto UserDTO como respuesta
        res.status(200).json(userDTO);
    } else {
        // Si el usuario no está autenticado, devuelve un error 401 (No autorizado)
        res.status(401).json({ error: 'No autorizado' });
    }
};

// Ruta protegida que requiere autenticación y autorización
app.get('/userinfo', authenticateJWT, authorize(['admin', 'user']), readInfoUserController);