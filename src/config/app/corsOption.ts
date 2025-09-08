import { BASE_FE_URL, BASE_FE_URL_ALT } from '../environment';

// Build the origins array, filtering out undefined values
const allowedOrigins = [
   'http://localhost:3000',
   'http://localhost:5000', // Backend port
   'http://localhost:5001', // Your Next.js frontend port
   'http://127.0.0.1:3000',
   'http://127.0.0.1:5000',
   'http://127.0.0.1:5001',
   BASE_FE_URL,
   BASE_FE_URL_ALT // From environment variable
   // Add your production frontend URL here when deploying
   // "https://your-frontend-domain.com"
].filter((origin): origin is string => typeof origin === 'string' && origin.length > 0);

const corsOptions = {
   origin: allowedOrigins,
   methods: [ 'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS' ],
   allowedHeaders: [ 'Content-Type', 'Accept', 'Authorization' ],
   credentials: true
};

export default corsOptions;
