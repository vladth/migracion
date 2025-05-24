import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import uploadRoutes from './routes/upload.route'; // asegúrate de usar .js si usas type: "module" en package.json

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Rutas
app.use('/api', uploadRoutes);

// Arranque del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
