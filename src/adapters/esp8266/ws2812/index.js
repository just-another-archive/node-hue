import superagent         from 'superagent'
import superagent_promise from 'superagent-promise'

// set up superagent
const agent = superagent_promise(superagent, Promise)

// argument would be data from ssdp
const link = (nodehue) => {
  // assuming everything goes right
  return agent
    .post(`${nodehue.url}/${nodehue.id}/link`).end()
    .then(() => nodehue)
    .catch(() => false)
}

// argument would be the light object from db
const unlink = ({ nodehue }) => {
  // assuming everything goes right
  return agent
    .post(`${nodehue.url}/${nodehue.id}/unlink`).end()
    .then(()  => true)
    .catch(() => false)
}

const get = ({ nodehue }) => {
  // TODO
}

const set = ({ nodehue }) => {
  // TODO
}

const on = ({ nodehue }) => {
  // TODO
}

const off = ({ nodehue }) => {
  // TODO
}

const toggle = ({ nodehue }) => {
  // TODO
}

export default { link, unlink, get, set, on, off, toggle }