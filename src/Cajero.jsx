import React, { useState, useEffect } from 'react';

const Cajero = ({ apiUrl }) => {  
  const [cajas, setCajas] = useState([]);
  const [cajaSeleccionada, setCajaSeleccionada] = useState("");
  const [tipoLlamado, setTipoLlamado] = useState("prioridad"); // 💡 'prioridad' o 'comun'
  const [llamando, setLlamando] = useState(false);
  const [error, setError] = useState(null);

  // Cargar cajas al iniciar
  useEffect(() => {
    fetch(`${apiUrl}/cajas`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (data.length > 0) {
          setCajas(data);
          setCajaSeleccionada(data[0].id.toString());
        }
      })
      .catch(err => console.error("Error cargando cajas:", err));
  }, [apiUrl]);

  const cajaId = parseInt(cajaSeleccionada);
  const cajaActual = cajas.find(c => c.id === cajaId);
  
  // Lógica para saber si la caja actual tiene la doble opción
  const esCajaConPrioridad = [1, 2, 3].includes(cajaId);

  // 💡 Si el cajero cambia a una caja común (4 a 12), forzamos que el tipo sea 'comun'
  useEffect(() => {
    if (!esCajaConPrioridad) {
      setTipoLlamado("comun");
    } else {
      setTipoLlamado("prioridad"); // Por defecto que apunte a prioridad si elige la 1, 2 o 3
    }
  }, [cajaSeleccionada, esCajaConPrioridad]);

  const llamarTurno = async () => {
    try {
      setLlamando(true);
      
      // 💡 Enviamos 'prioridad=true' o 'false' basándonos estrictamente en lo que el cajero seleccionó
      const esPrioritario = tipoLlamado === "prioridad";
      const urlConPrioridad = `${apiUrl}/cajas/${cajaId}/llamar?prioridad=${esPrioritario}`;
      
      const response = await fetch(urlConPrioridad, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      console.log("✅ Respuesta Backend:", data);

      if (!response.ok) {
        throw new Error(data.mensaje || 'Error al llamar turno');
      }
      
      setError(`✅ Llamado enviado con éxito a fila ${tipoLlamado.toUpperCase()}`);
    } catch (err) {
      setError(`❌ ${err.message || 'Error de conexión'}`);
    } finally {
      setTimeout(() => { setLlamando(false); setError(null); }, 3000);
    }
  };

  return (
    <div style={stylesCajero.container}>
      <h1 style={stylesCajero.title}> PANEL DEL CAJERO</h1>
      <div style={stylesCajero.content}>
        {error && (
          <div style={{
            ...stylesCajero.mensaje, 
            backgroundColor: error.includes('✅') ? '#4CAF50' : '#f44336'
          }}>
            {error}
          </div>
        )}
        
        {/* 1. Selector de Caja */}
        <div style={stylesCajero.section}>
          <label style={stylesCajero.label}>Seleccionar Caja:</label>
          <select 
            style={stylesCajero.select} 
            value={cajaSeleccionada} 
            onChange={(e) => setCajaSeleccionada(e.target.value)}
          >
            {cajas.map(c => {
              const tienePrioridad = [1, 2, 3].includes(c.id);
              return (
                <option key={c.id} value={c.id}>
                  {c.nombre} {tienePrioridad ? ' (Híbrida)' : ''} {c.activa ? '(Activa)' : '(Inactiva)'}
                </option>
              );
            })}
          </select>
        </div>

        {/* 2. 💡 Selector de Fila (Solo se muestra para cajas 1, 2 y 3) */}
        {esCajaConPrioridad && (
          <div style={stylesCajero.sectionFlujo}>
            <label style={stylesCajero.label}>¿A quién vas a llamar?</label>
            <div style={stylesCajero.radioGroup}>
              <button
                type="button"
                style={{
                  ...stylesCajero.switchBtn,
                  ...(tipoLlamado === 'prioridad' ? stylesCajero.switchBtnActivePrio : {})
                }}
                onClick={() => setTipoLlamado('prioridad')}
              >
                ⭐ Fila Prioridad
              </button>
              <button
                type="button"
                style={{
                  ...stylesCajero.switchBtn,
                  ...(tipoLlamado === 'comun' ? stylesCajero.switchBtnActiveComun : {})
                }}
                onClick={() => setTipoLlamado('comun')}
              >
                👤 Fila Común
              </button>
            </div>
          </div>
        )}

        {/* Botón de acción reactivo */}
        <button 
          style={{
            ...stylesCajero.boton, 
            ...(llamando && {backgroundColor: '#ffa000'}),
            ...(!llamando && tipoLlamado === 'prioridad' && {backgroundColor: '#0d47a1'}) // Azul si llama a prioridad
          }}
          onClick={llamarTurno}
          disabled={llamando || !cajaActual?.activa}
        >
          {llamando ? ' LLAMANDO...' : `LLAMAR A ${tipoLlamado.toUpperCase()}`}
        </button>
      </div>
    </div>
  );
};

const stylesCajero = {
  container: { padding: '40px 20px', backgroundColor: '#f0f2f5', minHeight: '100vh' },
  title: { textAlign: 'center', color: '#1a237e' },
  content: { maxWidth: '400px', margin: '0 auto', backgroundColor: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' },
  section: { marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' },
  sectionFlujo: { marginBottom: '25px', display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '10px', border: '1px solid #e9ecef' },
  label: { fontWeight: 'bold', color: '#333' },
  select: { padding: '10px', borderRadius: '8px', border: '2px solid #1a237e', fontSize: '1rem' },
  radioGroup: { display: 'flex', gap: '10px' },
  switchBtn: { flex: 1, padding: '12px', border: '2px solid #ccc', borderRadius: '8px', backgroundColor: '#fff', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem', color: '#666', transition: 'all 0.2s' },
  switchBtnActivePrio: { backgroundColor: '#e3f2fd', color: '#0d47a1', borderColor: '#0d47a1' },
  switchBtnActiveComun: { backgroundColor: '#e8f5e9', color: '#2e7d32', borderColor: '#2e7d32' },
  boton: { width: '100%', padding: '20px', fontSize: '1.2rem', fontWeight: 'bold', backgroundColor: '#2e7d32', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', transition: 'background-color 0.2s' },
  mensaje: { padding: '10px', color: 'white', borderRadius: '8px', marginBottom: '15px', textAlign: 'center', fontWeight: 'bold' }
};

export default Cajero;