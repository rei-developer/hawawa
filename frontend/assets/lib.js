module.exports.getBoardName = domain => {
  let name = ''
  switch (domain) {
    case 'best':
      name = '인기'
      break
    case 'all':
      name = '전체'
      break
    case 'talk':
      name = '토크'
      break
    case 'notice':
      name = '공지사항'
      break
  }
  return name
}