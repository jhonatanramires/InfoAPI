import puppeteer from 'puppeteer';
import { DocTypes } from '../libs/constans.js';

const getSisben = async (document,type) => {
  console.log("from getSisben: ", document,type)
  var browser = {}
  var page = {}
  try {
    var browser = await puppeteer.launch({
      timeout:100000,
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
  } catch(err) {
    console.log(err)
  }
  var response = {
    sisbenGrade: false,
    sisben: false
  }
  page = await browser.newPage();
  await page.setViewport({
    width: 717,
    height: 598
  });
  if (type !== undefined){
    await page.goto('https://reportes.sisben.gov.co/dnp_sisbenconsulta');
    await page.click('#TipoID');
    await page.select('#TipoID', type); 
    await page.click('#documento'); 
    await page.type('#documento', document); 
    await page.click('#botonenvio'); 
    response = await page.evaluate(() => {
      try {
        return { sisbenGrade: document.querySelector('body > div.container > main > div > div.card.border.border-0 > div:nth-child(3) > div > div.col-md-3.imagenpuntaje.border.border-0 > div:nth-child(3) > div > p').innerText, sisben: true}
      } catch(err) {
        return { sisben: false }
      }
    });
  } else {
    for (const types of DocTypes) {
      await page.goto('https://reportes.sisben.gov.co/dnp_sisbenconsulta');
      await page.click('#TipoID');
      await page.select('#TipoID', types); 
      await page.click('#documento'); 
      await page.type('#documento', document); 
      await page.click('#botonenvio');
      response = await page.evaluate(() => {
        try {
          return response = { sisbenGrade: document.querySelector('body > div.container > main > div > div.card.border.border-0 > div:nth-child(3) > div > div.col-md-3.imagenpuntaje.border.border-0 > div:nth-child(3) > div > p').innerText, sisben: true}
        } catch(err) {
          console.log(err)
          return {
            sisbenGrade: false,
            sisben: false
          }
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