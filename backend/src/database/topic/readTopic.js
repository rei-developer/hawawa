const pool = require('..')
const _ = require('lodash')

module.exports = async id => {
  const result = await pool.query(
    `SELECT
      t.userId,
      t.boardDomain,
      t.originBoardDomain,
      t.category,
      t.author,
      t.title,
      t.content,
      t.ip,
      t.header,
      t.created,
      t.updated,
      t.isChart,
      t.isImage,
      t.isBest,
      t.isNotice,
      t.isAllowed,
      tc.hits,
      tc.likes,
      tc.hates,
      u.profileImageUrl profile,
      u.level,
      u.icon,
      u.isAdmin admin
    FROM Topics t
    LEFT JOIN TopicCounts tc ON tc.topicId = t.id
    LEFT JOIN Users u ON u.id = t.userId
    WHERE t.id = ?`,
    [id]
  )
  if (result.length < 1) return false
  return result[0]
}

module.exports.userId = async id => {
  const result = await pool.query('SELECT userId FROM Topics WHERE id = ?', [id])
  if (result.length < 1) return false
  return result[0].userId
}

module.exports.count = async columns => {
  let keys = []
  let values = []
  _.forIn(columns, (value, key) => {
    keys.push(key)
    values.push(value)
  })
  try {
    const result = await pool.query(
      `SELECT COUNT(*) count FROM Topics WHERE ${keys.map(key => `${key} = ?`).join(' AND ')} ORDER BY id DESC`,
      [...values]
    )
    return result[0].count
  } catch (e) {
    console.log(e.message)
    return false
  }
}

module.exports.counts = async domain => {
  let result
  if (domain === 'all') {
    result = await pool.query(
      `SELECT
        (SELECT COUNT(*) FROM Topics WHERE created > CURDATE() - INTERVAL 1 DAY) yesterday,
        (SELECT COUNT(*) FROM Topics WHERE created > CURDATE()) today,
        (SELECT TIMESTAMPDIFF(MINUTE, CURRENT_DATE(), NOW()) / COUNT(*) FROM Topics WHERE created > CURDATE()) regen`
    )
  } else if (domain === 'best') {
    result = await pool.query(
      `SELECT
        (SELECT COUNT(*) FROM Topics WHERE created > CURDATE() - INTERVAL 1 DAY AND isBest > 1) yesterday,
        (SELECT COUNT(*) FROM Topics WHERE created > CURDATE() AND isBest > 1) today,
        (SELECT TIMESTAMPDIFF(MINUTE, CURRENT_DATE(), NOW()) / COUNT(*) FROM Topics WHERE created > CURDATE() AND isBest > 1) regen`
    )
  } else {
    result = await pool.query(
      `SELECT
        (SELECT COUNT(*) FROM Topics WHERE created > CURDATE() - INTERVAL 1 DAY AND boardDomain = ?) yesterday,
        (SELECT COUNT(*) FROM Topics WHERE created > CURDATE() AND boardDomain = ?) today,
        (SELECT TIMESTAMPDIFF(MINUTE, CURRENT_DATE(), NOW()) / COUNT(*) FROM Topics WHERE created > CURDATE() AND boardDomain = ?) regen`,
      [domain, domain, domain]
    )
  }
  if (result.length < 1) return false
  return result[0]
}

module.exports.notices = async domain => {
  const result = await pool.query(
    `SELECT
      t.id,
      t.userId,
      t.originBoardDomain,
      t.category,
      t.author,
      t.title,
      t.created,
      t.isImage,
      t.isBest,
      tc.hits,
      tc.likes,
      u.level,
      u.icon,
      u.isAdmin admin
    FROM Topics t
    LEFT JOIN TopicCounts tc ON tc.topicId = t.id
    LEFT JOIN Users u ON u.id = t.userId
    WHERE t.boardDomain = ? AND t.isNotice = 1
    ORDER BY t.id DESC`,
    [domain]
  )
  if (result.length < 1) return false
  return result
}

module.exports.topics = async (columns, searches, page, limit) => {
  let keys = []
  let values = []
  _.forIn(columns, (value, key) => {
    keys.push(key)
    values.push(value)
  })
  let query = ''
  let data = []
  if (searches.text !== '') {
    switch (searches.select) {
      case 1:
        query = ' AND MATCH (t.content) AGAINST (?)'
        data = [searches.text]
        break
      case 2:
        query = ' AND MATCH (t.title) AGAINST (?) OR MATCH (t.content) AGAINST (?)'
        data = [searches.text, searches.text]
        break
      case 3:
        query = ' AND MATCH (t.author) AGAINST (?)'
        data = [searches.text]
        break
      default:
        query = ' AND MATCH (t.title) AGAINST (?)'
        data = [searches.text]
        break
    }
  }
  try {
    const result = await pool.query(
      `SELECT
        t.id,
        t.userId,
        t.boardDomain,
        t.originBoardDomain,
        t.category,
        t.author,
        t.title,
        t.created,
        t.isImage,
        t.isBest,
        t.isNotice,
        tc.hits,
        tc.likes,
        u.level,
        u.icon,
        u.isAdmin admin,
        (SELECT imageUrl FROM TopicImages WHERE topicId = t.id LIMIT 1) imageUrl,
        (SELECT COUNT(*) FROM Posts WHERE topicId = t.id) postsCount
      FROM Topics t
      LEFT JOIN TopicCounts tc ON tc.topicId = t.id
      LEFT JOIN Users u ON u.id = t.userId
      WHERE ${keys.map(key => `t.${key} = ?`).join(' AND ')}${query}
      ORDER BY t.id DESC
      LIMIT ?, ?`,
      searches.text === ''
      ? [...values, page * limit, limit]
      : [...values, ...data, page * limit, limit]
    )
    if (result.length < 1) return false
    return result
  } catch (e) {
    console.log(e.message)
    return false
  }
}

module.exports.topicsToWidget = async limit => {
  const result = await pool.query(
    `SELECT
      t.id,
      t.boardDomain,
      t.title,
      t.created,
      t.isBest,
      tc.likes,
      (SELECT COUNT(*) FROM Posts WHERE topicId = t.id) postsCount
    FROM Topics t
    LEFT JOIN TopicCounts tc ON tc.topicId = t.id
    WHERE t.isBest > 0 AND t.isAllowed = 1
    ORDER BY t.id DESC
    LIMIT ?`,
    [limit]
  )
  if (result.length < 1) return false
  return result
}

module.exports.topicImages = async topicId => {
  const result = await pool.query('SELECT name, imageUrl FROM TopicImages WHERE topicId = ?', [topicId])
  if (result.length < 1) return false
  return result
}

module.exports.topicVotes = async (userId, topicId, ip) => {
  const result = await pool.query('SELECT created FROM TopicVotes WHERE topicId = ? AND (userId = ? OR ip = ?)', [topicId, userId, ip])
  if (result.length < 1) return false
  return result[0].created
}