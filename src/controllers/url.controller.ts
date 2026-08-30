import { Request, Response, NextFunction } from 'express';
import { urlService } from '../services/url.service';

export const urlController = {
  async shorten(req: Request, res: Response, next: NextFunction) {
    try {
      const { originalUrl } = req.body;

      if (!originalUrl) {
        return res.status(400).json({ error: 'originalUrl is required' });
      }

      const result = await urlService.shorten(originalUrl);
      return res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },

  async redirect(req: Request<{ shortCode: string }>, res: Response, next: NextFunction) {
    try {
      const { shortCode } = req.params;
      const originalUrl = await urlService.resolve(shortCode);

      if (!originalUrl) {
        return res.status(404).json({ error: 'Short URL not found' });
      }

      return res.redirect(302, originalUrl);
    } catch (err) {
      next(err);
    }
  },
};
