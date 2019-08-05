const fs = require('fs')
const redis = require('redis')
const moment = require('moment')
const Filter = require('../../lib/filter')
const socket = require('../../lib/socket.io')
const User = require('../../lib/user')
const createChart = require('../../database/chart/createChart')
const createNotice = require('../../database/notice/createNotice')
const createPost = require('../../database/post/createPost')
const createTopic = require('../../database/topic/createTopic')
const readBoard = require('../../database/board/readBoard')
const readChart = require('../../database/chart/readChart')
const readNotice = require('../../database/notice/readNotice')
const readPost = require('../../database/post/readPost')
const readTopic = require('../../database/topic/readTopic')
const readUser = require('../../database/user/readUser')
const updateNotice = require('../../database/notice/updateNotice')
const updatePost = require('../../database/post/updatePost')
const updateTopic = require('../../database/topic/updateTopic')
const deleteNotice = require('../../database/notice/deleteNotice')
const deletePost = require('../../database/post/deletePost')
const deleteTopic = require('../../database/topic/deleteTopic')

const client = redis.createClient()

const BURN_LIMIT = 1
const BEST_LIMIT = 3
const DELETE_LIMIT = 10

module.exports.getTopicCounts = async ctx => {
  const { domain } = ctx.params
  const counts = await readTopic.counts(domain)
  if (!counts) return ctx.body = { status: 'fail' }
  ctx.body = counts
}

module.exports.getListToWidget = async ctx => {
  const topics = await readTopic.topicsToWidget(10)
  ctx.body = topics
}

module.exports.getTopics = async ctx => {
  const { ...body } = ctx.request.body
  const domain = body.domain || 'all'
  const userId = body.userId || 0
  const category = body.category || ''
  const searches = body.searches || { text: '', select: 0 }
  const page = body.page || 0
  const limit = body.limit || 20
  if (page < 0) return
  if (limit < 10 || limit > 50) return
  const obj = {}
  if (domain === 'best') obj.isBest = 2
  else if (domain !== 'all') obj.boardDomain = domain
  if (userId > 0) obj.userId = userId
  if (category !== '') obj.category = category
  obj.isAllowed = 1
  const count = await readTopic.count(obj)
  const categories = await readBoard.categories(domain)
  const notices = await readTopic.notices(domain)
  if (notices.length > 0) {
    const jobs = notices.map(notice => new Promise(resolve => {
      client.get(notice.id, (err, value) => {
        if (err) return resolve(true)
        const hits = Number(value) || 0
        notice.hits += hits
        resolve(true)
      })
    }))
    await Promise.all(jobs)
  }
  const topics = await readTopic.topics(obj, searches, page, limit)
  if (topics.length > 0) {
    const jobs = topics.map(topic => new Promise(resolve => {
      client.get(topic.id, (err, value) => {
        if (err) return resolve(true)
        const hits = Number(value) || 0
        topic.hits += hits
        resolve(true)
      })
    }))
    await Promise.all(jobs)
  }
  ctx.body = { count, categories, notices, topics }
}

module.exports.getPosts = async ctx => {
  const { ...body } = ctx.request.body
  const topicId = body.id || 0
  const page = body.page || 0
  const limit = body.limit || 20
  if (topicId < 0 || page < 0) return
  if (limit < 10 || limit > 50) return
  const count = await readPost.count(topicId)
  const posts = await readPost.posts(topicId, page, limit)
  ctx.body = { count, posts }
}

module.exports.getMyPosts = async ctx => {
  const { ...body } = ctx.request.body
  const userId = body.userId || 0
  const page = body.page || 0
  const limit = body.limit || 20
  if (userId < 0 || page < 0) return
  if (limit < 10 || limit > 50) return
  const count = await readPost.countByMe(userId)
  const posts = await readPost.postsByMe(userId, page, limit)
  ctx.body = { count, posts }
}

module.exports.getCategories = async ctx => {
  const { domain } = ctx.params
  const categories = await readBoard.categories(domain)
  ctx.body = categories
}

module.exports.getContent = async ctx => {
  const { id } = ctx.params
  if (id < 1) return
  const user = await User.getUser(ctx.get('x-access-token'))
  const topic = await readTopic(id)
  if (!topic || topic.isAllowed < 1) return ctx.body = { status: 'fail' }
  const charts = topic.isChart > 0
    ? await readChart(id)
    : []
  const chartVotes = topic.isChart > 0
    ? await readChart.votes(id)
    : []
  const images = topic.isImage > 0
    ? await readTopic.topicImages(id)
    : []
  if (client.exists(id)) {
    const hits = await new Promise(resolve => {
      client.get(id, (err, value) => {
        if (err) return resolve(1)
        const hit = Number(value) + 1
        client.set(id, hit)
        resolve(hit)
      })
    })
    topic.hits += hits
  } else {
    client.set(id, 1)
    topic.hits += 1
  }
  let count = 0
  if (user) {
    await updateNotice.updateNoticeByConfirm(user.id, id)
    count = await readNotice.count(user.id)
  }
  ctx.body = { topic, charts, chartVotes, images, count }
}

