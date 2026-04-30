// 1. First, import cheerio. Using the ESM syntax is the modern standard.
import * as cheerio from 'cheerio';

/**
 * Extrae toda la información relevante del HTML de consulta del Sisbén IV
 * @param {string} html - El HTML de la página de resultados
 * @returns {object} - Objeto con los datos estructurados
 */

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function ejemplo() {
  console.log('Esperando...');
  await delay(5);
  console.log('Listo después de 5 segundos');
}

function extraerDatosSisben(html) {
    const $ = cheerio.load(html);

    // 1. COMPROBACIÓN DE "NO ENCONTRADO"
    // Buscamos si existe la imagen de error o si el texto del script contiene el mensaje de no existencia
    const scriptText = $('script').text();
    const imagenError = $('img[src*="mensaje 2-0.png"]').length > 0;
    const noExisteEnBase = scriptText.includes('NO" se encuentra en la base del Sisbén IV') || imagenError;

    if (noExisteEnBase) {
        return {
            estadoRegistro: "No se encuentra en la base del Sisbén IV",
            fechaConsulta: "N/A",
            ficha: "N/A",
            categoria: {
                sisbenGrade: "Sin Categoría",
                descripcion: "El ciudadano no registra encuesta vigente"
            },
            datosPersonales: {
                nombres: "No encontrado",
                apellidos: "No encontrado",
                tipoDocumento: $('#TipoID option:selected').text().trim() || "N/A",
                numeroDocumento: $('#documento').val() || "N/A",
                municipio: "N/A",
                departamento: "N/A"
            },
            informacionAdministrativa: {
                encuestaVigente: "No",
                ultimaActualizacionCiudadano: "N/A",
                ultimaActualizacionRegistros: "N/A"
            }
        };
    }

    // 2. LÓGICA ORIGINAL (Si el ciudadano SI existe)
    
    // Estado del registro
    const registroValido = $('.valido').text().trim();

    // Información principal
    const fechaConsulta = $('.etiqueta:contains("Fecha de consulta:")').next('.campo1').text().trim();
    const ficha = $('.etiqueta:contains("Ficha:")').next('.campo1').text().trim();

    // Categoría y descripción
    const categoria = $('.imagenpuntaje .font-weight-bold[style*="font-size:42px"]').text().trim();
    const descripcionCategoria = $('.imagenpuntaje .text-center.font-weight-bold[style*="font-size:18px"]').text().trim();

    // Datos personales
    const nombres = $('.etiqueta1:contains("Nombres:")').closest('.row').find('.campo1').text().trim().replace(/\s+/g, ' ');
    const apellidos = $('.etiqueta1:contains("Apellidos:")').closest('.row').find('.campo1').text().trim().replace(/\s+/g, ' ');
    const tipoDocumentoTexto = $('.etiqueta1:contains("Tipo de documento:")').closest('.row').find('.campo1').text().trim();
    const numeroDocumentoPersonal = $('.etiqueta1:contains("Número de documento:")').closest('.row').find('.campo1').text().trim();
    const municipio = $('.etiqueta1:contains("Municipio:")').closest('.row').find('.campo1').text().trim();
    const departamento = $('.etiqueta1:contains("Departamento:")').closest('.row').find('.campo1').text().trim();

    // Información administrativa
    const encuestaVigente = $('.etiqueta:contains("Encuesta vigente:")').next('.campo1').text().trim();
    const ultimaActualizacionCiudadano = $('.etiqueta:contains("Última actualización ciudadano:")').next('.campo1').text().trim();
    const ultimaActualizacionRegistros = $('.etiqueta:contains("Última actualización via registros administrativos:")').next('.campo1').text().trim();

    return {
        estadoRegistro: registroValido || "Registro encontrado",
        fechaConsulta,
        ficha,
        categoria: {
            sisbenGrade: categoria,
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
        }
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

const getSisben = async (document,type)=>{
    console.log("from getSisben: ", document,type)
    const url = "https://reportes.sisben.gov.co/dnp_sisbenconsulta"
    const { token, cookie } = await fetchPageAndGetToken(url);

    const tipo = type
    const documento = document

    await ejemplo()

    const body = `------WebKitFormBoundaryy7hX9d7B9BFpcyqc\r\nContent-Disposition: form-data; name=\"TipoID\"\r\n\r\n${tipo}\r\n------WebKitFormBoundaryy7hX9d7B9BFpcyqc\r\nContent-Disposition: form-data; name=\"documento\"\r\n\r\n${documento}\r\n------WebKitFormBoundaryy7hX9d7B9BFpcyqc\r\nContent-Disposition: form-data; name=\"__RequestVerificationToken\"\r\n\r\n${token}\r\n------WebKitFormBoundaryy7hX9d7B9BFpcyqc--\r\n`

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
    console.log("from getSisben: ",JSON.stringify(datos, null, 2));

    return datos
}

export default getSisben;