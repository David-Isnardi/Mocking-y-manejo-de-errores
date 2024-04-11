import express from 'express'
import { Server } from 'socket.io'
import handlebars from 'express-handlebars'
import productsRouter from './routers/products.router.js'
import cartsRouter from './routers/carts.router.js'
import viewsRouter from './routers/views.router.js'
import chatRouter from './routers/chat.router.js'
import messageModel from './dao/GeneralModels/message.model.js'
//import ConectarBD from "./dao/mongo/database.js"
import viewsUserRouter from "./routers/viewsUser.router.js"
import sessionsRouter from "./routers/sessions.router.js"
import session from "express-session"
import MongoStore from "connect-mongo"
import passport from 'passport'
import initializePassport from './config/passport.config.js'
import config from './config/config.js'
import mongoose from 'mongoose';
import mailPurchaseRouter from './routers/mailPurchase.router.js'
import errorHandler from './middlewares/error.middleware.js'



const port = config.port
const mongoURL = config.mongoURL
const mongoDBName = config.mongoDBName

const app = express(); // crea una instancia de una aplicación de express
app.use(express.json()); // middleware para parsear el body de las requests a JSON
app.use(errorHandler)
app.use(express.static('./src/public')); // middleware para servir archivos estáticos

// configuracion de la sesion
app.use(session({
  store: MongoStore.create({
    mongoUrl: mongoURL,
    dbName: mongoDBName,
    mongoOptions: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
}),
secret: 'secret',
resave: true,
saveUninitialized: true
}))

// configuracion de passport
initializePassport();
app.use(passport.initialize());
app.use(passport.session());

// configuracion del motor de plantillas handlebars
app.engine('handlebars', handlebars.engine());
app.set('views', './src/views');
app.set('view engine', 'handlebars');

//ConectarBD(); //Conecta a base de datos
// Inicialización del servidor
try {
  await mongoose.connect(mongoURL) // conecta con la base de datos
  const serverHttp = app.listen(port, () => console.log('server up')) // levanta el servidor en el puerto especificado  
  const io = new Server(serverHttp) // instancia de socket.io
  
  app.use((req, res, next) => {
      req.io = io;
      next();
    }); // middleware para agregar la instancia de socket.io a la request
    
     // Rutas
     app.get('/', (req, res) => {
      if (req.session.user) {
          // Si el usuario ya está autenticado, redireccionar a la vista de productos
          res.render('index');
      } else {
          // Si el usuario no ha iniciado sesión, redireccionar a la vista de inicio de sesión
          res.redirect('/login');
      }
    })

    app.use('/', viewsUserRouter);
    app.use('/chat', chatRouter); // ruta para renderizar la vista de chat
    app.use('/products', viewsRouter); // ruta para renderizar la vista de productos
    app.use('/api/products', productsRouter); // registra el router de productos en la ruta /api/products
    app.use('/api/carts', cartsRouter); // registra el router de carritos en la ruta /api/carts
    app.use('/api/sessions', sessionsRouter);
    app.use('/sendMailPurchase', mailPurchaseRouter); // ruta utilizada para enviar el detalle de la compra

    io.on('connection', socket => {
        console.log('Nuevo cliente conectado!')

        socket.broadcast.emit('Alerta');

        // Cargar los mensajes almacenados en la base de datos
        messageModel.find()
          .then(messages => {
            socket.emit('messages', messages); 
          })
          .catch(error => {
            console.log(error.message);
          });
    
        socket.on('message', data => {
          // Guardar el mensaje en la base de datos
          const newMessage = new messageModel({
            user: data.user,
            message: data.message
          });
    
          newMessage.save()
            .then(() => {
              // Emitir el evento messages con los mensajes actualizados de la base de datos
              messageModel.find()
                .then(messages => {
                  io.emit('messages', messages);
                })
                .catch(error => {
                  console.log(error.message);
                });
            })
            .catch(error => {
              console.log(error.message);
            });
        });

        socket.on('productList', async (data) => { 
            io.emit('updatedProducts', data ) // emite el evento updatedProducts con la lista de productos
        }) // evento que se ejecuta cuando se actualiza la lista de productos
    }) // evento que se ejecuta cuando un cliente se conecta
} catch (error) {
    console.log(error.message)
}
