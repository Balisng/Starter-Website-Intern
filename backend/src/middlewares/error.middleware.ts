import { NextFunction, Request, Response } from 'express';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('💥 Uncaught Server Error:', err);

  const status = err.status || 500;
  const message = err.message || 'เกิดข้อผิดพลาดภายในระบบเซิร์ฟเวอร์';

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}
