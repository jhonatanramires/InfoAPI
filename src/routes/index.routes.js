import { Router } from "express"
import { getData } from "../libs/getData.js"
import getNuevaEps from "../controllers/nuevaEps.js"
import getSisben from "../controllers/sisben3.js"
import { nuevaepsDocTypes, sisbenDocTypes } from "../libs/constans.js" 

const router = Router()

router.get('/',(req,res)=> {
  res.send("hello world")
})

router.get('/:full/:document/:type', async (req,res)=>{
  console.log("from IndexRoutes: ",req.params)
  var data = {}
  try{
    data = await getData(req.params.document,req.params.type,req.params.full)
    res.status(200).json(data)
  } catch (err){
    res.status(500).json({err: err})
  }
})

router.get('/:full/nuevaeps/:document/:type', async (req,res)=>{
  console.log("from IndexRoutes: ",req.params)
  var data = {}
  try {
    data = await getNuevaEps(req.params.document,nuevaepsDocTypes[req.params.type],req.params.full)
    res.status(200).json(data)
  } catch(err) {
    res.status(500).json({err: err, nuevaeps: false})
  }
})

router.get('/:full/sisben/:document/:type', async (req,res)=>{
  console.log("from IndexRoutes: ",req.params)
  const data = await getSisben(req.params.document,sisbenDocTypes[req.params.type])
  console.log(data)
  if (req.params.full == 1){
    res.status(200).json(data)
  } else {
    res.status(200).json(data.categoria)
  }
})

export default router