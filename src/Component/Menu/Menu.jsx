import React, { useState } from 'react';
import './Menu.css';

function MenuFormularios() {
  const [selectedDate, setSelectedDate] = useState('Fecha1');
  const [selectedShift, setSelectedShift] = useState('Manana');

  // Configuración de formularios por fecha y turno
  const FORM_CONFIG = {
    Fecha1: {
      Manana: '/FormABV2',
      Tarde: '/FormABV4' // Actualizar cuando exista
    },
    Fecha2: {
      Manana: '/formulario-fecha2-manana', // Actualizar cuando exista
      Tarde: '/formulario-fecha2-tarde' // Actualizar cuando exista
    }
  };

  const getCurrentFormUrl = () => {
    return FORM_CONFIG[selectedDate]?.[selectedShift] || '#';
  };

  const getCurrentFormLabel = () => {
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
        {/* Selección de Fecha */}
        <div className="selection-card">
          <div className="card-header">
            <h3>Selecciona la Fecha</h3>
          </div>
          <div className="card-options">
            <label className="option-item">
              <input
                type="radio"
                name="date"
                value="Fecha1"
                checked={selectedDate === 'Fecha1'}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              <div className="option-content">
                <span className="option-title">3 de noviembre de 2025 - 8:00 a.m. a 12:00 p.m. y 4 de noviembre de 2025</span>
                <span className="option-description">Primera fecha del evento</span>
              </div>
            </label>

            <label className="option-item disabled">
              <input
                type="radio"
                name="date"
                value="Fecha2"
                checked={selectedDate === 'Fecha2'}
                onChange={(e) => setSelectedDate(e.target.value)}
                disabled
              />
              <div className="option-content">
                <span className="option-title">5 de noviembre de 2025 - 8:00 a.m. a 12:00 p.m. y 6 de noviembre de 2025</span>
                <span className="option-description">Próximamente - No disponible</span>
              </div>
            </label>
          </div>
        </div>

        {/* Selección de Turno */}
        <div className="selection-card">
          <div className="card-header">
            <h3>Selecciona horario para la práctica del segundo día</h3>
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
                <span className="option-title">4 de noviembre de 2025 8:00 a.m. a 12:00 p.m.</span>
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
                <span className="option-title">4 de noviembre de 2025 1:00 p.m. a 5:00 p.m.</span>
                <span className="option-description">Sesión vespertina</span>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Resumen y botón de acción */}
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
          <button className="redirect-button disabled" disabled>
            Formulario en Desarrollo
          </button>
        )}
      </div>
    </div>
  );
}

export default MenuFormularios;