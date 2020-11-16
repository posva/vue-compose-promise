# Use [Vue Promised](https://github.com/posva/vue-promised) instead

It supports Vue 2 and Vue 3

---

# vue-compose-promise [![Build Status](https://badgen.net/circleci/github/posva/vue-compose-promise)](https://circleci.com/gh/posva/vue-compose-promise) [![npm package](https://badgen.net/npm/v/vue-compose-promise)](https://www.npmjs.com/package/vue-compose-promise) [![coverage](https://badgen.net/codecov/c/github/posva/vue-compose-promise)](https://codecov.io/github/posva/vue-compose-promise) [![thanks](https://badgen.net/badge/thanks/♥/pink)](https://github.com/posva/thanks)

> Easily manipulate Promises and their state in Vue

**Depends on [@vue/composition-api](https://github.com/vuejs/composition-api)**

[CodeSandbox demo](https://codesandbox.io/s/vue-compose-promise-example-toum7)

## Installation

```sh
npm install vue-compose-promise
```

## Usage

```vue
<template>
  <div>
    <span> Is the promise still pending: {{ usersPromise.isPending }} </span>
    <span> Is the 200ms delay over: {{ usersPromise.isDelayOver }} </span>
    <span>
      Last successfully resolved data from the promise: {{ usersPromise.data }}
    </span>
    <span> Error if current promise failed: {{ usersPromise.error }} </span>
  </div>
</template>

<script>
import { createComponent } from '@vue/composition-api'
import { usePromise } from 'vue-compose-promise'

export default createComponent({
  setup() {
    const promised = usePromise({ pendingDelay: 200, promise: fetchUsers() })

    return {
      usersPromise: promised.state,

      fetchUsers() {
        promised.state.promise = fetchUsers()
      },
    }
  },
})
</script>
```

Both, `pendingDelay` and `promise` can be reactive values like a _computed_ property, a _ref_ or a _prop_:

```js
const search = ref('')
const usersPromise = computed(() => featchUsers(search.value))
const promised = usePromise({
  pendingDelay: props.displayLoaderDelay,
  promise: usersPromise,
})
```

## API

### `usePromise<T>(options?: { pendingDelay?: number | Ref<number>; promise?: Promise<T> | Ref<Promise<T>> })`

- `options`
  - `pendingDelay`: amount of time in _ms_ that should be wait whenever the a new promise is pending. This allows delaying the display of a loader to avoid flashing the screen. Can be a _reactive_ property.
  - `promise`: initial promise. Can be null. Can be a _reactive_ property.

## Related

- [vue-promised](https://github.com/posva/vue-promised)
- [@vue/composition-api](https://github.com/vuejs/composition-api)

## License

[MIT](http://opensource.org/licenses/MIT)
