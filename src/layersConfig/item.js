import { getLocalizedLabels } from './util'

export default class Item {
  constructor(conf) {
    this.id = Item.nextId++
    this.infoFile = conf.infoFile || null
    this.labels = getLocalizedLabels(conf.labels)
  }

  recReduce(fn, val) {
    return this.items.reduce((acc, item) => item.isGroup ? item.recReduce(fn, acc) : fn(acc, item), val)
  }

  findById(id) {
    if (this.id === id) return this
    return this.isGroup && this.items.reduce((found, item) => found || item.findById(id), null)
  }

  get isGroup() {
    return !!this.items
  }

  static nextId = 0
}
