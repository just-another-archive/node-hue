import express from 'express'
import bodyparser from 'body-parser'

import { schedules } from '../../hue'

// TODO: REVIEW AND TEST

const router = express(),
      error  = (message = null) => [{ error: message }]

router.use(bodyparser.urlencoded({ extended: true }))
router.use(bodyparser.json())

// get all
router.get('/schedules', (req, res) => {
  res.json(schedules.get())
})

// get one
router.get('/schedules/:id', (req, res) => {
  const schedule = schedules.one(req.params.id)
  res.json(!!schedule ? schedule : error())
})

// create
router.post('/schedules', (req, res) => {
  const id = schedules.create(req.body)

  if (id)
    res.json([{ success: { id } }])
  else
    res.json(error())
})

// update
router.put('/schedules/:id', (req, res) => {
  const success  = schedules.update(req.params.id, req.body),
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
router.delete('/schedules/:id', (req, res) => {
  const success = schedules.delete(req.params.id)

  if (success)
    res.json([{ success: `/${req.params.id} deleted` }])
  else
    res.json(error())
})

export default router