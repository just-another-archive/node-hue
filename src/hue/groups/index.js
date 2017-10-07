import shortid from 'shortid'
import model from './model'

export default db => ({
  get: () => db.get('groups').value(),
  one: id => db.get('groups').get(id).value(),

  create: data => {
    const id = shortid.generate()

    db.get('groups')
      .set(id, Object.assign({}, model, data))
      .write()

    return id
  },

  update: (id, data) => {
    if (!db.get('groups').has(id).value())
      return false

    db.get('groups')
      .get(id)
      .assign(data)
      .write()

    return true
  },

  delete: id => {
    if (!db.get('groups').has(id).value())
      return false

    db.get('groups')
      .unset(id)
      .write()

    return id
  }
})