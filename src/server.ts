// server.ts
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; // <-- ¡IMPORTA CORS AQUÍ!
import uploadRoutes from './routes/upload.route';
import path from 'path';
// import { Router } from 'express'; // Esto no es necesario en server.ts

dotenv.config();

const app = express();

// --- ¡AGREGA EL MIDDLEWARE DE CORS AQUÍ! ---
// Es vital que esté antes de tus definiciones de ruta y otros middlewares de procesamiento de cuerpo.
app.use(cors({
  origin: 'http://localhost:4200', // Permite solicitudes solo desde tu frontend Angular
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Define los métodos HTTP permitidos
  credentials: true // Necesario si tu frontend envía cookies o tokens de autorización
}));
// ------------------------------------------

app.use(express.json()); // Para parsear cuerpos de solicitud JSON
// Si también sirves archivos estáticos como imágenes o PDFs
// app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 


app.use('/api', uploadRoutes); // Tus rutas API

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

// --- ¡Opcional pero recomendado: Middleware de manejo de errores global! ---
// Si tienes un asyncHandler en tus rutas, este middleware capturará los errores.
// Si no lo tienes, puedes agregarlo para un manejo centralizado de errores.
// import { Request, Response, NextFunction } from 'express'; // Si TypeScript lo requiere
// app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
//   console.error(err.stack); // Imprime el stack trace del error en la consola del servidor
//   res.status(500).json({ error: 'Algo salió mal en el servidor.' });
// });