'use strict';
import express from 'express';
import indexRoutes from './routes/index.routes.js'
import { logger } from './libs/logs.js';
import { PORT } from './libs/constans.js';

const app = express();

app.use(indexRoutes)

app.listen(PORT);

logger.info("app running in port", PORT)
logger.silly("lol")