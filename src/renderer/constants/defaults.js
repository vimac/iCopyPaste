const projectName = 'My Awesome Project'
const projectRootDir = 'MyAwesomeProject'
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
