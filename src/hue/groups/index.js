import model from './model'

import { lights, scenes } from '../'

const uid = db => (
  (db.keys().length | 0) + 1
)

export default db => ({
  get: () => db.value(),
  one: id => {
    if (id === '0')
      return Object.assign({}, model, {
        name: 'Group 0',
        type: 'LightGroup',
        lights: Object.keys(lights.get())
      })

    return db.get(id).value()
  },

  create: data => {
    const id = uid(db)

    db.set(id, Object.assign({}, model, data))
      .write()

    return id
  },

  update: (id, data) => {
    if (!db.has(id).value())
      return false

    db.get(id)
      .assign(data)
      .write()

    return true
  },

  action: (id, state) => {
    if (id !== '0' && !db.has(id).value())
      return false

    const group = id !== '0'
                ? db.get(id).value().lights
                : Object.keys(lights.get())

    const states = ('scene' in state)
                 ? scenes.one(state.scene).lightstates
                 : group.reduce((object, key) => { object[key] = state; return object }, {})

    // TODO: make it a sequence
    return Promise.all(
      group.map(light_id => lights.state(light_id, states[light_id]))
    )
  },

  delete: id => {
    if (!db.has(id).value())
      return false

    db.unset(id)
      .write()

    return id
  }
})