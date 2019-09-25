import { reactive, ref, watch, Ref } from '@vue/composition-api'

interface Options<T> {
  pendingDelay?: number | Ref<number>
  promise?: Promise<T> | Ref<Promise<T>>
}

export function usePromise<T>(options: Readonly<Options<T>> = {}) {
  const state = reactive({
    promise: ref<Promise<T> | null>(options.promise || null),
    isPending: ref(true),
    data: ref<T | null>(null),
    error: ref<Error | null>(null),
    isDelayOver: ref(false),
  })

  let timerId: ReturnType<typeof setTimeout> | null = null

  // reactive to have automatic unwrapping
  const localOptions = reactive({
    pendingDelay: options.pendingDelay == null ? 200 : options.pendingDelay,
  })

  function setupDelay() {
    if (localOptions.pendingDelay > 0) {
      state.isDelayOver = false
      if (timerId) clearTimeout(timerId)
      timerId = setTimeout(
        () => (state.isDelayOver = true),
        localOptions.pendingDelay
      )
    } else {
      state.isDelayOver = true
    }
  }

  watch(
    () => state.promise,
    newPromise => {
      state.isPending = true
      state.error = null
      if (!newPromise) {
        state.data = null
        state.isDelayOver = false
        if (timerId) clearTimeout(timerId)
        timerId = null
        return
      }

      setupDelay()

      newPromise
        .then(value => {
          // ensure we are dealing with the same promise
          if (state.promise === newPromise) {
            // @ts-ignore seems to be a bug in @vue/composition-api
            state.data = value
            state.isPending = false
          }
        })
        .catch(err => {
          // ensure we are dealing with the same promise
          if (state.promise === newPromise) {
            state.error = err
            state.isPending = false
          }
        })
    }
  )

  return {
    state,

    options: localOptions,

    set: (p: Promise<T>) => (state.promise = p),
  }
}
