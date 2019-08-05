const pool = require('..')

module.exports.updatePdsByIsNotice = async (pdsId, isNotice = 0) =>
  await pool.query('UPDATE Pds SET isNotice = ? WHERE id = ?', [isNotice, pdsId])

module.exports.updatePdsByIsAllowed = async (pdsId, isAllowed = 0) =>
  await pool.query('UPDATE Pds SET isAllowed = ? WHERE id = ?', [isAllowed, pdsId])

module.exports.updatePdsCountsByHits = async (pdsId, hits = 1) =>
  await pool.query('UPDATE PdsCounts SET hits = hits + ? WHERE pdsId = ?', [hits, pdsId])

module.exports.updatePdsCountsByLikes = async (pdsId, likes = 1) =>
  await pool.query('UPDATE PdsCounts SET likes = likes + ? WHERE pdsId = ?', [likes, pdsId])

module.exports.updatePdsCountsByHates = async (pdsId, hates = 1) =>
  await pool.query('UPDATE PdsCounts SET hates = hates + ? WHERE pdsId = ?', [hates, pdsId])