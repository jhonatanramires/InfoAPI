import { gotScraping } from 'got-scraping';
import { nuevaepsDocTypes } from "../libs/constans.js";
import { logger } from '../libs/logs.js';

const getNuevaEps = async (document, type, full) => {
  const isFull = full === "true" || full === true;
  logger.info(`full: ${isFull}`);
  
  const tipo = nuevaepsDocTypes[type]; 
  logger.info(`documento recibido: ${document}, tipo recibido: ${type}, tipo procesado: ${tipo}`);
  
  const url = `https://solucionjb.nuevaeps.com.co/consultasportalw-back-1.0.0/service/afiliado/consulta?tipoIdentificacion=${tipo}&numIdentificacion=${document}`;
  logger.info(`url: ${url}`);
  
  try {
    // got-scraping negocia automáticamente HTTP/2 y emula la huella TLS (JA3) de un navegador
    const response = await gotScraping({
      url,
      method: 'GET',
      // Le pedimos a la librería que genere cabeceras idénticas a un Chrome en Windows
      headerGeneratorOptions: {
        browsers: [{ name: 'chrome', minVersion: 120 }],
        devices: ['desktop'],
        operatingSystems: ['windows']
      }
    });

    // Parseamos la respuesta manualmente (es más seguro por si Cloudflare devuelve HTML en vez de JSON)
    const apiData = JSON.parse(response.body);

    logger.debug(apiData)

    if (isFull) {
      return { portalNuevaeps: { ...apiData.consultaAfiliado.afiliado } };
    } else {
      const { estadoAfiDescripcion, tipoCotizanteDescp, nombreEPS } = apiData.consultaAfiliado.afiliado;
      return { portalNuevaeps: { estadoAfiDescripcion, tipoCotizanteDescp, nombreEPS, nuevaeps: true } };
    }

  } catch (err) {
    logger.error(`from getNuevaEps: ${err.message}`);
    
    // got-scraping almacena la respuesta del servidor en err.response
    if (err.response && err.response.body) {
      const errorBody = typeof err.response.body === 'string' 
        ? err.response.body.substring(0, 400) 
        : JSON.stringify(err.response.body).substring(0, 400);
      
      logger.error(`Detalle del bloqueo del servidor: ${errorBody}`);
    }
    
    return { portalNuevaeps: { nuevaeps: false } };
  }
}

export default getNuevaEps;