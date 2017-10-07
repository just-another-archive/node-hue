import express from 'express'
import bodyparser from 'body-parser'

import { sensors } from '../../hue'

// TODO: REVIEW AND TEST

const router = express(),
      error  = (message = null) => [{ error: message }]

router.use(bodyparser.urlencoded({ extended: true }))
router.use(bodyparser.json())

// beacon
router.get('/sensors/new', (req, res) => {
  sensors.beacon(2000)
  res.json({ success: { '/sensors': 'Searching for new devices' } })
})

// get all
router.get('/sensors', (req, res) => {
  res.json(sensors.get())
})

// get one
router.get('/sensors/:id', (req, res) => {
  const light = sensors.one(req.params.id)
  res.json(!!light ? light : error())
})


// rename
router.put('/sensors/:id', (req, res) => {
  const success  = sensors.rename(req.params.id, req.body.name),
        route    = req.originalUrl.replace(req.baseUrl, '')

  if (success)
    res.json([{ success: { [`${route}/name`]: req.body.name } }])
  else
    res.json(error())
})

// update state
router.put('/sensors/:id/state', (req, res) => {
  const success  = sensors.state(req.params.id, req.body),
        route    = req.originalUrl.replace(req.baseUrl, '')

  if (!success)
    return res.json(error())

  const response = Object.keys(req.body).reduce((object, key) => {
          object[`${req.route.path}/${key}`] = req.body[key]
          return object
        }, {})

  res.json([{ success: response }])
})

// delete
router.delete('/sensors/:id', (req, res) => {
  const success = sensors.delete(req.params.id)

  if (success)
    res.json([{ success: `/${req.params.id} deleted` }])
  else
    res.json(error())
})

export default router