module.exports.getBoardName = domain => {
  let name = ''
  switch (domain) {
    case 'all':
      name = '전체'
      break
    case 'best':
      name = '인기'
      break
    case 'girl':
      name = '연예'
      break
    case 'anime':
      name = '애니'
      break
    case 'talk':
      name = '토크'
      break
    case 'history':
      name = '역사'
      break
    case 'feedback':
      name = '건의'
      break
    case 'notice':
      name = '공지'
      break
  }
  return name
}