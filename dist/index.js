"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const logger_1 = __importDefault(require("./utils/logger"));
const loggerMwr_1 = __importDefault(require("./middleware/loggerMwr"));
const config_1 = require("./config");
const authRoute_1 = __importDefault(require("./route/authRoute"));
const uploadRoute_1 = __importDefault(require("./route/uploadRoute"));
const utilityRoute_1 = __importDefault(require("./route/utilityRoute"));
const userRoute_1 = __importDefault(require("./route/userRoute"));
const reservationRoute_1 = __importDefault(require("./route/reservationRoute"));
const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Accept", "Authorization"],
  credentials: true,
};
const express = require("express");
const app = express();
app.use(express_1.default.json());
app.use((0, cors_1.default)(corsOptions));
app.use((0, helmet_1.default)());
app.use(loggerMwr_1.default);
// Routes
app.use("/api/auth", authRoute_1.default);
app.use("/api/upload", uploadRoute_1.default);
app.use("/api/utility", utilityRoute_1.default);
app.use("/api/users", userRoute_1.default);
app.use("/api/reservation", reservationRoute_1.default);
app.get("/", (req, res) => {
  logger_1.default.info("Homepage accessed");
  res.send("Express on Vercel");
});
app.use((err, req, res, next) => {
  logger_1.default.error(err.stack);
  res.status(500).send("Something broke!");
});
app.listen(config_1.PORT, () =>
  console.log(`App is running on PORT ${config_1.PORT}`)
);
module.exports = app;
