const Router                = require('koa-router')
const Controller            = require('./controller')
const { isAuthenticated }   = require('../../lib/user')

const app = new Router()

app.get('/check', isAuthenticated, Controller.getUser)
app.post('/signin', Controller.getAuth)
app.post('/signup', Controller.createUser)
app.post('/accept', Controller.sendMail)
app.patch('/edit/verify', Controller.updateUserByIsVerified)
app.patch('/edit/profile', Controller.updateUserByProfileImage)
app.patch('/edit', Controller.updateUser)

module.exports = app