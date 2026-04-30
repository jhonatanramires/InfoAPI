// 1. First, import cheerio. Using the ESM syntax is the modern standard.
import * as cheerio from 'cheerio';


/**
 * Extrae toda la información relevante del HTML de consulta del Sisbén IV
 * @param {string} html - El HTML de la página de resultados
 * @returns {object} - Objeto con los datos estructurados
 */
function extraerDatosSisben(html) {
    const $ = cheerio.load(html);

    // 1. Token CSRF (del formulario)
    const token = $('input[name="__RequestVerificationToken"]').val();

    // 2. Datos del formulario de búsqueda (valores por defecto o seleccionados)
    const tipoDocumentoSeleccionado = $('#TipoID option:selected').text().trim();
    const tipoDocumentoValor = $('#TipoID').val();
    const numeroDocumento = $('#documento').val();

    // 3. Estado del registro (válido/no válido)
    const registroValido = $('.valido').text().trim(); // "Registro válido"

    // 4. Información principal de la tarjeta
    const fechaConsulta = $('.etiqueta:contains("Fecha de consulta:")').next('.campo1').text().trim();
    const ficha = $('.etiqueta:contains("Ficha:")').next('.campo1').text().trim();

    // 5. Categoría y descripción (dentro del div con clase "imagenpuntaje")
    const categoria = $('.imagenpuntaje .font-weight-bold[style*="font-size:42px"]').text().trim();
    const descripcionCategoria = $('.imagenpuntaje .text-center.font-weight-bold[style*="font-size:18px"]').text().trim();

    // 6. Datos personales (dentro del bloque "DATOS PERSONALES")
    const nombres = $('.etiqueta1:contains("Nombres:")').closest('.row').find('.campo1').text().trim().replace(/\s+/g, ' ');
    const apellidos = $('.etiqueta1:contains("Apellidos:")').closest('.row').find('.campo1').text().trim().replace(/\s+/g, ' ');
    const tipoDocumentoTexto = $('.etiqueta1:contains("Tipo de documento:")').closest('.row').find('.campo1').text().trim();
    const numeroDocumentoPersonal = $('.etiqueta1:contains("Número de documento:")').closest('.row').find('.campo1').text().trim();
    const municipio = $('.etiqueta1:contains("Municipio:")').closest('.row').find('.campo1').text().trim();
    const departamento = $('.etiqueta1:contains("Departamento:")').closest('.row').find('.campo1').text().trim();

    // 7. Información administrativa
    const encuestaVigente = $('.etiqueta:contains("Encuesta vigente:")').next('.campo1').text().trim();
    const ultimaActualizacionCiudadano = $('.etiqueta:contains("Última actualización ciudadano:")').next('.campo1').text().trim();
    const ultimaActualizacionRegistros = $('.etiqueta:contains("Última actualización via registros administrativos:")').next('.campo1').text().trim();

    // 8. Contacto oficina Sisbén
    const nombreAdministrador = $('.etiqueta:contains("Nombre administrador:")').next('.font-weight-bold').text().trim();
    const direccion = $('.etiqueta:contains("Dirección:")').next('.font-weight-bold').text().trim();
    const telefono = $('.etiqueta:contains("Teléfono:")').next('.font-weight-bold').text().trim();
    const correo = $('.etiqueta:contains("Correo Electrónico:")').next('.font-weight-bold').text().trim();

    // 9. Nota de actualización (texto completo del alert)
    const notaActualizacion = $('.alert-warning').text().trim().replace(/\s+/g, ' ');

    // 10. Entidades que actualizan la información (lista)
    const entidades = [];
    $('.alert-warning .row .col-md-6 p').each((i, el) => {
        const texto = $(el).html();
        if (texto) {
            const items = texto.split('<br>').map(line => line.replace('•', '').trim()).filter(l => l);
            entidades.push(...items);
        }
    });

    // 11. Footer y otros textos opcionales
    const footerTexto = $('footer .container').text().trim();

    // Retornar objeto estructurado
    return {
        token,
        formularioBusqueda: {
            tipoDocumento: tipoDocumentoTexto || tipoDocumentoSeleccionado,
            tipoDocumentoValor: tipoDocumentoValor,
            numeroDocumento: numeroDocumento
        },
        estadoRegistro: registroValido,
        fechaConsulta,
        ficha,
        categoria: {
            letra: categoria,
            descripcion: descripcionCategoria
        },
        datosPersonales: {
            nombres,
            apellidos,
            tipoDocumento: tipoDocumentoTexto,
            numeroDocumento: numeroDocumentoPersonal,
            municipio,
            departamento
        },
        informacionAdministrativa: {
            encuestaVigente,
            ultimaActualizacionCiudadano,
            ultimaActualizacionRegistros
        },
        contactoOficina: {
            nombreAdministrador,
            direccion,
            telefono,
            correo
        },
        notaActualizacion,
        entidadesActualizacion: entidades,
        footer: footerTexto
    };
}

