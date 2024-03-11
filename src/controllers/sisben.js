import puppeteer from 'puppeteer';
import { DocTypes } from '../libs/constans.js';

const getSisben = async (document,type) => {
  console.log("from getSisben: ", document,type)
  const browser = await puppeteer.launch({
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });
  console.log("from getSisben: ",browser)
  const page = await browser.newPage();
  var response = {
    sisbenGrade: false,
    sisben: false
  }
  await page.setViewport({
    width: 717,
    height: 598
  });
  await page.goto('https://reportes.sisben.gov.co/dnp_sisbenconsulta');
  if (type !== undefined){
    await page.click('#TipoID');
    await page.select('#TipoID', type); 
    await page.click('#documento'); 
    await page.type('#documento', document); 
    await page.click('#botonenvio'); 
    await page.waitForSelector("body > div.container > main > div")
    response = await page.evaluate(async () => {
      try {
        return { sisbenGrade: await document.querySelector('body > div.container > main > div > div.card.border.border-0 > div:nth-child(3) > div > div.col-md-3.imagenpuntaje.border.border-0 > div:nth-child(3) > div > p').innerText, sisben: true}
      } catch(err) {
        console.log(err)
        return { sisben: false, sisbenGrade: false }
      }
    });
  } else {
    for (const types of DocTypes) {
      await page.click('#TipoID');
      await page.select('#TipoID', types); 
      await page.click('#documento'); 
      await page.type('#documento', document); 
      await page.click('#botonenvio');
      await page.waitForSelector("body > div.container > main > div")
      response = await page.evaluate(async () => {
        try {
          return { sisbenGrade: await document.querySelector('body > div.container > main > div > div.card.border.border-0 > div:nth-child(3) > div > div.col-md-3.imagenpuntaje.border.border-0 > div:nth-child(3) > div > p').innerText, sisben: true}
        } catch(err) {
          console.log(err)
          return { sisben: false, sisbenGrade: false }
        }
      });
      if (response.sisbenGrade !== false){
        break
      }
    }
  }
  
  await browser.close();

  console.log("from getSisben: ", response)

  return response
};

export default getSisben