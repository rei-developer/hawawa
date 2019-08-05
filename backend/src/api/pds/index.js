const Router = require('koa-router')
const Controller = require('./controller')

const app = new Router()

app.get('/count', Controller.getPdsCounts)
app.get('/read/:id', Controller.getContent)
app.post('/list', Controller.getPds)
app.post('/write', Controller.createPds)
app.post('/vote', Controller.createPdsVotes)
app.patch('/edit/notice', Controller.updatePdsByIsNotice)
app.delete('/delete', Controller.deletePds)

module.exports = app