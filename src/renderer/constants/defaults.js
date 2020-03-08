const projectName = 'My Awesome Project'
const projectRootDir = 'MyAwesomeProject'
export const defaultTarget = 'myspot'
export const mySpotDefaults = {
  projectName,
  projectRootDir,
  // eslint-disable-next-line no-template-curly-in-string
  root: 'MyProject',
  // eslint-disable-next-line no-template-curly-in-string
  srcRoot: 'src',
  // eslint-disable-next-line no-template-curly-in-string
  configRoot: 'config',
  // eslint-disable-next-line no-template-curly-in-string
  doSuffix: 'DO',
  // eslint-disable-next-line no-template-curly-in-string
  doNamespace: '${root}\\DataObject\\${database}',
  // eslint-disable-next-line no-template-curly-in-string
  daoSuffix: 'DAO',
  // eslint-disable-next-line no-template-curly-in-string
  daoNamespace: '${root}\\DAO\\${database}',
  // eslint-disable-next-line no-template-curly-in-string
  baseDaoNamespace: '${root}\\DAO'
}
export const myBatisDefaults = {
  projectName,
  projectRootDir,
  // eslint-disable-next-line no-template-curly-in-string
  xmlPath: 'src/main/resources/mybatis/mapper/${database}',
  // eslint-disable-next-line no-template-curly-in-string
  xmlSuffix: 'Mapper',
  // eslint-disable-next-line no-template-curly-in-string
  codeRoot: 'src/main/java',
  // eslint-disable-next-line no-template-curly-in-string
  rootPackage: 'com.example.awesomeproject',
  // eslint-disable-next-line no-template-curly-in-string
  doSuffix: 'DO',
  // eslint-disable-next-line no-template-curly-in-string
  doPackage: '$root.datamodel.${database}',
  // eslint-disable-next-line no-template-curly-in-string
  daoSuffix: 'DAO',
  // eslint-disable-next-line no-template-curly-in-string
  daoPackage: '${root}.dao.${database}',
  // eslint-disable-next-line no-template-curly-in-string
  getterSetter: 'lombokData',
  enableAnnotations: ['lombokAllArgsConstructor', 'lombokNoArgsConstructor', 'lombokBuilder']
}
