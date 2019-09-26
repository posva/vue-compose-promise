<template>
  <Promised v-bind="$props" v-slot:combined="props">
    <div>
      <span class="pending">{{ props.isPending }}</span>
      <span class="delay">{{ props.isDelayOver }}</span>
      <span class="data">{{ props.data }}</span>
      <span class="error">{{ props.error && props.error.message }}</span>
    </div>
  </Promised>
</template>

<script>
import { Promised } from '../../src'

export default {
  props: ['promise', 'pendingDelay', 'tag'],
  components: { Promised },
}
</script>
