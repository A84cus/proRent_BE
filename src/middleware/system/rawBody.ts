// middleware/system/rawBody.ts
import { Request, Response, NextFunction } from 'express';
import { PassThrough } from 'stream';

export function rawBodyMiddleware (req: Request, res: Response, next: NextFunction) {
   const chunks: Buffer[] = [];

   req.on('data', chunk => {
      chunks.push(chunk);
   });

   req.on('end', () => {
      const rawBody = Buffer.concat(chunks);
      (req as any).rawBody = rawBody;

      // 👇 Reconstruct stream so express.json() can still parse body later (if needed)
      const pass = new PassThrough();
      pass.end(rawBody);

      // Override pipe to use our reconstructed stream
      req.pipe = pass.pipe.bind(pass);

      // Optional: Update content-length if needed (some parsers check this)
      (req as any).headers['content-length'] = String(rawBody.length);

      next();
   });

   req.on('error', err => {
      console.error('Error reading raw body:', err);
      next(err);
   });
}
