import superagent from 'superagent'
import pubsub from 'pubsub-js'

import model from './model'

import adapters from '../../adapters'

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
    const token = pubsub.subscribe('discovery:light', (event, data) => {
      // call-in for linkage
      adapters(data.adapter)
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
    return true
  },

  rename: (id, { name }) => {
    if (!db.has(id).value())
      return false

    db.get(id)
      .assign({ name })
      .write()

    return true
  },

  state: (id, state) => {
    if (!db.has(id).value())
      return false

    if ('xy' in state)
      data.colormode = 'xy'
    else if ('ct' in state)
      state.colormode = 'ct'
    else if ('hs' in state)
      state.colormode = 'hs'

    // choose which adapter's method to call depending on properties
    const method = !('on' in state) ? 'set'
                 :  state.on ? 'on' : 'off'

    // get light data
    const light = db.get(id)
                    .cloneDeep()
                    .merge({ state })
                    .value()

    return adapters(light.nodehue.adapter)[method](light)
      .then(success => {
        if (success === false)
          return false

        // write data to db in the end
        db.get(id)
          .merge({ state })
          .write()

        return true
      })
      .catch(() => false)
  },

  delete: id => {
    if (!db.has(id).value())
      return Promise.resolve(false)

    // get light data
    const light = db.get(id).value()

    return adapters(light.nodehue.adapter)
      .unlink(light)
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
