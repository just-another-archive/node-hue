import LwDB  from 'lowdb'
import Sync from 'lowdb/adapters/FileSync'

import model from './model'

// setup db
const _db = LwDB(
  new Sync('hue.json', { defaultValue: model })
)

_db.read()   // load db file
_db.write()  // in case of default, rewrite it

// global endpoint
export const db = () => _db.getState()

// setup endpoints
import _capabilities from './capabilities'
export const capabilities = _capabilities()

import _config from './config'
export const config = _config(_db.get('config'))

import _groups from './groups'
export const groups = _groups(_db.get('groups'))

import _lights from './lights'
export const lights = _lights(_db.get('lights'))

import _resourcelinks from './resourcelinks'
export const resourcelinks = _resourcelinks(_db.get('resourcelinks'))

import _rules from './rules'
export const rules = _rules(_db.get('rules'))

import _schedules from './schedules'
export const schedules = _schedules(_db.get('schedules'))

import _scenes from './scenes'
export const scenes = _scenes(_db.get('scenes'))

import _sensors from './sensors'
export const sensors = _sensors(_db.get('sensors'))