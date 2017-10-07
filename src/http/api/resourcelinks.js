import express from 'express'
import bodyparser from 'body-parser'

import { resourcelinks } from '../../hue'

// TODO: REVIEW AND TEST

const router = express(),
      error  = (message = null) => [{ error: message }]

router.use(bodyparser.urlencoded({ extended: true }))
router.use(bodyparser.json())

// get all
router.get('/resourcelinks', (req, res) => {
  res.json(resourcelinks.get())
})

// get one
router.get('/resourcelinks/:id', (req, res) => {
  const resourcelink = resourcelinks.one(req.params.id)
  res.json(!!resourcelink ? resourcelink : error())
})

// create
router.post('/resourcelinks', (req, res) => {
  const id = resourcelinks.create(req.body)

  if (id)
    res.json([{ success: { id } }])
  else
    res.json(error())
})

// update
router.put('/resourcelinks/:id', (req, res) => {
  const success  = resourcelinks.update(req.params.id, req.body),
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
router.delete('/resourcelinks/:id', (req, res) => {
  const success = resourcelinks.delete(req.params.id)

  if (success)
    res.json([{ success: `/${req.params.id} deleted` }])
  else
    res.json(error())
})

export default router