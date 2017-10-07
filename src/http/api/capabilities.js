import express from 'express'
import bodyparser from 'body-parser'

import { capabilities } from '../../hue'

const router = express(),
      error  = (message = null) => [{ error: message }]

router.use(bodyparser.urlencoded({ extended: true }))
router.use(bodyparser.json())

// get all
router.get('/capabilities', (req, res) => {
  res.json(capabilities())
})

export default router