import config from '../../../config.json'
import get_ntw from '../../../lib/get_ntw'

import express from 'express'

const ntw = get_ntw(),
      app = express()

// set up views folder
app.set('views', `${__dirname}/views`)

// routes
app.get('/description.xml', (req, res) => {
  res.set('Content-Type', 'text/xml')
  res.render('description', {
    ip    : `${ntw.address}:80` ,
    uuid  : config.uuid,
    serial: ntw.mac.replace(/:/g, ''),
  })
})

export default app
