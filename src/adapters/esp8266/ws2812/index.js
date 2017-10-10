import superagent         from 'superagent'
import superagent_promise from 'superagent-promise'

import { xy2rgb, ct2rgb, rgb2hsv } from '../../../../lib/colors'

// set up superagent
const agent = superagent_promise(superagent, Promise)

// argument would be data from ssdp
const link = (nodehue) => {
  // assuming everything goes right
  return agent
    .post(`${nodehue.url}/${nodehue.id}/link`).end()
    .then(() => ({ modelid: 'LST002', nodehue }))
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
  // TODO... ?
}

const set = ({ nodehue, state }) => {
  let data

  if (state.colormode === 'xy') {
    data = rgb2hsv(
      xy2rgb(state.xy[0], state.xy[1], state.bri)
    )
  }
  else if (state.colormode === 'ct') {
    // value from hue app gives range of 500 for orange, 153 for blue. wtf!
    data = rgb2hsv(
      ct2rgb(Math.map(state.ct, 155, 500, 6500, 2200))
    )
  }
  else { // that be raw hsv
    data = {
      h: 0xff * (state.hue / 0xffff),
      s: state.sat,
      v: state.bri
    }
  }

  // enforcing on/off mode
  if ('on' in state)
    data.status = state.on ? 1 : 0

  return agent
    .post(`${nodehue.url}/${nodehue.id}/set`)
    .type('form').send(data).end()
    .then(() => true)
    .catch(() => false)
}

const on = ({ nodehue }) => {
  return agent
    .post(`${nodehue.url}/${nodehue.id}/on`).end()
    .then(() => true)
    .catch(() => false)
}

const off = ({ nodehue }) => {
  return agent
    .post(`${nodehue.url}/${nodehue.id}/off`).end()
    .then(() => true)
    .catch(() => false)
}

const toggle = ({ nodehue }) => {
  return agent
    .post(`${nodehue.url}/${nodehue.id}/toggle`).end()
    .then(() => true)
    .catch(() => false)
}

export default { link, unlink, get, set, on, off, toggle }