module.exports.createTopic = async ctx => {
  const user = await User.getUser(ctx.get('x-access-token'))
  if (!user) return
  let {
    domain,
    isNotice,
    category,
    title,
    content,
    charts,
    images
  } = ctx.request.body
  if (title === '' || content === '') return
  title = Filter.disable(title)
  content = Filter.topic(content)
  charts = Filter.disable(charts)
  const isAdminOnly = await readBoard.isAdminOnly(domain)
  if (isAdminOnly < 0) return
  if (user.isAdmin < isAdminOnly) return ctx.body = { message: '권한이 없습니다.', status: 'fail' }
  if (user.isAdmin < 1) {
    // TODO: 관리자 전용 커스텀
    if (isNotice > 0) isNotice = 0
  }
  const ip = ctx.get('x-real-ip')
  const header = ctx.header['user-agent']
  const isChart = charts !== '' ? true : false
  const isImage = images.length > 0 ? true : false
  const topicId = await createTopic({
    userId: user.id,
    boardDomain: domain,
    category,
    author: user.nickname,
    title,
    content,
    ip,
    header,
    isChart,
    isImage,
    isNotice
  })
  await createTopic.createTopicCounts(topicId)
  if (isChart) await createChart(topicId, charts.split('\n'))
  if (isImage) await createTopic.createTopicImages(topicId, images)
  await User.setUpPoint(user, 10)
  await socket.newTopic(global.io, topicId, domain, title)
  ctx.body = { topicId, status: 'ok' }
}

module.exports.createPost = async ctx => {
  const user = await User.getUser(ctx.get('x-access-token'))
  if (!user) return
  let {
    topicId,
    topicUserId,
    postUserId,
    postRootId,
    postParentId,
    content,
    sticker
  } = ctx.request.body
  topicUserId = Number(topicUserId)
  if (postUserId) postUserId = Number(postUserId)
  content = Filter.post(content)
  const ip = ctx.get('x-real-ip')
  const header = ctx.header['user-agent']
  const postId = await createPost({
    userId: user.id,
    topicId,
    postRootId,
    postParentId,
    author: user.nickname,
    content,
    stickerId: sticker.id,
    stickerSelect: sticker.select,
    ip,
    header
  })
  const postsCount = await readPost.count(topicId)
  const posts = await readPost.posts(topicId, 0, 100)
  await createPost.createPostCounts(postId)
  await User.setUpPoint(user, 5)
  const items = []
  if (user.id !== topicUserId) items.push(topicUserId)
  if (postUserId && user.id !== postUserId && topicUserId !== postUserId) items.push(postUserId)
  const jobs = items.map(receiver => new Promise(async resolve => {
    await createNotice(receiver, topicId, postId)
    resolve(true)
  }))
  await Promise.all(jobs)
  await socket.newPost(global.io, topicId)
  ctx.body = { postId, postsCount, posts, status: 'ok' }
}

module.exports.createTopicVotes = async ctx => {
  const user = await User.getUser(ctx.get('x-access-token'))
  if (!user) return
  let {
    id,
    likes
  } = ctx.request.body
  if (id < 1) return
  const topic = await readTopic(id)
  if (!topic) return ctx.body = { status: 'fail' }
  const targetUser = await readUser(topic.userId)
  const ip = ctx.get('x-real-ip')
  if (targetUser === user.id || topic.ip === ip) return ctx.body = { message: '본인에게 투표할 수 없습니다.', status: 'fail' }
  const duration = moment.duration(moment().diff(topic.created))
  const hours = duration.asHours()
  if (hours > 72) return ctx.body = { message: '3일이 지난 게시물은 투표할 수 없습니다.', status: 'fail' }
  const date = await readTopic.topicVotes(user.id, id, ip)
  if (date) {
    const created = moment(date).format('YYYY/MM/DD HH:mm:ss')
    return ctx.body = { message: `이미 투표한 게시물입니다. (${created})`, status: 'fail' }
  }
  await createTopic.createTopicVotes(user.id, id, ip)
  let move = ''
  if (likes) {
    if (topic.isBest === 0 && topic.likes - topic.hates >= BURN_LIMIT) {
      move = 'BURN'
      await updateTopic.updateTopicByIsBest(id, 1)
      await User.setUpExpAndPoint(targetUser, 20, 20)
    } else if (topic.isBest === 1 && topic.likes - topic.hates >= BEST_LIMIT) {
      move = 'BEST'
      await updateTopic.updateTopicByIsBest(id, 2)
      await User.setUpExpAndPoint(targetUser, 100, 100)
      await socket.newBest(global.io, id, topic.boardDomain, topic.title)
    } else {
      await User.setUpExpAndPoint(targetUser, 5, 5)
    }
    await updateTopic.updateTopicCountsByLikes(id)
  } else {
    if (topic.isBest === 2 && topic.hates - topic.likes >= BEST_LIMIT) {
      move = 'BURN'
      await updateTopic.updateTopicByIsBest(id, 1)
      await User.setUpExpAndPoint(targetUser, -100, -100)
    } else if (topic.isBest === 1 && topic.hates - topic.likes >= BURN_LIMIT) {
      move = 'DEFAULT'
      await updateTopic.updateTopicByIsBest(id)
      await User.setUpExpAndPoint(targetUser, -20, -20)
    } else if (topic.hates - topic.likes >= DELETE_LIMIT) {
      move = 'DELETE'
      await updateTopic.updateTopicByIsAllowed(id)
      await User.setUpExpAndPoint(targetUser, -10, -10)
    } else {
      await User.setUpExpAndPoint(targetUser, -5, -5)
    }
    await updateTopic.updateTopicCountsByHates(id)
  }
  await socket.vote(global.io, id, likes ? ++topic.likes : topic.likes, likes ? topic.hates : ++topic.hates)
  ctx.body = { move: '', status: 'ok' }
}

