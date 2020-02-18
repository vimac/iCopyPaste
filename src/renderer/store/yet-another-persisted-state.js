import merge from 'deepmerge'
import Store from 'electron-store'

const STORAGE_NAME = 'vuex'
const STORAGE_KEY = 'state'
const STORAGE_TEST_KEY = 'test'

class YetAnotherPersistedState {
  constructor (options, store) {
    this.options = options
    this.store = store
  }

  loadOptions () {
    if (!this.options.storage) this.options.storage = this.createStorage()
    if (!this.options.storageKey) this.options.storageKey = STORAGE_KEY

    this.whitelist = this.options.whitelist || []
  }

  createStorage () {
    return new Store({name: this.options.storageName || STORAGE_NAME})
  }

  getState () {
    return this.options.storage.get(this.options.storageKey)
  }

  setState (state, whitelist) {
    let targetState = {}
    whitelist.forEach(({watchStateKey}) => {
      targetState[watchStateKey] = state[watchStateKey]
    })
    this.options.storage.set(this.options.storageKey, targetState)
  }

  checkStorage () {
    try {
      this.options.storage.set(STORAGE_TEST_KEY, STORAGE_TEST_KEY)
      this.options.storage.get(STORAGE_TEST_KEY)
      this.options.storage.delete(STORAGE_TEST_KEY)
    } catch (error) {
      throw new Error('[Vuex Electron] Storage is not valid. Please, read the docs.')
    }
  }

  combineMerge (target, source, options) {
    const emptyTarget = (value) => (Array.isArray(value) ? [] : {})
    const clone = (value, options) => merge(emptyTarget(value), value, options)
    const destination = target.slice()

    source.forEach(function (e, i) {
      if (typeof destination[i] === 'undefined') {
        const cloneRequested = options.clone !== false
        const shouldClone = cloneRequested && options.isMergeableObject(e)
        destination[i] = shouldClone ? clone(e, options) : e
      } else if (options.isMergeableObject(e)) {
        destination[i] = merge(target[i], e, options)
      } else if (target.indexOf(e) === -1) {
        destination.push(e)
      }
    })

    return destination
  }

  loadInitialState () {
    const state = this.getState(this.options.storage, this.options.storageKey)

    if (state) {
      const mergedState = merge(this.store.state, state, {arrayMerge: this.combineMerge})
      this.store.replaceState(mergedState)
    }
  }

  subscribeOnChanges () {
    this.store.subscribe((mutationPayload, state) => {
      // if (this.whitelist && !this.whitelist(mutation)) return
      let pass = this.whitelist.filter(({mutation}) => {
        return mutationPayload.type === mutation
      })

      if (pass.length > 0) {
        this.setState(state, pass)
      }
    })
  }
}

export default (options = {}) => (store) => {
  const persistedState = new YetAnotherPersistedState(options, store)

  persistedState.loadOptions()
  persistedState.checkStorage()
  persistedState.loadInitialState()
  persistedState.subscribeOnChanges()
}
