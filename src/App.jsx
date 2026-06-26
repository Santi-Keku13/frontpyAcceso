import React, { useState } from 'react';
import Cajero from './Cajero';
import Cliente from './Cliente';
import ClientePrioridad from './ClientePrioridad'; // 💡 Importamos la nueva pantalla
import './index.css';

function App() {
  // Ahora "modo" puede ser: 'cajero', 'cliente' o 'cliente-prioridad'
  const [modo, setModo] = useState('cajero');
  
  // URL BASE
  const BASE_URL = import.meta.env.PROD 
    ? 'https://wishing-division-cut-optics.trycloudflare.com'
    : 'http://localhost:5050';
  
  const API_URL = `${BASE_URL}/api`;

  printURLs(API_URL);
  
  return (
    <div className="app">
      <div className="modo-selector">
        <button 
          className={modo === 'cajero' ? 'active' : ''}
          onClick={() => setModo('cajero')}
        >
           Modo Cajero
        </button>
        <button 
          className={modo === 'cliente' ? 'active' : ''}
          onClick={() => setModo('cliente')}
        >
           Modo Cliente
        </button>
        {/* 💡 Nuevo botón para la pantalla de prioridad */}
        <button 
          className={modo === 'cliente-prioridad' ? 'active' : ''}
          onClick={() => setModo('cliente-prioridad')}
          style={{ borderLeft: '2px solid #ccc' }} // Separador visual opcional
        >
           Cliente Prioridad 
        </button>
      </div>

      {/* 💡 Renderizado condicional de las tres pantallas */}
      {modo === 'cajero' && <Cajero apiUrl={API_URL} />}
      {modo === 'cliente' && <Cliente apiUrl={API_URL} />}
      {modo === 'cliente-prioridad' && <ClientePrioridad apiUrl={API_URL} />}

      <div className="info-dev">
        <p>
          {import.meta.env.PROD ? ' PRODUCCIÓN' : ' DESARROLLO'} | 
          Modo: <strong>{modo.toUpperCase()}</strong>
        </p>
        <p>
          Desarrollado por FullStack Vera Santiago
        </p>
      </div>
    </div>
  );
}

// Helper para limpiar el cuerpo del componente de logs repetitivos
function printURLs(apiUrl) {
  console.log('🔧 URLs configuradas (Sin WebSocket):');
  console.log('  API:', apiUrl);
}

export default App;