module.exports.createPostVotes = async ctx => {
  const user = await User.getUser(ctx.get('x-access-token'))
  if (!user) return
  let {
    id,
    likes
  } = ctx.request.body
  if (id < 1) return
  const post = await readPost(id)
  if (!post) return ctx.body = { status: 'fail' }
  const targetUser = await readUser(post.userId)
  const ip = ctx.get('x-real-ip')
  if (targetUser === user.id || post.ip === ip) return ctx.body = { message: '본인에게 투표할 수 없습니다.', status: 'fail' }
  const duration = moment.duration(moment().diff(post.created))
  const hours = duration.asHours()
  if (hours > 72) return ctx.body = { message: '3일이 지난 게시물은 투표할 수 없습니다.', status: 'fail' }
  const date = await readPost.postVotes(user.id, id, ip)
  if (date) {
    const created = moment(date).format('YYYY/MM/DD HH:mm:ss')
    return ctx.body = { message: `이미 투표한 게시물입니다. (${created})`, status: 'fail' }
  }
  await createPost.createPostVotes(user.id, id, ip)
  if (likes)
    await updatePost.updatePostCountsByLikes(id)
  else
    await updatePost.updatePostCountsByHates(id)
  await socket.votePost(global.io, post.topicId, id, likes ? ++post.likes : post.likes, likes ? post.hates : ++post.hates)
  ctx.body = { status: 'ok' }
}

module.exports.updatePost = async ctx => {
  const user = await User.getUser(ctx.get('x-access-token'))
  if (!user) return
  const {
    id,
    content,
    sticker
  } = ctx.request.body
  if (id < 1) return ctx.body = { status: 'fail' }
  const userId = await readPost.userId(id)
  if (!userId) return ctx.body = { status: 'fail' }
  if (user.isAdmin < 1 && userId !== user.id) return
  await updatePost(
    id,
    Filter.post(content),
    sticker.id,
    sticker.select
  )
  ctx.body = { status: 'ok' }
}

module.exports.updateTopicByIsNotice = async ctx => {
  const user = await User.getUser(ctx.get('x-access-token'))
  if (!user) return
  const { id } = ctx.request.body
  if (id < 1) return ctx.body = { status: 'fail' }
  const userId = await readTopic.userId(id)
  if (!userId) return ctx.body = { status: 'fail' }
  if (user.isAdmin < 1) return
  await updateTopic.updateTopicByIsNotice(id)
  ctx.body = { status: 'ok' }
}

module.exports.deleteTopic = async ctx => {
  const user = await User.getUser(ctx.get('x-access-token'))
  if (!user) return
  const { id } = ctx.request.body
  if (id < 1) return ctx.body = { status: 'fail' }
  const userId = await readTopic.userId(id)
  if (!userId) return ctx.body = { status: 'fail' }
  if (user.isAdmin < 1 && userId !== user.id) return
  const images = await readTopic.topicImages(id)
  if (images) {
    const jobs = images.map(image => new Promise(async resolve => {
      fs.unlink(`./img/${image.imageUrl}`, err => {
        if (err) console.log(err)
        resolve(true)
      })
    }))
    await Promise.all(jobs)
    const jobsForThumb = images.map(image => new Promise(async resolve => {
      fs.unlink(`./img/thumb/${image.imageUrl}`, err => {
        if (err) console.log(err)
        resolve(true)
      })
    }))
    await Promise.all(jobsForThumb)
    await deleteTopic.topicImages(id)
  }
  if (user.isAdmin > 0)
    await deleteTopic(id)
  else
    await updateTopic.updateTopicByIsAllowed(id)
  await User.setUpPoint(user, -20)
  ctx.body = { status: 'ok' }
}

module.exports.deletePost = async ctx => {
  const user = await User.getUser(ctx.get('x-access-token'))
  if (!user) return
  const { id } = ctx.request.body
  if (id < 1) return ctx.body = { status: 'fail' }
  const userId = await readPost.userId(id)
  if (!userId) return ctx.body = { status: 'fail' }
  if (user.isAdmin < 1 && userId !== user.id) return
  await deleteNotice.postId(id)
  await deletePost(id)
  await User.setUpPoint(user, -10)
  ctx.body = { status: 'ok' }
}