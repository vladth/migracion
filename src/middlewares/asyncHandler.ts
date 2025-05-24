// src/middlewares/asyncHandler.ts
import { Request, Response, NextFunction } from 'express';

// Define un tipo para un RequestHandler asíncrono que puede lanzar un error
type AsyncRequestHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<any>; // Promise<any> para indicar que puede resolver a cualquier cosa, pero no importa el valor de retorno.

/**
 * Middleware para envolver funciones asíncronas de Express.js y manejar sus errores.
 * Esto evita la necesidad de usar bloques try-catch repetitivos en cada función asíncrona.
 * Si la promesa se resuelve, continúa el flujo. Si se rechaza, pasa el error al siguiente middleware de manejo de errores.
 */
const asyncHandler = (fn: AsyncRequestHandler) => 
    (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };

export default asyncHandler;