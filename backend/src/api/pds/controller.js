const fs = require('fs')
const moment = require('moment')
const Filter = require('../../lib/filter')
const User = require('../../lib/user')
const createPds = require('../../database/pds/createPds')
const readPds = require('../../database/pds/readPds')
const readUser = require('../../database/user/readUser')
const updatePds = require('../../database/pds/updatePds')
const deletePds = require('../../database/pds/deletePds')

module.exports.getPdsCounts = async ctx => {
  const counts = await readPds.counts()
  if (!counts) return ctx.body = { status: 'fail' }
  ctx.body = counts
}

module.exports.getPds = async ctx => {
  const { ...body } = ctx.request.body
  const userId = body.userId || 0
  const searches = body.searches || { text: '', select: 0 }
  const page = body.page || 0
  const limit = body.limit || 20
  if (page < 0) return
  if (limit < 10 || limit > 50) return
  const obj = {}
  if (userId > 0) obj.userId = userId
  obj.isAllowed = 1
  const count = await readPds.count(obj)
  const notices = await readPds.notices()
  const pds = await readPds.pds(obj, searches, page, limit)
  ctx.body = { count, notices, pds }
}

module.exports.getContent = async ctx => {
  const { id } = ctx.params
  if (id < 1) return
  const pds = await readPds(id)
  if (!pds || pds.isAllowed < 1) return ctx.body = { status: 'fail' }
  const images = pds.isImage > 0
    ? await readPds.pdsImages(id)
    : []
  await updatePds.updatePdsCountsByHits(id)
  ctx.body = { pds, images }
}

module.exports.createPds = async ctx => {
  const user = await User.getUser(ctx.get('x-access-token'))
  if (!user) return
  let {
    isNotice,
    title,
    url,
    password,
    cost,
    content,
    images
  } = ctx.request.body
  if (url === '' || title === '' || content === '') return
  title = Filter.disable(title)
  url = Filter.disable(url)
  if (password) password = Filter.disable(password)
  content = Filter.topic(content)
  if (user.isAdmin < 1) {
    // TODO: 관리자 전용 커스텀
    if (isNotice > 0) isNotice = 0
  }
  const ip = ctx.get('x-real-ip')
  const header = ctx.header['user-agent']
  const isImage = images.length > 0 ? true : false
  const pdsId = await createPds({
    userId: user.id,
    author: user.nickname,
    title,
    content,
    ip,
    header,
    url,
    password,
    cost,
    isImage,
    isNotice
  })
  await createPds.createPdsCounts(pdsId)
  if (isImage) await createPds.createPdsImages(pdsId, images)
  await User.setUpPoint(user, 10)
  ctx.body = { pdsId, status: 'ok' }
}

module.exports.createPdsVotes = async ctx => {
  const user = await User.getUser(ctx.get('x-access-token'))
  if (!user) return
  let {
    id,
    likes
  } = ctx.request.body
  if (id < 1) return
  const pds = await readPds(id)
  if (!pds) return ctx.body = { status: 'fail' }
  const targetUser = await readUser(pds.userId)
  const ip = ctx.get('x-real-ip')
  if (targetUser === user.id || pds.ip === ip) return ctx.body = { message: '본인에게 투표할 수 없습니다.', status: 'fail' }
  const date = await readPds.pdsVotes(user.id, id, ip)
  if (date) {
    const created = moment(date).format('YYYY/MM/DD HH:mm:ss')
    return ctx.body = { message: `이미 투표한 게시물입니다. (${created})`, status: 'fail' }
  }
  await createPds.createPdsVotes(user.id, id, ip)
  if (likes) {
    await User.setUpExpAndPoint(targetUser, 5, 5)
    await updatePds.updatePdsCountsByLikes(id)
  } else {
    await User.setUpExpAndPoint(targetUser, -5, -5)
    await updatePds.updatePdsCountsByHates(id)
  }
  ctx.body = { move: '', status: 'ok' }
}

module.exports.buy = async ctx => {
  const { id } = ctx.request.body
  if (id < 1) return
  const user = await User.getUser(ctx.get('x-access-token'))
  if (!user) return
  const buyItem = await readPds.buy(id)
  if (!buyItem) return
  if (user.point < buyItem.cost) return ctx.body = { message: '포인트가 부족합니다.', status: 'fail' }
  await User.setUpPoint(user, -buyItem.cost)
  ctx.body = { url: buyItem.url, password: buyItem.password, status: 'ok' }
}

module.exports.updatePdsByIsNotice = async ctx => {
  const user = await User.getUser(ctx.get('x-access-token'))
  if (!user) return
  const { id } = ctx.request.body
  if (id < 1) return ctx.body = { status: 'fail' }
  const userId = await readPost.userId(id)
  if (!userId) return ctx.body = { status: 'fail' }
  if (user.isAdmin < 1) return
  await updatePds.updatePdsByIsNotice(id)
  ctx.body = { status: 'ok' }
}

module.exports.deletePds = async ctx => {
  const user = await User.getUser(ctx.get('x-access-token'))
  if (!user) return
  const { id } = ctx.request.body
  if (id < 1) return ctx.body = { status: 'fail' }
  const userId = await readPds.userId(id)
  if (!userId) return ctx.body = { status: 'fail' }
  if (user.isAdmin < 1 && userId !== user.id) return
  const images = await readPds.pdsImages(id)
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
    await deletePds.pdsImages(id)
  }
  if (user.isAdmin > 0)
    await deletePds(id)
  else
    await updatePds.updatePdsByIsAllowed(id)
  await User.setUpPoint(user, -20)
  ctx.body = { status: 'ok' }
}