const Router        = require('koa-router')
const Controller    = require('./controller')

const app = new Router()

app.get('/count/:domain', Controller.getTopicCounts)
app.get('/categories/:domain', Controller.getCategories)
app.get('/read/:id', Controller.getContent)
app.get('/list/widget', Controller.getListToWidget)
app.post('/list', Controller.getTopics)
app.post('/list/post', Controller.getPosts)
app.post('/list/post/me', Controller.getMyPosts)
app.post('/write', Controller.createTopic)
app.post('/write/post', Controller.createPost)
app.post('/vote', Controller.createTopicVotes)
app.post('/vote/post', Controller.createPostVotes)
app.patch('/edit/post', Controller.updatePost)
app.patch('/edit/notice', Controller.updateTopicByIsNotice)
app.delete('/delete', Controller.deleteTopic)
app.delete('/delete/post', Controller.deletePost)

module.exports = app