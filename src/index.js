import ssdp from './ssdp'
import http from './http'

// start ssdp broadcasting and replying
ssdp.start()

// start webserver
http.start()

// cleanup on exit
process.on('SIGINT', () => {
  ssdp.stop()
  http.stop()

  process.exit(0)
})