import superagent from 'superagent'
import pubsub from 'pubsub-js'

import shortid from 'shortid'
import model from './model'

export default db => ({
  get: () => db.get('sensors').value(),
  one: id => db.get('sensors').get(id).value(),

  create: data => {
    const id = shortid.generate()

    db.get('sensors')
      .set(id, Object.assign({}, model, data))
      .write()

    return id
  },

  beacon: timeout => {
    const token = pubsub.subscribe('discovery:sensor', (event, data) => {
      // call-in for linkage
      superagent.get(`${data.url}/${data.chip}/link`)

      // store in db
      db.get('sensors')
        .set(data.chip, Object.assign({}, model, data))
        .write()
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
      return false

    // get data
    const { url, chip } = db
      .get('sensors')
      .get(id)
      .value()

    // TODO: make sure it's reachable (check for statuscode 200)
    // call-in for unlinkage
    superagent.get(`${url}/${chip}/unlink`)

    // delete from db
    db.get('sensors')
      .unset(id)
      .write()

    return id
  }
})
