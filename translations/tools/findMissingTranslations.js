const fs = require('fs')
const task = require('./task')

const { reduce, map, union, isEmpty } = require('lodash')

function findMissingTranslations () {
  const translations = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))
  const keys = reduce(translations, (moduleAcc, languages, moduleKey) => {
    const keysPerLanguage = map(languages, values => Object.keys(values))
    moduleAcc[moduleKey] = union(...keysPerLanguage)
    return moduleAcc
  }, {})

  const missingKeys = reduce(translations, (moduleAcc, languages, moduleKey) => {
    const missingKeysInModule = reduce(languages, (languageAcc, languageKeys, languageKey) => {
      const missingKeysInLanguage = keys[moduleKey].filter(key => !languageKeys[key])
      if (!isEmpty(missingKeysInLanguage)) {
        languageAcc[languageKey] = missingKeysInLanguage
      }

      return languageAcc
    }, {})

    if (!isEmpty(missingKeysInModule)) {
      moduleAcc[moduleKey] = missingKeysInModule
    }
    return moduleAcc
  }, {})

  return missingKeys
}

module.exports = task('findMissingTranslations', () => {
  return Promise.resolve(findMissingTranslations())
    .then(translations => console.log(translations))
})