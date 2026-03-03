'use strict';
import 'dotenv/config';

//Importaciones
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import { corsOptions } from './cors-configuration.js'; // Agregué el .js, es buena práctica en módulos
import { dbConnection } from './db.js';
import { helmetConfiguration } from './helmet-configuration.js';
import { requestLimit } from '../middlewares/request-limit.js';
import { errorHandler } from '../middlewares/handle-errors.js';

// Importaciones de Rutas
const BASE_URL = '/bankSystem/v1';
import userRoutes from '../src/User/user.routes.js';
import accountRoutes from '../src/Account/account.routes.js';
import transactionRoutes from '../src/Transaction/transaction.routes.js';
import cardRoutes from '../src/Card/card.routes.js';
import authRoutes from '../src/Auth/auth.routes.js';
import loanApplicationRoutes from '../src/LoanApplication/loanApplication.routes.js';
import loanRoutes from '../src/Loan/loan.routes.js';
import exchangeRoutes from '../src/Exchange/exchange.routes.js';
import favoriteRoutes from '../src/Favorite/favorite.routes.js';
import productRoutes from '../src/Product/product.routes.js';


const middleware = (app) => {
    app.use(helmet(helmetConfiguration)); // Configuramos Helmet
    //Importamos los métodos creados anteriormente
    app.use(cors(corsOptions));
    //Limitamos el acceso y el tamaño de las consultas
    app.use(express.urlencoded({ extended: false, limit: '10mb' }));
    //Las consultas Json tendrán un tamaño máximo de 10mb
    app.use(express.json({ limit: '10mb' }));
    //Límite de peticiones por IP
    app.use(requestLimit);
    //Morgan nos ayudará a detectar errores del lado del usuario
    app.use(morgan('dev'));
}

//Integracion de todas las rutas
const routes = (app) => {
    app.use(`${BASE_URL}/users`, userRoutes);
    app.use(`${BASE_URL}/accounts`, accountRoutes);
    app.use(`${BASE_URL}/transactions`, transactionRoutes);
    app.use(`${BASE_URL}/cards`, cardRoutes);
    app.use(`${BASE_URL}/auths`, authRoutes);
    app.use(`${BASE_URL}/loanApplications`, loanApplicationRoutes);
    app.use(`${BASE_URL}/loans`, loanRoutes);
    app.use(`${BASE_URL}/exchange`, exchangeRoutes);
    app.use(`${BASE_URL}/favorites`, favoriteRoutes);
    app.use(`${BASE_URL}/products`, productRoutes);
}




const initServer = async () => {
    const app = express();
    const PORT = process.env.PORT || 3001;

    try {
        // 1. Conectar a DB (Usa await para esperar la conexión)
        await dbConnection();

        // 2. Configurar Middlewares
        middleware(app);

        // 3. Configurar Rutas (Incluyendo el health check)
        routes(app);

        // 4. Manejador de errores (debe ir después de las rutas)
        app.use(errorHandler);

        // Mueve el app.get del health check AQUÍ (antes del listen)
        app.get(`${BASE_URL}/health`, (req, res) => {
            res.status(200).json({ status: 'ok', service: 'Bank_System Admin' });
        });

        // 4. Iniciar escucha
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en el puerto ${PORT}`);
            console.log(`Base URL: http://localhost:${PORT}${BASE_URL}`);
        });

    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
    }
}

export { initServer };