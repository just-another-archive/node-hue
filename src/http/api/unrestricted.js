import CONFIG  from '../../../config.json'
import express from 'express'

import { config } from '../../hue'

const PUBLIC = [
  'name',
  'datastoreversion',
  'swversion',
  'apiversion',
  'mac',
  'bridgeid',
  'factorynew',
  'replacesbridgeid',
  'modelid',
  'starterkitid',
]

const router = express(),
      error  = (message = null) => [{ error: message }]

// discovery
router.get('/nouser/config', (req, res) => {
  const data = config.get()

  // only keep public properties
  res.json(
    Object.keys(data).reduce((object, key) => {
      if (PUBLIC.indexOf(key) !== -1)
        object[key] = data[key]

      return object
    }, {})
  )
})

// registering client
router.post('/', (req, res) => {
  res.json([{ success: { username: CONFIG.username } }])
})

export default router