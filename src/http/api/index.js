import consts from '../../../config.json'

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
app.use(`/${consts.username}`, capabilities)
app.use(`/${consts.username}`, config)
app.use(`/${consts.username}`, groups)
app.use(`/${consts.username}`, lights)
app.use(`/${consts.username}`, scenes)
app.use(`/${consts.username}`, sensors)
app.use(`/${consts.username}`, resourcelinks)
app.use(`/${consts.username}`, rules)

// global private endpoint
app.get(`/${consts.username}`, (req, res) => res.json(db()))

export default app
