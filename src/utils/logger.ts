// logger.ts
import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';

// Define custom log levels
const levels = {
   error: 0,
   warn: 1,
   info: 2,
   http: 3,
   debug: 4
};

// Define custom colors for log levels
const colors = {
   error: 'red',
   warn: 'yellow',
   info: 'green',
   http: 'magenta',
   debug: 'white'
};

winston.addColors(colors);

// Define log format
const format = winston.format.combine(
   winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
   winston.format.errors({ stack: true }),
   winston.format.splat(),
   winston.format.json()
);

// Define log format for console
const consoleFormat = winston.format.combine(
   winston.format.colorize({ all: true }),
   winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
   winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
);

// Create transports
const transports = [
   // Console transport
   new winston.transports.Console({
      format: consoleFormat
   }),

   // File transport for errors
   new winston.transports.File({
      filename: path.join(__dirname, '../logs/error.log'),
      level: 'error',
      format
   }),

   // Combined log file
   new winston.transports.File({
      filename: path.join(__dirname, '../logs/combined.log'),
      format
   }),

   // Daily rotate file transport
   new winston.transports.DailyRotateFile({
      filename: path.join(__dirname, '../logs/application-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format
   })
];

// Create and export logger
const Logger = winston.createLogger({
   level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
   levels,
   transports
});

export default Logger;
