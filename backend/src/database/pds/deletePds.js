const pool = require('..')

module.exports = async id =>
  await pool.query('DELETE FROM Pds WHERE id = ?', [id])

module.exports.pdsImages = async pdsId =>
  await pool.query('DELETE FROM PdsImages WHERE pdsId = ?', [pdsId])