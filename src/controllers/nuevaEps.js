import crypto from 'crypto';
import https from 'https';
import axios from 'axios';

const allowLegacyRenegotiationforNodeJsOptions = {
 httpsAgent: new https.Agent({

 secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
 }),
};
const getNuevaEps = async (document,type,full) => {
  if (full === "true"){
    full = true
  }else{
    full = false
  }
  console.log("from getNuevaEps: ",document,type,"full: ",full)
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
    if (full) {
      return { portalNuevaeps:{...data.data.consultaAfiliado.afiliado} }
    } else {
      const { estadoAfiDescripcion, tipoCotizanteDescp, nombreEPS } = data.data.consultaAfiliado.afiliado
      return { portalNuevaeps:{ estadoAfiDescripcion, tipoCotizanteDescp, nombreEPS, nuevaeps: true } }
    }
  } catch (err) {
    console.log("from getNuevaEps: ",err)
    return { nuevaeps: false }
  }
  
}

export default getNuevaEps