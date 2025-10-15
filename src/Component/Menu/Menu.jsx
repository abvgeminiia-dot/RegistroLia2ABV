import React, { useState } from 'react';
import './Menu.css';

function MenuFormularios() {
  // 1. Inicializa los estados en `null` para indicar que no hay selección inicial.
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedShift, setSelectedShift] = useState(null);

  // Configuración de formularios por fecha y turno
  const FORM_CONFIG = {
    Fecha1: {
      Manana: '/FormABV2',
      Tarde: '/FormABV4' // Actualizar cuando exista
    },
    Fecha2: {
      Manana: '/FormABV6', // Actualizar cuando exista
      Tarde: '/FormABV8' // Actualizar cuando exista
    }
  };

  // 2. Un nuevo manejador para el cambio de fecha.
  //    Cada vez que se cambia la fecha, se resetea el turno.
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setSelectedShift(null); // ¡Importante! Resetea el turno al cambiar la fecha.
  };

  const getCurrentFormUrl = () => {
    return FORM_CONFIG[selectedDate]?.[selectedShift] || '#';
  };

  const getCurrentFormLabel = () => {
    if (!selectedDate || !selectedShift) return '...'; // Mensaje mientras no se complete la selección
    const dateLabel = selectedDate === 'Fecha1' ? 'Fecha 1' : 'Fecha 2';
    const shiftLabel = selectedShift === 'Manana' ? 'Mañana' : 'Tarde';
    return `${dateLabel} - ${shiftLabel}`;
  };

  const isFormAvailable = () => {
    return getCurrentFormUrl() !== '#';
  };

  return (
    <div className="menu-formularios-container">
      <div className="menu-header">
        <h2>Selección de Formulario de Inscripción</h2>
        <p>Selecciona la fecha y turno para acceder al formulario correspondiente</p>
      </div>

      <div className="selection-cards">
        {/* Selección de Fecha (siempre visible) */}
        <div className="selection-card">
          <div className="card-header">
            <h3>Paso 1: Selecciona la Fecha</h3>
          </div>
          <div className="card-options">
            <label className="option-item">
              <input
                type="radio"
                name="date"
                value="Fecha1"
                checked={selectedDate === 'Fecha1'}
                onChange={handleDateChange} // Usamos el nuevo manejador
              />
              <div className="option-content">
                <span className="option-title">3 de 8:00 a.m. a 12:30 p.m. y 4 de noviembre de 2025</span>
                <span className="option-description">Primera fecha del evento</span>
              </div>
            </label>

            <label className="option-item disabled">
              <input
                type="radio"
                name="date"
                value="Fecha2"
                checked={selectedDate === 'Fecha2'}
                onChange={handleDateChange} // Usamos el nuevo manejador
                 // Deshabilitado como en tu ejemplo original
              />
              <div className="option-content">
                <span className="option-title">5 de 8:00 a.m. a 12:30 p.m. y 6 de noviembre de 2025</span>
                <span className="option-description">Próximamente - No disponible</span>
              </div>
            </label>
          </div>
        </div>

        {/* 3. Renderizado Condicional: La tarjeta de turno solo aparece si se ha seleccionado una fecha */}
        {selectedDate && (
          <div className="selection-card">
            <div className="card-header">
              <h3>Paso 2: Selecciona horario para la práctica del segundo día</h3>
            </div>
            <div className="card-options">
              <label className="option-item">
                <input
                  type="radio"
                  name="shift"
                  value="Manana"
                  checked={selectedShift === 'Manana'}
                  onChange={(e) => setSelectedShift(e.target.value)}
                />
                <div className="option-content">
                  <span className="option-title">Turno mañana de 8:00 a.m. a 12:00 p.m.</span>
                  <span className="option-description">Sesión matutina</span>
                </div>
              </label>

              <label className="option-item">
                <input
                  type="radio"
                  name="shift"
                  value="Tarde"
                  checked={selectedShift === 'Tarde'}
                  onChange={(e) => setSelectedShift(e.target.value)}
                />
                <div className="option-content">
                  <span className="option-title">Turno tarde 1:00 p.m. a 5:00 p.m.</span>
                  <span className="option-description">Sesión vespertina</span>
                </div>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* 4. El resumen y botón de acción solo aparecen cuando AMBAS selecciones están hechas */}
      {selectedDate && selectedShift && (
        <div className="action-section">
          <div className="selection-summary">
            <h4>Formulario seleccionado:</h4>
            <div className="selected-form">
              <span className="form-label">{getCurrentFormLabel()}</span>
            </div>
          </div>

          {isFormAvailable() ? (
            <a 
              href={getCurrentFormUrl()}
              className="redirect-button"
            >
              Ir al Formulario de {getCurrentFormLabel()}
            </a>
          ) : (
            <button className="redirect-button disabled" >
              Formulario en Desarrollo
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default MenuFormularios;