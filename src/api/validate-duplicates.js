// src/api/validate-duplicates.js

import Airtable from 'airtable';

// Configuración de Airtable desde variables de entorno
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
    const { cedulas, validatorIds } = req.body;

    // Verificar cédulas duplicadas
    if (cedulas && cedulas.length > 0) {
      const cedulaFormula = `OR(${cedulas.map(c => `{CedulaParticipante} = '${c}'`).join(',')})`;
      const existingCedulas = await table.select({
        filterByFormula: cedulaFormula,
        fields: ['CedulaParticipante', 'NombreParticipante', 'ApellidoParticipante']
      }).firstPage();

      if (existingCedulas.length > 0) {
        const duplicateCedulas = existingCedulas.map(record =>
          `${record.get('CedulaParticipante')} (${record.get('NombreParticipante')} ${record.get('ApellidoParticipante')})`
        );
        return res.status(409).json({
          isDuplicate: true,
          message: `Las siguientes cédulas ya están registradas: ${duplicateCedulas.join(', ')}`
        });
      }
    }

    // Verificar IDs de validador duplicados
    if (validatorIds && validatorIds.length > 0) {
      const validatorFormula = `OR(${validatorIds.map(id => `{IDValidadorParticipante} = '${id}'`).join(',')})`;
      const existingValidators = await table.select({
        filterByFormula: validatorFormula,
        fields: ['IDValidadorParticipante', 'NombreParticipante', 'ApellidoParticipante', 'TipoTicketParticipante']
      }).firstPage();

      if (existingValidators.length > 0) {
        const duplicateValidators = existingValidators.map(record =>
          `${record.get('IDValidadorParticipante')} (${record.get('NombreParticipante')} ${record.get('ApellidoParticipante')} - ${record.get('TipoTicketParticipante')})`
        );
        return res.status(409).json({
          isDuplicate: true,
          message: `Los siguientes IDs de validador ya están registrados: ${duplicateValidators.join(', ')}`
        });
      }
    }

    return res.status(200).json({ isDuplicate: false, message: 'No se encontraron duplicados.' });

  } catch (error) {
    console.error('Error en la validación de duplicados con Airtable:', error);
    return res.status(500).json({ message: `Error del servidor al validar duplicados: ${error.message}` });
  }
}