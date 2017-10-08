import express from 'express'
import bodyparser from 'body-parser'

import { groups } from '../../hue'

const router = express(),
      error  = (message = null) => [{ error: message }]


router.use(bodyparser.urlencoded({ extended: true }))
router.use(bodyparser.json())

// get all
router.get('/groups', (req, res) => {
  res.json(groups.get())
})

// get one
router.get('/groups/:id', (req, res) => {
  const group = groups.one(req.params.id)
  res.json(!!group ? group : error())
})

// create
router.post('/groups', (req, res) => {
  const id = groups.create(req.body)

  if (id)
    res.json([{ success: { id } }])
  else
    res.json(error())
})

// update
router.put('/groups/:id', (req, res) => {
  const success  = groups.update(req.params.id, req.body),
        route    = req.originalUrl.replace(req.baseUrl, '')

  if (!success)
    return res.json(error())

  const response = Object.keys(req.body).reduce((object, key) => {
          object[`${route}/${key}`] = req.body[key]
          return object
        }, {})

        res.json([{ success: response }])
})

// action
router.put('/groups/:id/action', (req, res) => {
  const success  = groups.action(req.params.id, req.body),
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
router.delete('/groups/:id', (req, res) => {
  const success = groups.delete(req.params.id)

  if (success)
    res.json([{ success: `/${req.params.id} deleted` }])
  else
    res.json(error())
})

export default router