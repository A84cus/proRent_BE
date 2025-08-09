import Express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import logger from "./utils/logger";
import httpLogger from "./middleware/loggerMwr";
import { PORT } from "./config";
import authRoute from "./route/authRoute";
import uploadRoute from "./route/uploadRoute";
import reserveRoute from "./route/reservationRoute";
import utilityRoute from "./route/utilityRoute";
import userRoute from "./route/userRoute";

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Accept", "Authorization"],
  credentials: true,
};

const express = require("express");
const app = express();

app.use(Express.json());
app.use(cors(corsOptions));
app.use(helmet());

app.use(httpLogger);

// Routes
app.use("/api/auth", authRoute);
app.use("/api/upload", uploadRoute);
app.use("/api/utility", utilityRoute);
app.use("/api/users", userRoute);
app.use("/api/reservation", reserveRoute);

app.get("/", (req: Request, res: Response) => {
  logger.info("Homepage accessed");
  res.send("Express on Vercel");
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(PORT, () => console.log(`App is running on PORT ${PORT}`));

module.exports = app;
