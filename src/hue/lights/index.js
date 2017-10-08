import superagent from 'superagent'
import pubsub from 'pubsub-js'

import model from './model'

import adapters from '../../adapters'

const uid = db => (
  db.get('lights').keys().length + 1
)

export default db => ({
  get: () => db.get('lights').value(),
  one: id => db.get('lights').get(id).value(),

  create: data => {
    const id = uid()

    db.get('lights')
      .set(id, Object.assign({}, model, data))
      .write()

    return id
  },

  beacon: timeout => {
    const token = pubsub.subscribe('discovery:light', (event, data) => {
      // call-in for linkage
      const adapter = adapters(data.adapter)

      return adapter
        .link(data)
        .then(nodehue => {
          if (nodehue === false)
            return false

          db.get('lights')
            .set(uid(), Object.assign({}, model, { nodehue }))
            .write()

          return true
        })
        .catch(() => false)
    })

    setTimeout(() => pubsub.unsubscribe(token), timeout)
  },

  rename: (id, { name }) => {
    if (!db.get('lights').has(id).value())
      return false

    db.get('lights')
      .get(id)
      .assign({ name })
      .write()

    return true
  },

  state: (id, data) => {
    if (!db.get('lights').has(id).value())
      return false




    return true
  },

  delete: id => {
    if (!db.get('lights').has(id).value())
      return Promise.resolve(false)

    // get light data
    const light = db
          .get('lights')
          .get(id)
          .value()

    // call-in for linkage
    const adapter = adapters(light.nodehue.adapter)

    return adapter
      .unlink(light)
      .then(success => {
        if (success === false)
          return false

        // delete from db
        db.get('lights')
          .unset(id)
          .write()

        return true
      })
      .catch(() => false)
  }
})
