import Item from './item'
import Context from './context'

export default class Group extends Item {
  constructor(groupConfig, contexts, parent) {
    super(groupConfig)

    this.parent = parent
    this.exclusive = !!groupConfig.exclusive

    // Keep backwards compatibility (pre allowDisableAll)
    if (groupConfig.exclusive) {
      if (typeof groupConfig.allowDisableAll === 'undefined') this.allowDisableAll = true
      else this.allowDisableAll = !!groupConfig.allowDisableAll
    }

    this.items = (groupConfig.items || []).map(item => {
      if (typeof item.context !== 'undefined') { // item.context might be 0
        // Create a dummy context if not found in the contexts array
        const context = contexts.find(c => c.originalId === item.context) ||
                        new Context({ id: item.context, label: item.context })
        context.parent = this

        return context
      }
      return item.group && new Group(item.group, contexts, this)
    })
  }
}
