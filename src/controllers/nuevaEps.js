import crypto from 'crypto';
import https from 'https';
import axios from 'axios';

const allowLegacyRenegotiationforNodeJsOptions = {
 httpsAgent: new https.Agent({

 secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
 }),
};
const getNuevaEps = async (document,type) => {
  console.log("from getNuevaEps: ",document,type)
  const url = `https://solucionjb.nuevaeps.com.co/consultasportalw-back-1.0.0/service/afiliado/consulta?tipoIdentificacion=${type}&numIdentificacion=${document}`
  console.log("from getNuevaEps: ",url)
  const data = await axios({
  ...allowLegacyRenegotiationforNodeJsOptions,
  url,
  headers: {
  Accept: 'application/json',
  'Content-Type': 'application/json',
  },
  method: 'GET'
  })
  try{
    const { estadoAfiDescripcion, tipoCotizanteDescp, nombreEPS } = data.data.consultaAfiliado.afiliado
    return { estadoAfiDescripcion, tipoCotizanteDescp, nombreEPS, nuevaeps: true }
  } catch (err) {
    console.log("from getNuevaEps: ",err)
    return { nuevaeps: false }
  }
  
}

export default getNuevaEps