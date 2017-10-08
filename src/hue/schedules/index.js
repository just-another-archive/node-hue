import model from './model'

const uid = db => (
  db.get('schedules').keys().length + 1
)

export default db => ({
  get: () => db.get('schedules').value(),
  one: id => db.get('schedules').get(id).value(),

  create: data => {
    const id = uid()

    db.get('schedules')
      .set(id, Object.assign({}, model, data))
      .write()

    return id
  },

  update: (id, data) => {
    if (!db.get('schedules').has(id).value())
      return false

    db.get('schedules')
      .get(id)
      .assign(data)
      .write()

    return true
  },

  delete: id => {
    if (!db.get('schedules').has(id).value())
      return false

    db.get('schedules')
      .unset(id)
      .write()

    return id
  }
})