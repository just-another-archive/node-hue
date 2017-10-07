import express from 'express'
import bodyparser from 'body-parser'

import { config } from '../../hue'

const router = express(),
      error  = (message = null) => [{ error: message }]

router.use(bodyparser.urlencoded({ extended: true }))
router.use(bodyparser.json())

// get all
router.get('/config', (req, res) => {
  res.json(config.get())
})

// update
router.put('/config', (req, res) => {
  const success  = config.update(req.body)

  const route    = req.originalUrl.replace(req.baseUrl, ''),
        response = Object.keys(req.body).reduce((object, key) => {
          object[`${route}/${key}`] = req.body[key]
          return object
        }, {})

  if (success)
    res.json([{ success: response }])
  else
    res.json(error())
})

// delete
router.delete('/config/whitelist/:userid', (req, res) => {
  const success = config.remove(req.params.userid)

  if (success)
    res.json([{ success: `/${req.params.userid} deleted` }])
  else
    res.json(error())
})

export default router