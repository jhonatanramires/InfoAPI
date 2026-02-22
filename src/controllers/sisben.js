import puppeteer from 'puppeteer';
import { DocTypes } from '../libs/constans.js';

const getSisben = async (document, type) => {
  console.log("from getSisben: ", document, type);
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--disable-setuid-sandbox", "--no-sandbox", "--single-process", "--no-zygote"],
    executablePath: process.env.NODE_ENV === "production"
      ? process.env.PUPPETEER_EXECUTABLE_PATH
      : puppeteer.executablePath(),
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
  await page.setViewport({ width: 717, height: 598 });

  let response = { sisbenGrade: false, sisben: false };

  try {
    await page.goto('https://reportes.sisben.gov.co/dnp_sisbenconsulta', { waitUntil: 'networkidle0' });

    const typesToTry = type !== undefined ? [type] : DocTypes;

    for (const currentType of typesToTry) {
      // Recargar la página para cada intento (para evitar estado sucio)
      await page.goto('https://reportes.sisben.gov.co/dnp_sisbenconsulta', { waitUntil: 'networkidle0' });

      // Seleccionar tipo de documento
      await page.select('#TipoID', currentType);
      // Escribir número de documento
      await page.type('#documento', document);

      // Enviar formulario y esperar navegación
      try {
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'networkidle0' }),
          page.click('#botonenvio')
        ]);
      } catch (navError) {
        console.error('Error en navegación:', navError);
        // Podrías analizar el contenido de la página para saber si es 400
        const content = await page.content();
        console.log(content.substring(0, 500)); // Ver mensaje de error
        continue; // Siguiente tipo
      }

      // Verificar si la consulta fue exitosa (depende del DOM resultante)
      try {
        const grade = await page.$eval('body > div.container > main > div > div.card.border.border-0 > div:nth-child(3) > div > div.col-md-3.imagenpuntaje.border.border-0 > div:nth-child(3) > div > p', el => el.innerText);
        response = { sisbenGrade: grade, sisben: true };
        break; // Éxito, salir del bucle
      } catch (evalError) {
        // No se encontró el selector (probablemente no hay datos)
        response = { sisben: false, sisbenGrade: false };
        // Continuar con el siguiente tipo
      }
    }
  } catch (error) {
    console.error('Error general:', error);
  } finally {
    await browser.close();
  }

  console.log("from getSisben: ", response);
  return response;
};

export default getSisben;