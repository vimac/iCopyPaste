import doT from 'dot'
import fs from 'fs'
import path from 'path'

doT.templateSettings.strip = false
export const getTemplateRender = (f) => doT.template(fs.readFileSync(path.join(__static, f), 'utf8'))
export default doT
