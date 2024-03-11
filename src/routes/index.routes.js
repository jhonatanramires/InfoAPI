import { Router } from "express"
import { getData } from "../libs/getData.js"
import getNuevaEps from "../controllers/nuevaEps.js"
import getSisben from "../controllers/sisben.js"
import { nuevaepsDocTypes, sisbenDocTypes } from "../libs/constans.js" 

const router = Router()

router.get('/',(req,res)=> {
  res.send("hello world")
})

router.get('/info/:document/:type', async (req,res)=>{
  console.log("from IndexRoutes: ",req.params)
  var data = {}
  try{
    data = await getData(req.params.document,req.params.type)
    res.status(200).json(data)
  } catch (err){
    res.status(500).json({err: err})
  }
})

router.get('/info/nuevaeps/:document/:type', async (req,res)=>{
  console.log("from IndexRoutes: ",req.params)
  var data = {}
  try {
    data = await getNuevaEps(req.params.document,nuevaepsDocTypes[req.params.type])
    res.status(200).json(data)
  } catch(err) {
    res.status(500).json({err: err, nuevaeps: false})
  }
})

router.get('/info/sisben/:document/:type', async (req,res)=>{
  console.log("from IndexRoutes: ",req.params)
  const data = await getSisben(req.params.document,sisbenDocTypes[req.params.type])
  console.log(data)
  res.status(200).json(data)
})

export default router