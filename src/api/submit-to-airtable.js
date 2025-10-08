// src/api/submit-to-airtable.js

import Airtable from 'airtable';

// Configuración de Airtable
const apiKey = import.meta.env.VITE_APP_AIRTABLE_API_KEY;
const baseId = import.meta.env.VITE_APP_AIRTABLE_BASE_ID;
const tableName = import.meta.env.VITE_APP_AIRTABLE_TABLE_NAME;

const base = new Airtable({ apiKey }).base(baseId);
const table = base(tableName);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { records } = req.body;

    // Airtable espera un array de objetos, cada uno con una propiedad "fields"
    const formattedRecords = records.map(record => ({
      fields: record
    }));

    // El API de Airtable permite crear hasta 10 registros por llamada
    const createdRecords = await table.create(formattedRecords);

    console.log('Registros creados en Airtable:', createdRecords.length);
    return res.status(200).json({
      message: '¡Inscripción enviada exitosamente a Airtable!',
      data: createdRecords.map(r => r.id)
    });

  } catch (error) {
    console.error('Error al enviar datos a Airtable:', error);
    return res.status(500).json({ message: `Error del servidor al enviar datos: ${error.message}` });
  }
}