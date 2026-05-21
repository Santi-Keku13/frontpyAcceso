import React, { useState, useEffect, useRef } from 'react';

const ClientePrioridad = ({ apiUrl }) => {  
  const [ultimoTurno, setUltimoTurno] = useState(null);
  const timerRef = useRef(null);
  const pollingRef = useRef(null);

  // --- CONFIGURACIÓN PARA EL CARRUSEL ---
  const imagenesPropaganda = [
    "/assets/propaganda2.png",
    "/assets/propaganda.jpeg", 
  ];
  
  const [imagenActualIdx, setImagenActualIdx] = useState(0);

  useEffect(() => {
    const carruselInterval = setInterval(() => {
      setImagenActualIdx((prevIdx) => (prevIdx + 1) % imagenesPropaganda.length);
    }, 10000); // 10 segundos

    return () => clearInterval(carruselInterval);
  }, [imagenesPropaganda.length]);
  // --------------------------------------------

  // Temporizador de 10 minutos para limpiar la pantalla
  useEffect(() => {
    if (ultimoTurno) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setUltimoTurno(null);
      }, 10 * 60 * 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [ultimoTurno]);

  /* Poling: Consultamos al nuevo endpoint de prioridad.
    Este endpoint devolverá la última caja prioritaria que emitió un llamado.
  */
  useEffect(() => {
    const fetchUltimoTurnoPrioridad = async () => {
      try {
        const response = await fetch(`${apiUrl}/ultimo-turno-prioridad`);
        const data = await response.json();
        
        if (data.ultimoTurno) {
          const turnoActual = {
            id: data.ultimoTurno.id, // 👈 Guardamos el ID único (timestamp)
            caja: data.ultimoTurno.caja,
            hora: data.ultimoTurno.hora
          };
          
          // 💡 ATENCIÓN: Solo suena si el ID del nuevo llamado es DISTINTO al que ya teníamos
          if (!ultimoTurno || ultimoTurno.id !== turnoActual.id) {
            setUltimoTurno(turnoActual);
            reproducirSonido();
          }
        }
      } catch (error) {
        console.error("Error obteniendo último turno prioritario:", error);
      }
    };

    fetchUltimoTurnoPrioridad();
    pollingRef.current = setInterval(fetchUltimoTurnoPrioridad, 3000);
    
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [apiUrl, ultimoTurno]);

  const reproducirSonido = () => {
    const audio = new Audio('/assets/llamador.mp3');
    audio.play().catch(() => {});
  };

  const imagenMostrar = imagenesPropaganda[imagenActualIdx];

  return (
    <div style={styles.viewPort}>
      <div style={styles.container}>
        <header style={styles.header}>
          {/* Un sutil indicador visual en el título que diferencia la pantalla física de prioridad */}
          <h1 style={styles.tituloPrincipal}>BLOW MAX <span style={styles.tagPrioridad}>⭐ PRIORIDAD</span></h1>
          <p style={styles.eslogan}>El mayorista del centro</p>
        </header>

        <main style={styles.mainContent}>
          {/* SECCIÓN DEL VIDEO/CARRUSEL */}
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
                </div>
              ) : (
                <div style={styles.esperando}>
                  <div style={styles.textoEspera}>BIENVENIDOS</div>
                  <div style={styles.subtextoEspera}>atención prioritaria...</div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// Se mantienen tus estilos base intactos y sumamos el detalle estético para el título
const styles = {
  viewPort: { height: 'calc(100vh - 160px)', width: '100%', overflow: 'hidden', backgroundColor: '#fff', display: 'flex', flexDirection: 'column' },
  container: { height: '100%', display: 'flex', flexDirection: 'column', padding: '10px 20px', boxSizing: 'border-box' },
  header: { textAlign: 'center', height: '12%', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  tituloPrincipal: { fontSize: '7vh', color: '#FF0000', fontWeight: '900', margin: 0, lineHeight: 1, position: 'relative' },
  tagPrioridad: { fontSize: '2.5vh', backgroundColor: '#FF0000', color: '#fff', padding: '2px 10px', borderRadius: '5px', verticalAlign: 'middle', marginLeft: '10px' },
  eslogan: { fontSize: '2.5vh', color: '#cc0000', margin: 0 },
  mainContent: { display: 'flex', height: '88%', gap: '20px', paddingBottom: '10px' },
  videoSection: { flex: 1.8, backgroundColor: '#000', borderRadius: '25px', overflow: 'hidden', height: '100%', position: 'relative', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' },
  blurOverlay: { width: '100%', height: '100%', backdropFilter: 'blur(20px)', backgroundColor: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  videoPlayer: { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block', zIndex: 2 },
  turnoSection: { flex: 1, height: '100%' },
  display: { height: '100%', borderRadius: '25px', backgroundColor: '#fff', border: '1.2vh solid #FF0000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around', boxSizing: 'border-box', padding: '2vh' },
  contentWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', height: '100%', width: '100%' },
  mensaje: { fontSize: '5vh', fontWeight: 'bold', color: '#FF0000' },
  cajaLabel: { fontSize: '6vh', fontWeight: 'bold', color: '#FF0000' },
  cajaNumero: { fontSize: '30vh', fontWeight: '900', color: '#FF0000', lineHeight: 0.8 },
  esperando: { textAlign: 'center', color: '#FF0000' },
  textoEspera: { fontSize: '7vh', fontWeight: 'bold' },
  subtextoEspera: { fontSize: '3vh', opacity: 0.5 },
  displayActivo: { boxShadow: '0 0 40px rgba(255, 0, 0, 0.4)' }
};

export default ClientePrioridad;