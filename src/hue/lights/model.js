export default {
  state: {
    on: false,
    bri: 0,
    hue: 0,
    sat: 0,
    effect: 'none',
    xy: [],
    ct: 0,
    alert: 'none',
    colormode: 'xy',
    reachable: true
  },

  swupdate: {
    state: 'noupdates',
    lastinstall: null
  },

  name: '',
  type: 'Extended color light',
  uniqueid: '',

  modelid: 'LCT007',
  manufacturername: 'node-hue',
  swversion: '5.50.1.19085',
}
