import model from './model'

import { lights } from '../'

const uid = db => (
  (db.keys().length | 0) + 1
)

export default db => ({
  get: () => db.value(),
  one: id => db.get(id).value(),

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
    if (!db.has(id).value())
      return false

    const group = db.get(id).value()

    // TODO: make it a sequence
    return Promise.all(
      group.lights.map(light_id => lights.state(light_id, state))
    )

    return true
  },

  delete: id => {
    if (!db.has(id).value())
      return false

    db.unset(id)
      .write()

    return id
  }
})