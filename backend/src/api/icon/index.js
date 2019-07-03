const Router        = require('koa-router')
const Controller    = require('./controller')

const app = new Router()

app.post('/list', Controller.getIcons)
app.post('/buy', Controller.buy)

module.exports = app