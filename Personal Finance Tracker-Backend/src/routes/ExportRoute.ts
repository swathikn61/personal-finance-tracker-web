import express from 'express'
import { ExportController } from '../controller/ExportController'
import { authMiddleware } from '../middleware/AuthMiddleware'
import rateLimit from 'express-rate-limit'

const Router=express.Router()

const exportLimiter=rateLimit({
    windowMs:60*60*1000,
    max:10,
    message:{message:"Too many exports, please try again later"},
    standardHeaders:true,
    legacyHeaders:false,
})

Router.get('/',authMiddleware,exportLimiter,ExportController.exportEntriesToCSV)

export default Router