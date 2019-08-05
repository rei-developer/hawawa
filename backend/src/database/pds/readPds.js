const pool = require('..')
const _ = require('lodash')

module.exports = async id => {
  const result = await pool.query(
    `SELECT
      t.userId,
      t.author,
      t.title,
      t.content,
      t.ip,
      t.header,
      t.cost,
      t.created,
      t.updated,
      t.isImage,
      t.isNotice,
      t.isAllowed,
      tc.hits,
      tc.likes,
      tc.hates,
      u.profileImageUrl profile,
      u.level,
      u.icon,
      u.isAdmin admin
    FROM Pds t
    LEFT JOIN PdsCounts tc ON tc.pdsId = t.id
    LEFT JOIN Users u ON u.id = t.userId
    WHERE t.id = ?`,
    [id]
  )
  if (result.length < 1) return false
  return result[0]
}

module.exports.userId = async id => {
  const result = await pool.query('SELECT userId FROM Pds WHERE id = ?', [id])
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
      `SELECT COUNT(*) count FROM Pds WHERE ${keys.map(key => `${key} = ?`).join(' AND ')} ORDER BY id DESC`,
      [...values]
    )
    return result[0].count
  } catch (e) {
    console.log(e.message)
    return false
  }
}

module.exports.counts = async () => {
  const result = await pool.query(
    `SELECT
      (SELECT COUNT(*) FROM Pds WHERE created > CURDATE() - INTERVAL 1 DAY) yesterday,
      (SELECT COUNT(*) FROM Pds WHERE created > CURDATE()) today,
      (SELECT TIMESTAMPDIFF(MINUTE, CURRENT_DATE(), NOW()) / COUNT(*) FROM Pds WHERE created > CURDATE()) regen`
  )
  if (result.length < 1) return false
  return result[0]
}

module.exports.notices = async () => {
  const result = await pool.query(
    `SELECT
      t.id,
      t.userId,
      t.author,
      t.title,
      t.created,
      t.isImage,
      tc.hits,
      tc.likes,
      u.level,
      u.icon,
      u.isAdmin admin
    FROM Pds t
    LEFT JOIN PdsCounts tc ON tc.pdsId = t.id
    LEFT JOIN Users u ON u.id = t.userId
    WHERE t.isNotice = 1
    ORDER BY t.id DESC`
  )
  if (result.length < 1) return false
  return result
}

module.exports.pds = async (columns, searches, page, limit) => {
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
        t.author,
        t.title,
        t.cost,
        t.created,
        t.isImage,
        t.isNotice,
        tc.hits,
        tc.likes,
        u.profileImageUrl profile,
        u.level,
        u.icon,
        u.isAdmin admin,
        (SELECT imageUrl FROM PdsImages WHERE pdsId = t.id LIMIT 1) imageUrl,
        (SELECT COUNT(*) FROM Posts WHERE pdsId = t.id) postsCount
      FROM Pds t
      LEFT JOIN PdsCounts tc ON tc.pdsId = t.id
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

module.exports.pdsImages = async pdsId => {
  const result = await pool.query('SELECT name, imageUrl FROM PdsImages WHERE pdsId = ?', [pdsId])
  if (result.length < 1) return false
  return result
}

module.exports.pdsVotes = async (userId, pdsId, ip) => {
  const result = await pool.query('SELECT created FROM PdsVotes WHERE pdsId = ? AND (userId = ? OR ip = ?)', [pdsId, userId, ip])
  if (result.length < 1) return false
  return result[0].created
}