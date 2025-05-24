import { Router } from 'express';
import multer from 'multer';
import xlsx from 'xlsx';
import { pool } from '../db';
import fs from 'fs';
import asyncHandler from '../middlewares/asyncHandler'; // Importa el middleware

const router = Router();
const upload = multer({ dest: 'uploads/' });

/**
 * Convierte un número de serie de fecha de Excel a una cadena de fecha ISO (YYYY-MM-DD).
 * @param serial El número de serie de la fecha de Excel.
 * @returns La fecha en formato 'YYYY-MM-DD' o null si el valor no es válido.
 */
function excelDateToJSDate(serial: number): string | null {
    if (typeof serial !== 'number' || isNaN(serial)) {
        console.warn('excelDateToJSDate: Valor de entrada no numérico o NaN:', serial);
        return null;
    }

    const utc_days = Math.floor(serial - 25569);
    const date_info = new Date(utc_days * 86400 * 1000);

    if (isNaN(date_info.getTime())) {
        console.error('excelDateToJSDate: Fecha JavaScript resultante inválida para el valor Excel:', serial);
        return null;
    }
    
    return date_info.toISOString().split('T')[0];
}

// ... (imports y excelDateToJSDate como antes)

router.post('/upload', upload.single('file'), asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No se subió ningún archivo' });
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    
    const data = xlsx.utils.sheet_to_json(sheet, { raw: true });

    // ***** AJUSTA ESTOS NOMBRES SI NO COINCIDEN EXACTAMENTE CON TUS ENCABEZADOS EN EL EXCEL *****
    const COLUMN_NAMES = {
        nombre: 'nombre', 
        hojaRuta: 'hoja de ruta', 
        cite: 'cite', 
        producto: 'producto', 
        comprobante: 'comprobante', // <--- ¡RE-VERIFICA ESTE!
        fecha: 'fecha' // <--- ¡RE-VERIFICA ESTE!
    };

    let insertedRowsCount = 0;
    let skippedRowsCount = 0;

    for (const row of data as any[]) {
        // Validación y obtención de valores
        const nombre = row[COLUMN_NAMES.nombre];
        const hojaRuta = row[COLUMN_NAMES.hojaRuta];
        const cite = row[COLUMN_NAMES.cite];
        const producto = row[COLUMN_NAMES.producto];

        // --- Manejo de Comprobante ---
        let comprobanteRaw = row[COLUMN_NAMES.comprobante];
        let comprobanteReal: number | null = null; // Asumimos que puede ser null si tu DB lo permite, si no, pon 0 o un valor por defecto

        if (typeof comprobanteRaw === 'number' && !isNaN(comprobanteRaw)) {
            comprobanteReal = comprobanteRaw;
        } else if (typeof comprobanteRaw === 'string' && !isNaN(parseFloat(comprobanteRaw))) {
            // Intentar parsear si es una cadena que parece número (ej. "12345")
            comprobanteReal = parseFloat(comprobanteRaw);
        } else {
            console.warn(`La celda '${COLUMN_NAMES.comprobante}' para la fila ${JSON.stringify(row)} ` +
                         `no es un número válido o está ausente (${typeof comprobanteRaw}: ${comprobanteRaw}).`);
            
            // Si 'comprobante' es NOT NULL en DB, NECESITAS asignar un valor aquí.
            // Opción 1: Asignar un valor por defecto (ej. 0 o un identificador de error)
            comprobanteReal = 0; // O algún valor que tu DB acepte y signifique 'sin comprobante'
            console.warn(`Asignando 0 como valor por defecto para 'comprobante'.`);

            // Opción 2: Saltar la fila si no tiene comprobante válido (si el comprobante es estrictamente obligatorio)
            // console.warn(`Saltando fila sin valor válido en '${COLUMN_NAMES.comprobante}': ${JSON.stringify(row)}`);
            // skippedRowsCount++;
            // continue; // Pasa a la siguiente fila del Excel
        }

        // --- Manejo de Fecha ---
        const fechaExcelRaw = row[COLUMN_NAMES.fecha];
        let fechaReal: string | null = null; // Asumimos que puede ser null si tu DB lo permite

        if (typeof fechaExcelRaw === 'number' && !isNaN(fechaExcelRaw)) {
            fechaReal = excelDateToJSDate(fechaExcelRaw);
        } else {
            console.warn(`La celda '${COLUMN_NAMES.fecha}' para la fila ${JSON.stringify(row)} ` +
                         `no es un número válido o está ausente (${typeof fechaExcelRaw}: ${fechaExcelRaw}).`);
            
            // Si 'fecha' es NOT NULL en DB, NECESITAS asignar un valor aquí.
            // Opción 1: Asignar una fecha por defecto (ej. la fecha actual)
            fechaReal = new Date().toISOString().split('T')[0];
            console.warn(`Asignando la fecha actual (${fechaReal}) como valor por defecto para 'fecha'.`);

            // Opción 2: Saltar la fila si no tiene fecha válida (si la fecha es estrictamente obligatoria)
            // console.warn(`Saltando fila sin valor válido en '${COLUMN_NAMES.fecha}': ${JSON.stringify(row)}`);
            // skippedRowsCount++;
            // continue; // Pasa a la siguiente fila del Excel
        }
        
        // Ejecuta la consulta SQL para insertar los datos
        await pool.query(
            'INSERT INTO inventario(nombre, hoja_ruta, cite, producto, comprobante, fecha) VALUES ($1, $2, $3, $4, $5, $6)',
            [
                nombre, 
                hojaRuta,
                cite, 
                producto, 
                comprobanteReal, // Usamos el valor procesado
                fechaReal        // Usamos el valor procesado
            ]
        );
        insertedRowsCount++;
    }

    // Elimina el archivo temporal
    fs.unlinkSync(req.file.path);

    res.status(200).json({ 
        message: `Datos insertados correctamente en la base de datos. Filas insertadas: ${insertedRowsCount}. Filas saltadas: ${skippedRowsCount}.` 
    });

}));

export default router;