import server from './server'

const serverListenMessage = () => {
  console.log(`\nServer is running on ${process.env.DOMAIN}\n`)
}

const serverInstance = server.listen(process.env.PORT, serverListenMessage)

export default serverInstance
