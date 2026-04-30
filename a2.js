import { JSDOM } from 'jsdom';

const url = 'https://reportes.sisben.gov.co/dnp_sisbenconsulta';
const boundary = '----WebKitFormBoundaryaFbM4UQoKLtN6OUn';
const maxAttempts = 10;

for (let attempt = 1; attempt <= maxAttempts; attempt++) {
  console.log(`Intento ${attempt} de ${maxAttempts}...`);

  try {
    // 1. GET para obtener cookie y token nuevos
    const getRes = await fetch(url);
    if (!getRes.ok) throw new Error(`GET falló con status ${getRes.status}`);
    
    const setCookie = getRes.headers.get('set-cookie');
    const cookieValue = setCookie.split(';')[0]; // solo nombre=valor
    console.log(cookieValue)
    const html = await getRes.text();
    const dom = new JSDOM(html);
    const token = dom.window.document.querySelector('input[name="__RequestVerificationToken"]').value;
    console.log(token)

    // 2. Construir body multipart
    const body = `------${boundary}\r\nContent-Disposition: form-data; name="TipoID"\r\n\r\n3\r\n------${boundary}\r\nContent-Disposition: form-data; name="documento"\r\n\r\n1007206741\r\n------${boundary}\r\nContent-Disposition: form-data; name="__RequestVerificationToken"\r\n\r\n${token}\r\n------${boundary}--\r\n`;

    // 3. POST
    const postRes = await fetch(url, {
      method: 'POST',
      headers: {
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'accept-language': 'es-419,es;q=0.9',
        'cache-control': 'max-age=0',
        'content-type': `multipart/form-data; boundary=${boundary}`,
        'cookie': cookieValue,
        'referer': url,
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36'
      },
      body: body
    });

    if (postRes.status === 200) {
      const text = await postRes.text();
      console.log(`✅ Éxito en intento ${attempt}:`);
      console.log(text);
      break; // salir del bucle
    } else {
      console.log(`❌ Status ${postRes.status} - reintentando...`);
    }
  } catch (error) {
    console.error(`Error en intento ${attempt}:`, error.message);
  }

  // Pequeña pausa entre intentos (opcional)
  await new Promise(resolve => setTimeout(resolve, 1000));
}