import getSisben from "../controllers/sisben3.js"
import { nuevaepsDocTypes, sisbenDocTypes } from "../libs/constans.js" 


const data = await getSisben(1007206741,"CC",true)
console.log(data)
