<template>
  <Promised v-bind="$props">
    <template slot="pending">
      <span>pending</span>
    </template>
    <!-- The default scoped slots will be used as the result -->
    <template slot-scope="data">
      <span>{{ data }}</span>
    </template>
    <!-- The 'catch' named scoped slots will be used if there is an error -->

    <template slot="rejected" slot-scope="error">
      <span>{{ error.message }}</span>
    </template>
  </Promised>
</template>

<script>
import { Promised } from '../../src'

export default {
  props: ['promise', 'pendingDelay', 'tag'],
  components: { Promised },
}
</script>
