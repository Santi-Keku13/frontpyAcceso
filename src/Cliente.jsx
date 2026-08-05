import React, { useState, useEffect, useRef } from 'react';

const Cliente = ({ apiUrl }) => {  
  const [ultimoTurno, setUltimoTurno] = useState(null);
  const timerRef = useRef(null);
  const pollingRef = useRef(null);

  // 🔴 REFERENCIA CRÍTICA: Mantiene el último ID sin provocar re-renders ni romper el setInterval
  const ultimoTurnoIdRef = useRef(null);

  // --- CONFIGURACIÓN DEL CARRUSEL ---
  const imagenesPropaganda = [
    "/assets/propaganda2.png",
    "/assets/propaganda.png",
    "/assets/propaganda1.jpeg",
    "/assets/propaganda3.jpeg",
    "/assets/propaganda4.jpeg",
    "/assets/propaganda7.jpeg",
  ];
  
  const [imagenActualIdx, setImagenActualIdx] = useState(0);

  // Efecto para cambiar automáticamente de imagen cada 10 segundos
  useEffect(() => {
    const carruselInterval = setInterval(() => {
      setImagenActualIdx((prevIdx) => (prevIdx + 1) % imagenesPropaganda.length);
    }, 10000);

    return () => clearInterval(carruselInterval);
  }, [imagenesPropaganda.length]);

  // Temporizador de 10 minutos para limpiar el display
  useEffect(() => {
    if (ultimoTurno) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setUltimoTurno(null);
        ultimoTurnoIdRef.current = null;
      }, 10 * 60 * 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [ultimoTurno]);

  const reproducirSonido = () => {
    const audio = new Audio('/assets/llamador.mp3');
    audio.play().catch((err) => {
      console.warn("Reproducción automática bloqueada por el navegador:", err);
    });
  };

  // 🔄 POLLING CORREGIDO
  useEffect(() => {
    const fetchUltimoTurno = async () => {
      try {
        const response = await fetch(`${apiUrl}/ultimo-turno`);
        const data = await response.json();
        
        if (data && data.ultimoTurno) {
          const turnoRecibido = data.ultimoTurno;
          const nuevoId = turnoRecibido.id || `${turnoRecibido.caja}-${turnoRecibido.turno}`;

          // CASO 1: Carga inicial de la pantalla -> Guardar estado SIN reproducir audio
          if (ultimoTurnoIdRef.current === null) {
            ultimoTurnoIdRef.current = nuevoId;
            setUltimoTurno({
              id: nuevoId,
              caja: turnoRecibido.caja,
              hora: turnoRecibido.hora
            });
          } 
          // CASO 2: Llegó un llamado NUEVO -> Actualizar pantalla Y REPRODUCIR SONIDO
          else if (ultimoTurnoIdRef.current !== nuevoId) {
            ultimoTurnoIdRef.current = nuevoId;
            setUltimoTurno({
              id: nuevoId,
              caja: turnoRecibido.caja,
              hora: turnoRecibido.hora
            });
            
            // 🔔 SUENA ÚNICAMENTE CUANDO SE GENERA UN NUEVO TURNO
            reproducirSonido();
          }
        }
      } catch (error) {
        console.error("Error obteniendo último turno:", error);
      }
    };

    // Consulta inicial inmediata
    fetchUltimoTurno();
    
    // Polling regular cada 3 segundos
    pollingRef.current = setInterval(fetchUltimoTurno, 3000);
    
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [apiUrl]); // 🔴 'ultimoTurno' eliminado de las dependencias para evitar desincronizaciones

  const imagenMostrar = imagenesPropaganda[imagenActualIdx];

  return (
    <div style={styles.viewPort}>
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.tituloPrincipal}>BLOW MAX</h1>
          <p style={styles.eslogan}>El mayorista del centro</p>
        </header>

        <main style={styles.mainContent}>
          {/* SECCIÓN DEL CARRUSEL DE IMÁGENES */}
          <div style={{
            ...styles.videoSection,
            backgroundImage: `url(${imagenMostrar})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transition: 'background-image 0.5s ease-in-out'
          }}>
            <div style={styles.blurOverlay}>
              <img 
                key={imagenActualIdx} 
                src={imagenMostrar} 
                style={{
                  ...styles.videoPlayer,
                  transition: 'opacity 0.5s ease-in-out'
                }}
                alt={`Propaganda ${imagenActualIdx + 1}`}
              />
            </div>
          </div>

          <div style={styles.turnoSection}>
            <div style={{
              ...styles.display,
              ...(ultimoTurno ? styles.displayActivo : {})
            }}>
              {ultimoTurno ? (
                <div style={styles.contentWrapper}>
                  <div style={styles.mensaje}>PASE A CAJA</div>
                  <div style={styles.cajaNumero}>
                    {ultimoTurno.caja}
                  </div>
                  <div style={styles.cajaLabel}>MUCHAS GRACIAS</div>
                </div>
              ) : (
                <div style={styles.esperando}>
                  <div style={styles.textoEspera}>BIENVENIDOS</div>
                  <div style={styles.subtextoEspera}>aguarde su turno...</div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const styles = {
  viewPort: { 
    height: 'calc(100vh - 160px)', 
    width: '100%', 
    overflow: 'hidden', 
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'column'
  },
  container: { 
    height: '100%', 
    display: 'flex', 
    flexDirection: 'column', 
    padding: '10px 20px',
    boxSizing: 'border-box'
  },
  header: { 
    textAlign: 'center', 
    height: '12%', 
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  tituloPrincipal: { 
    fontSize: '7vh', 
    color: '#FF0000', 
    fontWeight: '900', 
    margin: 0,
    lineHeight: 1
  },
  eslogan: { fontSize: '2.5vh', color: '#cc0000', margin: 0 },
  mainContent: { 
    display: 'flex', 
    height: '88%', 
    gap: '20px', 
    paddingBottom: '10px'
  },
  videoSection: { 
    flex: 1.8, 
    backgroundColor: '#000', 
    borderRadius: '25px', 
    overflow: 'hidden',
    height: '100%',
    position: 'relative',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
  },
  blurOverlay: {
    width: '100%',
    height: '100%',
    backdropFilter: 'blur(20px)',
    backgroundColor: 'rgba(0,0,0,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  videoPlayer: { 
    maxWidth: '100%', 
    maxHeight: '100%', 
    objectFit: 'contain',
    display: 'block',
    zIndex: 2
  },
  turnoSection: { flex: 1, height: '100%' },
  display: { 
    height: '100%',
    borderRadius: '25px', 
    backgroundColor: '#fff',
    border: '1.2vh solid #FF0000', 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'space-around', 
    boxSizing: 'border-box',
    padding: '2vh'
  },
  contentWrapper: { 
    display: 'flex', flexDirection: 'column', alignItems: 'center', 
    justifyContent: 'space-between', height: '100%', width: '100%' 
  },
  mensaje: { fontSize: '5vh', fontWeight: 'bold', color: '#FF0000' },
  cajaLabel: { fontSize: '6vh', fontWeight: 'bold', color: '#FF0000' },
  cajaNumero: { fontSize: '30vh', fontWeight: '900', color: '#FF0000', lineHeight: 0.8 },
  esperando: { textAlign: 'center', color: '#FF0000' },
  textoEspera: { fontSize: '7vh', fontWeight: 'bold' },
  subtextoEspera: { fontSize: '3vh', opacity: 0.5 },
  displayActivo: { boxShadow: '0 0 40px rgba(255, 0, 0, 0.4)' }
};

export default Cliente;