async function fetchPageAndGetToken(url) {
    try {
        // 2. Perform the network request.
        //    Note: The 'cookie' header is NOT automatically set on subsequent requests.
        //    You'll need to manually store and forward cookie values if needed.
        const getRes = await fetch(url);
        if (!getRes.ok) {
            throw new Error(`GET falló con status ${getRes.status}`);
        }

        // 3. Extract and store cookie from the response headers.
        const setCookie = getRes.headers.get('set-cookie');
        const cookieValue = setCookie ? setCookie.split(';')[0] : null;
        console.log('Cookie obtenida:', cookieValue);

        // 4. Get the raw HTML content.
        const html = await getRes.text();

        // 5. *** This is the core change: Replace JSDOM with Cheerio. ***
        //    cheerio.load() takes an HTML string and returns a `$` selector function.
        const $ = cheerio.load(html);
        
        // 6. Define the selector for the anti-forgery token.
        //    Using a more specific selector prevents collisions on the page.
        const tokenSelector = 'input[name="__RequestVerificationToken"]';
        
        // 7. Extract the token value using Cheerio's `.val()` method[reference:2][reference:3].
        const token = $(tokenSelector).val();
        
        if (!token) {
            throw new Error(`No se encontró el token con el selector: ${tokenSelector}`);
        }
        
        console.log('Token CSRF obtenido:', token);
        
        // 8. Return the results or use them for further processing.
        return { token, cookie: cookieValue };
        
    } catch (error) {
        console.error('Error durante el scraping:', error.message);
        throw error;
    }
}

const url = "https://reportes.sisben.gov.co/dnp_sisbenconsulta"
const { token, cookie } = await fetchPageAndGetToken(url);

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const tipo = 3
const documento = 1007206741


const body = `------WebKitFormBoundaryy7hX9d7B9BFpcyqc\r\nContent-Disposition: form-data; name=\"TipoID\"\r\n\r\n${tipo}\r\n------WebKitFormBoundaryy7hX9d7B9BFpcyqc\r\nContent-Disposition: form-data; name=\"documento\"\r\n\r\n${documento}\r\n------WebKitFormBoundaryy7hX9d7B9BFpcyqc\r\nContent-Disposition: form-data; name=\"__RequestVerificationToken\"\r\n\r\n${token}\r\n------WebKitFormBoundaryy7hX9d7B9BFpcyqc--\r\n`

console.log(body)

async function ejemplo() {
  console.log('Esperando...');
  await delay(0);
  console.log('Listo después de 5 segundos');
}

await ejemplo()

const postRes2 = await fetch(url, {
  "headers": {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "accept-language": "es-419,es;q=0.9",
    "cache-control": "max-age=0",
    "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryy7hX9d7B9BFpcyqc",
    "sec-ch-ua": "\"Google Chrome\";v=\"147\", \"Not.A/Brand\";v=\"8\", \"Chromium\";v=\"147\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "same-origin",
    "sec-fetch-user": "?1",
    "upgrade-insecure-requests": "1",
    "cookie": cookie,
    "Referer": "https://reportes.sisben.gov.co/dnp_sisbenconsulta"
  },
  "body": body,
  "method": "POST"
});

console.log(postRes2.status);
const response = await postRes2.text()
// Ejemplo de uso:
const datos = extraerDatosSisben(response);
console.log(JSON.stringify(datos, null, 2));