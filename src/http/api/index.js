import CONFIG from '../../../config.json'

import express from 'express'
import bodyparser from 'body-parser'

import unrestricted  from './unrestricted'
import capabilities  from './capabilities'
import config        from './config'
import groups        from './groups'
import lights        from './lights'
import scenes        from './scenes'
import schedules     from './schedules'
import sensors       from './sensors'
import resourcelinks from './resourcelinks'
import rules         from './rules'


import { db } from '../../hue'


const app = express()

// setup
app.set('views', `${__dirname}/views`)
app.set('view engine', 'hbs')

// public middlewares
app.use('/', unrestricted)

// private middlewares
app.use(`/${CONFIG.username}`, capabilities)
app.use(`/${CONFIG.username}`, config)
app.use(`/${CONFIG.username}`, groups)
app.use(`/${CONFIG.username}`, lights)
app.use(`/${config.username}`, scenes)
app.use(`/${config.username}`, sensors)
app.use(`/${config.username}`, resourcelinks)
app.use(`/${config.username}`, rules)

// global private endpoint
app.get(`/${CONFIG.username}`, (req, res) => res.json(db()))

export default app
