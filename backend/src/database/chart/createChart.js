const pool = require('..')

module.exports = async (topicId, items) => {
  await pool.query(
    `INSERT INTO Charts (topicId, text)
    VALUES ${items.map(() => `(?, ?)`).join(', ')}`,
    items
      .map(item => [topicId, item])
      .reduce((acc, current) => [...acc, ...current], [])
  )
}

module.exports.votes = async (userId, topicId, select, ip) =>
  await pool.query('INSERT INTO ChartVotes (userId, topicId, `select`, ip) VALUES (?, ?, ?, ?)', [userId, topicId, select, ip])