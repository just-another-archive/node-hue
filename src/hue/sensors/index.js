import superagent from 'superagent'
import pubsub from 'pubsub-js'

import model from './model'

const uid = db => (
  db.get('sensors').keys().length + 1
)

export default db => ({
  get: () => db.get('sensors').value(),
  one: id => db.get('sensors').get(id).value(),

  create: data => {
    const id = uid()

    db.get('sensors')
      .set(id, Object.assign({}, model, data))
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

          db.get('sensors')
            .set(uid(), Object.assign({}, model, { nodehue }))
            .write()

          return true
        })
        .catch(() => false)
    })

    setTimeout(() => pubsub.unsubscribe(token), timeout)
  },

  rename: (id, { name }) => {
    if (!db.get('sensors').has(id).value())
      return false

    db.get('sensors')
      .get(id)
      .assign({ name })
      .write()

    return true
  },

  state: (id, data) => {
    if (!db.get('sensors').has(id).value())
      return false




    return true
  },

  delete: id => {
    if (!db.get('sensors').has(id).value())
      return Promise.resolve(false)

    // get sensor data
    const sensor = db
          .get('sensors')
          .get(id)
          .value()

    // call-in for linkage
    const adapter = adapters(sensor.nodehue.adapter)

    return adapter
      .unlink(sensor)
      .then(success => {
        if (success === false)
          return false

        // delete from db
        db.get('sensors')
          .unset(id)
          .write()

        return true
      })
      .catch(() => false)
  }
})
