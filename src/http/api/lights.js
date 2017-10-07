import express from 'express'
import bodyparser from 'body-parser'

import { lights } from '../../hue'

const router = express(),
      error  = (message = null) => [{ error: message }]

router.use(bodyparser.urlencoded({ extended: true }))
router.use(bodyparser.json())

// beacon
router.get('/lights/new', (req, res) => {
  lights.beacon(2000)
  res.json({ success: { '/lights': 'Searching for new devices' } })
})

// get all
router.get('/lights', (req, res) => {
  res.json(lights.get())
})

// get one
router.get('/lights/:id', (req, res) => {
  const light = lights.one(req.params.id)
  res.json(!!light ? light : error())
})


// rename
router.put('/lights/:id', (req, res) => {
  const success  = lights.rename(req.params.id, req.body.name),
        route    = req.originalUrl.replace(req.baseUrl, '')

  if (success)
    res.json([{ success: { [`${route}/name`]: req.body.name } }])
  else
    res.json(error())
})

// update state
router.put('/lights/:id/state', (req, res) => {
  const route = req.originalUrl.replace(req.baseUrl, '')

  lights
    .state(req.params.id, req.body)
    .then(success => {
      if (!success)
        return res.json(error())

      const response = Object.keys(req.body).reduce((object, key) => {
              object[`${req.route.path}/${key}`] = req.body[key]
              return object
            }, {})

      res.json([{ success: response }])
    })
    .catch(() => res.json(error()))
})

// delete
router.delete('/lights/:id', (req, res) => {
  lights
    .delete(req.params.id)
    .then(success => {
      if (success)
        res.json([{ success: `/${req.params.id} deleted` }])
      else
        res.json(error())
    })
    .catch(() => res.json(error()))
})

export default router