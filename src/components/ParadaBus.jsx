import React, { useEffect, useState } from "react"; 
import "./ParadaBus.css";

const qrCode = 49360; // Variable del numero para el código QR
// 50036, 50001, 50031,43331
// 50061 lota la 302 y 304
const API_URL = `https://tdt.ilab.cl/tpmc/api_v2/stop_info/QRCode-${qrCode}`;
const logos = [
  { src: "/auspiciador1.png", alt: "Región del Biobío" },
  { src: "/auspiciador2.png", alt: "FIC Región del Biobío" },
  { src: "/auspiciador3.png", alt: "TDT Gran Concepción" },
  { src: "/auspiciador4.png", alt: "UTFSM" },
];
const handleToggleView = () => {
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
};
const ParadaBus = () => {
  const [rowClass, setRowClass] = useState("three-rows");
  const [cards, setCards] = useState([]);
  const [busStopTitle, setBusStopTitle] = useState("Cargando...");
  const [loading, setLoading] = useState(true); // Estado para la pantalla de carga
  const[isFlipped, setIsFlipped]= useState(false)
  const [isAnimating, setIsAnimating] = useState(false);
  const [isBlackCardVisible, setIsBlackCardVisible] = useState(false);
  const toggleBlackCard = () => {
    setIsBlackCardVisible(prevState => !prevState);
  }; 

  const busStop = {
    title: busStopTitle,
    code: "PC2040",
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_URL);
  
        if (!response.ok) {
          throw new Error(`Error en la API: ${response.status} ${response.statusText}`);
        }
        const jsonData = await response.json();
        console.log("Datos recibidos:", jsonData);
  
        let stopTitle = jsonData.stop_name || "Sin nombre";
        setBusStopTitle(stopTitle);
  
        if (!jsonData.lineas || !Array.isArray(jsonData.lineas)) {
          console.error("Estructura de datos inesperada, no se encontró 'lineas':", jsonData);
          return;
        }
  
        const buses = jsonData.lineas.map((linea) => {
          const routeShortName = linea.route_short_name || "";
          const routeLongName = linea.route_long_name || "Sin nombre";
  
          const numberMatch = routeShortName.match(/\d+/);
          const letterMatch = routeShortName.match(/[A-Za-z]+/);
  
          const destino1 = linea.lur?.linea1 || "Destino no disponible";
          const destino2 = linea.lur?.linea2 || "Destino no disponible";
          const destino3 = linea.lur?.linea3 || "Destino no disponible";
          const destino4 = linea.lur?.linea4 || "Destino no disponible";
  
          let estimatedTime = "Sin datos";
          if (linea.servicios?.length > 0) {
            estimatedTime = linea.servicios[0].trip_estimator || "Sin datos";
          } else if (linea.recientes?.length > 0) {
            estimatedTime = linea.recientes[0].trip_estimator || "Sin datos";
          }
  
          return {
            number: numberMatch ? numberMatch[0] : "",
            label: letterMatch ? letterMatch[0] : "",
            color: `#${linea.route_color || "000000"}`,
            description: routeLongName,
            name: routeShortName,
            time: estimatedTime,
            destino1,
            destino2,
            destino3,
            destino4,
          };
        });
        // Ordenar por número de mayor a menor
      
        
  
        setCards(Array.isArray(buses) ? buses : []);
  
        if (buses.length === 12) {
          setRowClass("three-columns");
        } else if (buses.length === 6) {
          setRowClass("two-columns");
        }
      } catch (error) {
        console.error("Error obteniendo datos:", error);
      } finally {
        setLoading(false);
      }
    };
      
  
    fetchData();
  }, []);
  
  useEffect(() => {
    setRowClass(cards.length <= 6 ? "two-rows" : "three-rows");
  }, [cards.length]);

  const cardChunks = [];
  for (let i = 0; i < cards.length; i += 12) {
    cardChunks.push(cards.slice(i, i + 12));
  }
  function handleFlip(){
    if(!isAnimating){
      setIsFlipped(prev => !prev);
      setIsAnimating(true);

    }  
  }
  const microChunks = [];
  for (let i = 0; i < cards.length; i += 12) {
    microChunks.push(cards.slice(i, i + 12));
    
}
if (loading) return <p>Cargando...</p>;
  return (
    <div>
       <section className="sponsors">
            {logos.map((logo, index) => (
              <img key={index} src={logo.src} alt={logo.alt} />
            ))}
          </section>
        {cardChunks.map((chunk, chunkIndex) => (
          <div key={chunkIndex} className="container-with-black-card">
            {/* Contenedor del bloque de micros */}
            <div className="container">
              <header className="header">
                <div className="bus-icon-container">
                  <img src="/bus.png" alt="Ícono de autobús" className="bus-icon" />
                  <p className="vertical-text">PC{qrCode}</p>
                </div>
                <h1>{busStopTitle}</h1>
                <div className="black-box">
                  <p className="bus-stop-text">Buses que se detienen en esta parada</p>
                </div>
              </header>

              {/* Tarjetas de Micros */}
              <div className={`grid-container ${rowClass}`}>
           
                {chunk.map((card, index) => (
                  <div className="card" key={index}>
                    <div className="top-section">
                      <span className="number">{card.number}</span>
                      {card.label && (
                        <span className="label" style={{ backgroundColor: card.color }}>
                          {card.label}
                        </span>
                      )}
                    </div>
                    <div className="time">{card.time}</div>
                    <div className="description" style={{ backgroundColor: card.color }}>
                      {card.description.split("\n").map((line, idx) => (
                        <React.Fragment key={idx}>
                          {line}
                          <br />
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pie de página */}
              <footer className="footer">
                <div className="footer-logo-left">
                  <img src="/TPMC_White.png" alt="Logo TPMC" />
                </div>
                <div className="footer-logo-right">
                  <img src="/MTT.png" alt="Otro logo" />
                </div>
              </footer>
            </div>
                
            {/* Tarjeta Negra de Información Adicional */}
            {isBlackCardVisible && (
             <div className="black-card bg-black text-white rounded-lg" style={{margin: 20}}>
               <div className={`black-card-grid ${cards.length > 6 ? "grid-cols-3" : "grid-cols-2"}`}>
              {chunk.map((card, index) => (
                <div key={index} className="black-card-item">
                  <p className="text-xl font-bold">{card.number}  {card.label && (
                    <span 
                      className="px-8 py-1 text-white font-bold rounded-full text-sm"
                      style={{ backgroundColor: card.label ? card.color : "transparent" }}>
                      {card.label}
                    </span>
                  )}
                  </p>
                  <p className="text-sm">{card.destino1}</p>
                  <p className="text-sm">{card.destino2}</p>
                  <p className="text-sm">{card.destino3}</p>
                  <p className="text-sm">{card.destino4}</p>
                </div>
              ))}
            </div>
           </div>
            )}
            </div>      
        ))}
             <input
             type="button"
            name="imprimir" 
            value="Imprimir"
            onClick={() => window.print()}
            className="print-button"
          />   
          <button onClick={toggleBlackCard} className="toggle-black-card-btn">
                {isBlackCardVisible ? "Ocultar " : "Vistas traseras"}
          </button>
           
          
    </div>
  )
}
export default ParadaBus;