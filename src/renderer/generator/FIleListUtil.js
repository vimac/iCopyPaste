export const convertFileListToTree = (fileList, projectTopDirName, treeNodeFn = null) => {
  const topLevel = {title: projectTopDirName, children: [], nodeType: 'dir'}
  treeNodeFn && treeNodeFn(topLevel)

  fileList.forEach((elt, index) => {
    const {filename} = elt
    const filenameParts = filename.split('/')
    let currentLevel = topLevel.children
    filenameParts.forEach((part, index) => {
      if (index === filenameParts.length - 1) {
        const node = {title: part, nodeType: 'file'}
        treeNodeFn && treeNodeFn(node)
        currentLevel.push(node)
        return
      }
      let foundIndex = currentLevel.findIndex(item => item.title === part)
      if (foundIndex === -1) {
        const node = {title: part, nodeType: 'dir', children: []}
        treeNodeFn && treeNodeFn(node)
        currentLevel.push(node)
        foundIndex = currentLevel.length - 1
      }
      currentLevel = currentLevel[foundIndex].children
    })
  })

  return topLevel
}

export const iterAndCallFn = (o, fn) => {
  fn(o)
  Object.keys(o).forEach((k) => {
    if (o[k] instanceof Array) {
      o[k].forEach(item => iterAndCallFn(item, fn))
    }
  })
}
