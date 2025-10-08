import React, { useState, useEffect } from 'react';
import Airtable from 'airtable';
import * as XLSX from 'xlsx';
import './LeeABV.css';

// Configuración de Airtable
const apiKey = import.meta.env.VITE_APP_AIRTABLE_API_KEY;
const baseId = import.meta.env.VITE_APP_AIRTABLE_BASE_ID;

// Obtenemos los nombres de las tablas y filtramos las que no estén definidas
const tableNames = [
  import.meta.env.VITE_APP_AIRTABLE_TABLE_NAME1,
  import.meta.env.VITE_APP_AIRTABLE_TABLE_NAME2,
  import.meta.env.VITE_APP_AIRTABLE_TABLE_NAME3,
  import.meta.env.VITE_APP_AIRTABLE_TABLE_NAME4,
].filter(Boolean); // 'Boolean' elimina cualquier valor nulo o indefinido

const SECRET_KEY = "Holamundo";

let base;
let isAirtableConfigured = false;

if (apiKey && baseId) {
  base = new Airtable({ apiKey }).base(baseId);
  isAirtableConfigured = true;
} else {
  console.error("Faltan las variables de entorno de Airtable (VITE_APP_AIRTABLE_API_KEY y/o VITE_APP_AIRTABLE_BASE_ID).");
}

