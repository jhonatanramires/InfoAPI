import getSisben from '../controllers/sisben.js'
import getNuevaEps from '../controllers/nuevaEps.js'

import { sisbenDocTypes } from './constans.js'
import { nuevaepsDocTypes } from './constans.js'

export const getData = async (document,type,full) => {
  const nuevaepsData = await getNuevaEps(document,nuevaepsDocTypes[type],full)
  console.log(nuevaepsData)
  const sisbenData = await getSisben(document,sisbenDocTypes[type])
  return {...sisbenData,...nuevaepsData}
}