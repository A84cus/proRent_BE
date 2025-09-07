import Express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import logger from './utils/system/logger';
import httpLogger from './middleware/system/loggerMwr';
import { PORT } from './config';
import authRoute from './route/auth/authRoute';
import uploadRoute from './route/upload/uploadRoute';
import utilityRoute from './route/system/utilityRoute';
import reserveRoute from './route/reservation/reservationRoute';
import userRoute from './route/user/userRoute';
import cronJobRoute from './route/cronjobRoute';
import reviewRoute from './route/review/reviewRoute';
import ownerRoutes from './route/property/ownerRoutes';
import roomOperationsRoutes from './route/property/roomOperationsRoutes';
import publicPropertyRoute from './route/property/publicPropertyRoutes';
import reportRoute from './route/report/reportRoutes';
import corsOptions from './config/app/corsOption';
import xenditRoute from './route/webhooks/xenditRoute';
import { rawBodyMiddleware } from './middleware/system/rawBody';

const express = require('express');
const app = express();

// app.use(rawBodyMiddleware);

app.use(cors(corsOptions));
app.use(helmet());

app.use(httpLogger);

app.use('/api/webhooks', xenditRoute);
app.use(Express.json());

app.use('/api/auth', authRoute);
app.use('/api/public/properties', publicPropertyRoute);
app.use('/api/upload', uploadRoute);
app.use('/api/utility', utilityRoute);
app.use('/api/users', userRoute);
app.use('/api/reservation', reserveRoute);
app.use('/api/review', reviewRoute);
app.use('/api/cronjob', cronJobRoute);
app.use('/api/report', reportRoute);
app.use('/api/owner', ownerRoutes);
app.use('/api/rooms', roomOperationsRoutes);

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