function AirtableDataViewer() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [columns, setColumns] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inputKey, setInputKey] = useState('');
  const [authError, setAuthError] = useState('');
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [deleting, setDeleting] = useState(false);
  const [selectedTable, setSelectedTable] = useState(''); // Nuevo estado para la tabla seleccionada

  useEffect(() => {
    // Solo se ejecuta si estamos autenticados, configurados y se ha seleccionado una tabla
    if (!isAuthenticated || !isAirtableConfigured || !selectedTable) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setData([]); // Limpiar datos anteriores
      setColumns([]);

      try {
        const table = base(selectedTable); // Instancia de la tabla seleccionada
        const records = await table.select().all();
        
        if (records && records.length > 0) {
          const formattedData = records.map(record => ({
            id: record.id,
            ...record.fields
          }));
          
          setData(formattedData);
          
          const allColumns = new Set();
          formattedData.forEach(row => {
            Object.keys(row).forEach(key => allColumns.add(key));
          });
          // Asegurarse de que la columna 'id' esté al principio si existe
          const sortedColumns = Array.from(allColumns);
          if (sortedColumns.includes('id')) {
            setColumns(['id', ...sortedColumns.filter(c => c !== 'id')]);
          } else {
            setColumns(sortedColumns);
          }
        }
      } catch (err) {
        console.error("Error fetching data from Airtable:", err);
        setError(`Error al cargar datos de la tabla "${selectedTable}": ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, selectedTable]); // Se ejecuta cuando cambia la autenticación o la tabla seleccionada

  const handleKeySubmit = (event) => {
    event.preventDefault();
    setAuthError('');
    if (inputKey === SECRET_KEY) {
      setIsAuthenticated(true);
    } else {
      setAuthError('Clave incorrecta. Inténtalo de nuevo.');
      setInputKey('');
    }
  };
  
  const handleTableSelection = (tableName) => {
    setSelectedTable(tableName);
    setSelectedRows(new Set()); // Limpiar selección al cambiar de tabla
  }

  const handleDownloadExcel = () => {
    if (data.length === 0) {
      alert("No hay datos para descargar.");
      return;
    }
    const dataForSheet = data.map(row => {
      const orderedRow = {};
      columns.forEach(colName => {
        if (typeof row[colName] === 'object' && row[colName] !== null) {
          orderedRow[colName] = JSON.stringify(row[colName]);
        } else {
          orderedRow[colName] = row[colName];
        }
      });
      return orderedRow;
    });
    const worksheet = XLSX.utils.json_to_sheet(dataForSheet, { header: columns });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DatosAirtable");
    XLSX.writeFile(workbook, `${selectedTable}_data.xlsx`);
  };

  const handleRowSelection = (rowId) => {
    const newSelectedRows = new Set(selectedRows);
    if (newSelectedRows.has(rowId)) {
      newSelectedRows.delete(rowId);
    } else {
      newSelectedRows.add(rowId);
    }
    setSelectedRows(newSelectedRows);
  };

  const handleSelectAll = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set());
    } else {
      const allRowIds = data.map(row => row.id);
      setSelectedRows(new Set(allRowIds));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedRows.size === 0 || !selectedTable) {
      alert("No hay filas seleccionadas para borrar.");
      return;
    }

    const confirmDelete = window.confirm(
      `¿Estás seguro de que quieres borrar ${selectedRows.size} registro(s) de la tabla "${selectedTable}"? Esta acción no se puede deshacer.`
    );

    if (!confirmDelete) {
      return;
    }

    setDeleting(true);
    setError(null);
    const table = base(selectedTable);

    try {
      const rowsToDelete = Array.from(selectedRows);
      
      // Airtable API permite borrar hasta 10 registros por llamada
      for (let i = 0; i < rowsToDelete.length; i += 10) {
          const chunk = rowsToDelete.slice(i, i + 10);
          await table.destroy(chunk);
      }

      setData(prevData => prevData.filter(row => !selectedRows.has(row.id)));
      setSelectedRows(new Set());
      
      alert(`${rowsToDelete.length} registro(s) borrado(s) exitosamente.`);

    } catch (err) {
      console.error("Error deleting data from Airtable:", err);
      setError(err.message || "Error al borrar los datos.");
      alert("Error al borrar los datos: " + (err.message || "Error desconocido"));
    } finally {
      setDeleting(false);
    }
  };

  // 1. Pantalla de Autenticación
  if (!isAuthenticated) {
    return (
      <div className="data-viewer-container key-prompt-container">
        <div className="data-viewer-header">
          <h2>Acceso Restringido</h2>
        </div>
        <form onSubmit={handleKeySubmit} className="key-form">
          <p>Por favor, ingresa la clave para acceder a los datos:</p>
          <input
            type="password"
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            className="key-input"
            placeholder="Ingresa la clave"
            required
          />
          <button type="submit" className="key-submit-button">
            Acceder
          </button>
          {authError && <p className="auth-error-message">{authError}</p>}
        </form>
      </div>
    );
  }

  // 2. Mensaje de error si Airtable no está configurado
  if (!isAirtableConfigured) {
      return <div className="error-message">Error: Airtable no está configurado. Revisa la consola y tus variables de entorno.</div>;
  }
  
  // 3. Pantalla de Selección de Tabla
  if (!selectedTable) {
    return (
        <div className="data-viewer-container table-selection-container">
            <div className="data-viewer-header">
                <h2>Seleccionar Tabla</h2>
            </div>
            <p>Elige la tabla que deseas consultar:</p>
            <select
                onChange={(e) => handleTableSelection(e.target.value)}
                defaultValue=""
                className="table-select"
            >
                <option value="" disabled>-- Haz clic aquí --</option>
                {tableNames.map(name => (
                    <option key={name} value={name}>{name}</option>
                ))}
            </select>
            {tableNames.length === 0 && <p className="error-message">No se encontraron nombres de tablas en la configuración.</p>}
        </div>
    );
  }

  // 4. Pantalla de Carga
  if (loading) {
    return <p className="loading-message">Cargando datos de "{selectedTable}"...</p>;
  }

  // 5. Pantalla de Error
  if (error) {
    return (
        <div className="data-viewer-container">
             <p className="error-message">Error: {error}</p>
             <button onClick={() => setSelectedTable('')} className="action-button">Volver a seleccionar tabla</button>
        </div>
    );
  }

  // 6. Vista de Datos
  return (
    <div className="data-viewer-container">
      <div className="data-viewer-header">
        <h2>Datos de la Tabla: {selectedTable}</h2>
        <button onClick={() => setSelectedTable('')} className="change-table-button">
          Cambiar de Tabla
        </button>
      </div>
      {data.length > 0 ? (
        <>
          <div className="action-buttons">
            <button
              onClick={handleDownloadExcel}
              className="download-button"
            >
              Descargar como Excel (.xlsx)
            </button>
            <button
              onClick={handleDeleteSelected}
              className="delete-button"
              disabled={selectedRows.size === 0 || deleting}
            >
              {deleting ? 'Borrando...' : `Borrar Seleccionados (${selectedRows.size})`}
            </button>
          </div>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectedRows.size === data.length && data.length > 0}
                      onChange={handleSelectAll}
                      title="Seleccionar/Deseleccionar todo"
                    />
                  </th>
                  {columns.map(colName => (
                    <th key={colName}>
                      {colName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.id} className={selectedRows.has(row.id) ? 'selected-row' : ''}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedRows.has(row.id)}
                        onChange={() => handleRowSelection(row.id)}
                      />
                    </td>
                    {columns.map(colName => (
                      <td key={`${row.id}-${colName}`}>
                        {typeof row[colName] === 'object' && row[colName] !== null
                          ? JSON.stringify(row[colName])
                          : row[colName] === null || row[colName] === undefined ? '' : String(row[colName])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p className="no-data-message">No se encontraron datos en la tabla "{selectedTable}".</p>
      )}
    </div>
  );
}

export default AirtableDataViewer;