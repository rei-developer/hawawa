const Router        = require('koa-router')
const Controller    = require('./controller')

const app = new Router()

app.post('/vote', Controller.votes)

module.exports = app