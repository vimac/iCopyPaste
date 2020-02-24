import {getBaseDAOMeta} from './MySpotGenerator'

export const convertFileListToTree = (fileList, queries, projectTopDirName, treeNodeFn = null) => {
  const treeRoot = {title: projectTopDirName, children: [], nodeType: 'dir'}
  treeNodeFn && treeNodeFn(treeRoot, {}, {isNew: true})

  fileList.forEach((elt) => {
    const {filename} = elt
    addFileToTree(treeRoot.children, filename.split('/'), elt, treeNodeFn)
  })

  if (queries.length === 0) {
    return treeRoot
  }
  const baseDAOMeta = getBaseDAOMeta()
  addFileToTree(treeRoot.children, baseDAOMeta.filename.split('/'), {...baseDAOMeta, fileType: 'baseDAO'}, treeNodeFn)

  queries.forEach(elt => {
    const {configurationFilename, daoFilename} = elt
    addFileToTree(treeRoot.children, configurationFilename.split('/'), {fileType: 'mySpotConfiguration', ...elt}, treeNodeFn)
    addFileToTree(treeRoot.children, daoFilename.split('/'), {fileType: 'mySpotDAO', ...elt}, treeNodeFn)
  })

  return treeRoot
}

const addFileToTree = (children, filenameParts, meta, nodeFn) => {
  const part = filenameParts.shift()
  let foundIndex = children.findIndex(child => child.title === part)

  if (filenameParts.length > 0) {
    if (foundIndex === -1) {
      const node = {title: part, nodeType: 'dir', children: []}
      nodeFn && nodeFn(node, meta, {isNew: true})
      children.push(node)
      foundIndex = children.length - 1
    } else {
      nodeFn && nodeFn(children[foundIndex], meta, {isNew: false})
    }
    addFileToTree(children[foundIndex].children, filenameParts, meta, nodeFn)
  } else {
    if (foundIndex === -1) {
      const node = {title: part, nodeType: 'file', meta}
      nodeFn && nodeFn(node, meta, {isNew: true})
      children.push(node)
    } else {
      nodeFn && nodeFn(children[foundIndex], meta, {isNew: false})
    }
  }
}
