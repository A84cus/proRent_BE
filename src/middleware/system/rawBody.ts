import { Request, Response, NextFunction } from 'express';
import { Readable } from 'stream';

export function rawBodyMiddleware (req: Request, res: Response, next: NextFunction) {
   const chunks: Buffer[] = [];

   // Kumpulin semua chunk dari request body
   req.on('data', chunk => {
      chunks.push(chunk);
   });

   req.on('end', () => {
      const rawBody = Buffer.concat(chunks);
      (req as any).rawBody = rawBody;

      // 🔑 Re-create stream dari rawBody supaya middleware berikutnya (express.json) tetap bisa parse
      (req as any).headers['content-length'] = rawBody.length;
      req.pipe = function (dest) {
         const stream = Readable.from(rawBody);
         return stream.pipe(dest);
      };

      next();
   });

   req.on('error', err => {
      console.error('Error reading raw body:', err);
      next(err);
   });
}
