import Express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import logger from './utils/logger';
import httpLogger from './middleware/loggerMwr';
import { PORT, BASE_FE_URL } from './config';

const corsOptions = {
   origin: BASE_FE_URL,
   methods: [ 'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS' ],
   allowedHeaders: [ 'Content-Type', 'Accept', 'Authorization' ],
   credentials: true
};

const express = require('express');
const app = express();

app.use(Express.json());
app.use(cors(corsOptions));
app.use(helmet());

app.use(httpLogger);

// app.use('/api/auth'); example for import routes

app.get('/', (req: Request, res: Response) => {
   logger.info('Homepage accessed');
   res.send('Express on Vercel');
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
   logger.error(err.stack);
   res.status(500).send('Something broke!');
});

app.listen(PORT, () => console.log(`App is running on PORT ${PORT}`));

module.exports = app;
