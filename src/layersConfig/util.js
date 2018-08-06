import { languages } from 'config'

export function getLocalizedLabels(labelObj, defaultText) {
  labelObj = labelObj || []
  const ret = []

  // Get the labels from the label object
  labelObj.forEach(l => {
    if (l.language) ret.push({ language: l.language, label: l.label || defaultText })
  })

  // Add the missing labels, based on the languages array
  languages.forEach(lang => {
    if (!ret.find(l => l.language === lang.id)) {
      ret.push({ language: lang.id, label: defaultText })
    }
  })
  return ret
}
