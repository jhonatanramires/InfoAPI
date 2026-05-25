import { logger } from "./logs.js";

export async function genDelay(ms) {
  // Genera un delay minimo para evitar bloqueo si se hacen las dos peticiones seguidas 
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  logger.info('Esperando:',ms,"ms")
  await delay(ms);
}