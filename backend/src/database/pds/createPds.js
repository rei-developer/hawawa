const pool = require('..')
const _ = require('lodash')

module.exports = async columns => {
  let keys = []
  let values = []
  _.forIn(columns, (value, key) => {
    keys.push(key)
    values.push(value)
  })
  try {
    const result = await pool.query(
      `INSERT INTO Pds SET
      ${keys.map(key => `${key} = ?`).join(', ')}`,
      [...values]
    )
    return result.insertId
  } catch (e) {
    console.log(e.message)
    return false
  }
}

module.exports.createPdsCounts = async pdsId =>
  await pool.query('INSERT INTO PdsCounts (pdsId) VALUES (?)', [pdsId])

module.exports.createPdsImages = async (pdsId, items) => {
  await pool.query(
    `INSERT INTO PdsImages (pdsId, name, imageUrl)
    VALUES ${items.filter(item => item.filename).map(() => `(?, ?, ?)`).join(', ')}`,
    items
      .filter(item => item.filename)
      .map(item => [pdsId, item.name, item.filename])
      .reduce((acc, current) => [...acc, ...current], [])
  )
}

module.exports.createPdsVotes = async (userId, pdsId, ip) =>
  await pool.query('INSERT INTO PdsVotes (userId, pdsId, ip) VALUES (?, ?, ?)', [userId, pdsId, ip])