import superagent from 'superagent'
import pubsub from 'pubsub-js'

import model from './model'

const uid = db => (
  db.keys().length + 1
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

  beacon: timeout => {
    const token = pubsub.subscribe('discovery:sensor', (event, data) => {
      // call-in for linkage
      const adapter = adapters(data.adapter)

      return adapter
        .link(data)
        .then(nodehue => {
          if (nodehue === false)
            return false

          db.set(uid(db), Object.assign({}, model, { nodehue }))
            .write()

          return true
        })
        .catch(() => false)
    })

    setTimeout(() => pubsub.unsubscribe(token), timeout)
  },

  rename: (id, { name }) => {
    if (!db.has(id).value())
      return false

    db.get(id)
      .assign({ name })
      .write()

    return true
  },

  state: (id, data) => {
    if (!db.has(id).value())
      return false

    // todo

    return true
  },

  delete: id => {
    if (!db.has(id).value())
      return Promise.resolve(false)

    // get sensor data
    const sensor = db.get(id).value()

    // call-in for linkage
    const adapter = adapters(sensor.nodehue.adapter)

    return adapter
      .unlink(sensor)
      .then(success => {
        if (success === false)
          return false

        // delete from db
        db.unset(id)
          .write()

        return true
      })
      .catch(() => false)
  }
})
