const pool = require('..')

module.exports = async topicId => {
  const result = await pool.query('SELECT text FROM Charts WHERE topicId = ?', [topicId])
  if (result.length < 1) return false
  return result
}

module.exports.votes = async topicId => {
  const result = await pool.query('SELECT COUNT(*) count, `select` FROM ChartVotes WHERE topicId = ? GROUP BY `select`', [topicId])
  if (result.length < 1) return false
  return result
}

module.exports.voted = async (userId, topicId, ip) => {
  const result = await pool.query('SELECT created FROM ChartVotes WHERE (userId = ? OR ip = ?) AND topicId = ?', [userId, ip, topicId])
  if (result.length < 1) return false
  return result[0].created
}