import React, { useState } from 'react';
import Cajero from './Cajero';
import Cliente from './Cliente';
import ClientePrioridad from './ClientePrioridad';
import './index.css';

function App() {
  // "modo" puede ser: 'cajero', 'cliente' o 'cliente-prioridad'
  const [modo, setModo] = useState('cajero');
  
  // URL BASE
  const BASE_URL = import.meta.env.PROD 
    ? 'https://gossip-arrange-troops-ensemble.trycloudflare.com'
    : 'http://localhost:5050';
  
  const API_URL = `${BASE_URL}/api`;

  printURLs(API_URL);
  
  return (
    <div className="app">
      {/* Barra superior de navegación */}
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
        <button 
          className={modo === 'cliente-prioridad' ? 'active' : ''}
          onClick={() => setModo('cliente-prioridad')}
        >
          Cliente Prioridad 
        </button>
      </div>

      {/* Vista principal (Ocupa exactamente el espacio sobrante sin scroll) */}
      <div className="app-content">
        {modo === 'cajero' && <Cajero apiUrl={API_URL} />}
        {modo === 'cliente' && <Cliente apiUrl={API_URL} />}
        {modo === 'cliente-prioridad' && <ClientePrioridad apiUrl={API_URL} />}
      </div>

      {/* Pie de página profesional fijo */}
      <footer className="footer-profesional">
        <p className="footer-copyright">
          © {new Date().getFullYear()} <strong>Blowmax</strong> | {import.meta.env.PROD ? 'PRODUCCIÓN' : 'DESARROLLO'} ({modo.toUpperCase()})
        </p>
        <p className="footer-autor">
          desarrollado por Vera Santiago
        </p>
      </footer>
    </div>
  );
}

// Helper para logs
function printURLs(apiUrl) {
  console.log('🔧 URLs configuradas (Sin WebSocket):');
  console.log('  API:', apiUrl);
}

export default App;