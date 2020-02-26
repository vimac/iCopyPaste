import {getBaseDAOMeta} from './MySpotGenerator'
import {fileContentGenerator} from './FileContentGenerator'
import Zip from 'node-zip'

export const convertZipArchive = (zipFilename, models, queries, database, projectTopDirName) => {
  const fileList = {}
  if (queries.length > 0) {
    const {filename} = getBaseDAOMeta()
    fileList[filename] = {filename, fileType: 'mySpotBaseDAO'}
  }
  queries.forEach(q => {
    if (fileList[q.configurationFilename]) {
      fileList[q.configurationFilename].params.configs.push(q.params)
    } else {
      fileList[q.configurationFilename] = {
        filename: q.configurationFilename,
        fileType: 'mySpotConfigurations',
        params: {filename: q.configurationFilename, configs: [q.params]},
        table: q.table
      }
    }
    if (fileList[q.daoFilename]) {
      fileList[q.daoFilename].params.functions.push(q.params)
    } else {
      fileList[q.daoFilename] = {
        filename: q.daoFilename,
        fileType: 'mySpotDAOs',
        params: {functions: [q.params]},
        table: q.table
      }
    }
  })
  models.forEach(m => {
    fileList[m.filename] = {
      filename: m.filename,
      fileType: 'dataModel',
      table: m.table
    }
  })

  const files = []
  const contents = Object.keys(fileList).map((k, i) => {
    files[i] = fileList[k].filename
    return fileContentGenerator[fileList[k].fileType](database, fileList[k].table, fileList[k].params)
  })
  return new Promise((resolve, reject) => {
    Promise.all(contents)
      .then(payload => {
        const zip = new Zip()
        payload.forEach((c, i) => {
          const filename = files[i]
          const {code} = c
          zip.file(projectTopDirName + '/' + filename, code)
        })
        require('fs').writeFileSync(
          zipFilename,
          zip.generate({base64: false, compression: 'DEFLATE'}),
          {encoding: 'binary'}
        )
        resolve()
      })
      .catch(reject)
  })
}

export const convertFileListToTree = (models, queries, projectTopDirName, treeNodeFn = null) => {
  const treeRoot = {title: projectTopDirName, children: [], nodeType: 'dir'}
  treeNodeFn && treeNodeFn(treeRoot, {}, {isNew: true})

  models.forEach((elt) => {
    /**
     * elt example:
     * {"name":"UserDO","filename":"src/DataObject/Test/UserDO.php","fullName":"\\MyProject\\DataObject\\Test\\UserDO","table":"user","fileType":"dataModel"}
     */
    const {filename} = elt
    addFileToTree(treeRoot.children, filename.split('/'), elt, treeNodeFn)
  })

  if (queries.length === 0) {
    return treeRoot
  }
  const baseDAOMeta = getBaseDAOMeta()
  addFileToTree(treeRoot.children, baseDAOMeta.filename.split('/'), {
    ...baseDAOMeta,
    fileType: 'mySpotBaseDAO'
  }, treeNodeFn)

  queries.forEach(elt => {
    /** example data **/
    /**
     const elt = {
       'configurationFilename': 'config/myspot/test/comment.php',
       'daoFilename': 'src/DAO/Test/CommentDAO.php',
       'params': {
         'argsType': 'plain',
         'columns': [
           {
             'comment': '',
             'defaultValue': null,
             'extra': 'auto_increment',
             'key': 'PRI',
             'name': 'id',
             'nullable': false,
             'required': false,
             'type': 'int(11)'
           }
         ],
         'fields': [],
         'limitType': 'no',
         'order': [],
         'queryName': 'select',
         'queryType': 'select',
         'returnType': 'do',
         'sqlTemplate': 'SELECT * FROM `test`.`comment`',
         'sqlTemplateInline': 'SELECT * FROM `test`.`comment`',
         'where': []
       },
       'queryName': 'select',
       'table': 'comment'
     }
     */
    const {configurationFilename, daoFilename} = elt
    addFileToTree(
      treeRoot.children,
      configurationFilename.split('/'),
      {
        fileType: 'mySpotConfigurations',
        params: {filename: elt.configurationFilename, configs: [elt.params]},
        table: elt.table
      },
      treeNodeFn
    )
    addFileToTree(
      treeRoot.children,
      daoFilename.split('/'),
      {
        fileType: 'mySpotDAOs',
        table: elt.table,
        params: {
          functions: [{
            ...elt.params
          }]
        }
      },
      treeNodeFn
    )
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
