import express from 'express'
import bodyparser from 'body-parser'

import { rules } from '../../hue'

// TODO: REVIEW AND TEST

const router = express(),
      error  = (message = null) => [{ error: message }]

router.use(bodyparser.urlencoded({ extended: true }))
router.use(bodyparser.json())

// get all
router.get('/rules', (req, res) => {
  res.json(rules.get())
})

// get one
router.get('/rules/:id', (req, res) => {
  const rule = rules.one(req.params.id)
  res.json(!!rule ? rule : error())
})

// create
router.post('/rules', (req, res) => {
  const id = rules.create(req.body)

  if (id)
    res.json([{ success: { id } }])
  else
    res.json(error())
})

// update
router.put('/rules/:id', (req, res) => {
  const success  = rules.update(req.params.id, req.body),
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
router.delete('/rules/:id', (req, res) => {
  const success = rules.delete(req.params.id)

  if (success)
    res.json([{ success: `/${req.params.id} deleted` }])
  else
    res.json(error())
})

export default router