import { NextFunction, Request, Response } from 'express';
import { AnyZodObject, ZodError } from 'zod';

/**
 * Middleware สำหรับ Validate request body ด้วย Zod Schema
 */
export function validateBody(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        res.status(400).json({
          success: false,
          message: 'ข้อมูลที่ส่งมาไม่ถูกต้อง (Validation Error)',
          errors: formattedErrors,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการตรวจสอบข้อมูล',
      });
    }
  };
}
