// webserver
import express from 'express'
import morgan from 'morgan'
import bodyparser from 'body-parser'
import hbs from 'express-handlebars'

// middlewares
import upnp from './upnp'
import api from './api'


const app = express()

// system middleware
app.use(morgan('combined'))
app.use(bodyparser.urlencoded({ extended: true }))
app.use(bodyparser.json())

// templating engine
app.engine('hbs', hbs())
app.set('views', `${__dirname}/views`)
app.set('view engine', 'hbs')

// middlewares
app.use('/', upnp)
app.use('/api', api)

export default {
  start: () => app.listen(80),
  stop : () => {} // app.close() (throws error, weirdly)
}


