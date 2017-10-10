import express from 'express'
import bodyparser from 'body-parser'

import { scenes } from '../../hue'

// TODO: REVIEW AND TEST

const router = express(),
      error  = (message = null) => [{ error: message }]

router.use(bodyparser.urlencoded({ extended: true }))
router.use(bodyparser.json())

// get all
router.get('/scenes', (req, res) => {
  res.json(scenes.get())
})

// get one
router.get('/scenes/:id', (req, res) => {
  const scene = scenes.one(req.params.id)
  res.json(!!scene ? scene : error())
})

// create
router.post('/scenes', (req, res) => {
  const id = scenes.create(req.body)

  if (id)
    res.json([{ success: { id } }])
  else
    res.json(error())
})

// update
router.put('/scenes/:id', (req, res) => {
  const success  = scenes.update(req.params.id, req.body),
        route    = req.originalUrl.replace(req.baseUrl, '')

  if (!success)
    return res.json(error())

  const response = Object.keys(req.body).reduce((object, key) => {
          object[`${route}/${key}`] = req.body[key]
          return object
        }, {})

  res.json([{ success: response }])
})

// update
router.put('/scenes/:id/lightstates/:light', (req, res) => {
  const success  = scenes.lightstate(req.params.id, req.params.light, req.body),
        route    = req.originalUrl.replace(req.baseUrl, '')

  if (!success)
    return res.json(error())

  const response = Object.keys(req.body).reduce((object, key) => {
          object[`${route}/${key}`] = req.body[key]
          return object
        }, {})

  res.json([{ success: response }])
})

// delete
router.delete('/scenes/:id', (req, res) => {
  const success = scenes.delete(req.params.id)

  if (success)
    res.json([{ success: `/${req.params.id} deleted` }])
  else
    res.json(error())
})

export default router