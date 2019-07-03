const Koa         = require('koa')
const Logger      = require('koa-logger')
const bodyParser  = require('koa-bodyparser')
const Router      = require('koa-router')
const helmet      = require('koa-helmet')
const dotenv      = require('dotenv')
const api         = require('./api')

dotenv.config()

const app = new Koa()
const router = new Router()

router.use(helmet())
router.use(Logger())
router.use(bodyParser())
router.use('/api', api.routes())
router.get('/', ctx => ctx.body = 'Hello, World!')

app.use(router.routes()).use(router.allowedMethods())

const server = require('http').createServer(app.callback())
const redis = require('socket.io-redis')
const io = require('socket.io')(server)
const socket = require('./lib/socket.io')

io.adapter(redis({
  host: 'localhost',
  port: 6379
}))

global.io = io

socket.start(io)

const { PORT, CONSOLE_CLEAN } = process.env

server.listen(PORT, () => {
  console.log(`${CONSOLE_CLEAN === 'true' ? '\x1Bc' : ''}HAWAWA server is listening to port ${PORT}`)
})