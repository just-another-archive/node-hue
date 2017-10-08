import model from './model'

const uid = db => (
  db.get('groups').keys().length + 1
)

export default db => ({
  get: () => db.get('groups').value(),
  one: id => db.get('groups').get(id).value(),

  create: data => {
    const id = uid()

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