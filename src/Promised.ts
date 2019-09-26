import { assert } from './utils'
import { usePromise } from './usePromise'
import { watch } from '@vue/composition-api'
import {
  createComponent,
  createElement as h,
  SetupContext,
} from '@vue/composition-api'

function getSlotVNode(
  slots: SetupContext['slots'],
  slotName: string,
  data: any
) {
  assert(!!slots[slotName], `No slot "${slotName}" provided`)
  const nodes = slots[slotName](data)
  assert(nodes.length > 0, `Provided scoped slot "${slotName}" is empty`)
  return nodes
}

const realPromiseProp = {
  type: Promise,
  required: true,
}

export const Promised = createComponent({
  props: {
    tag: {
      type: String,
      default: 'span',
    },
    promise: ({
      // type: Promise,
      // required: true,
      // allow polyfied Promise
      validator: (p: any) =>
        p && typeof p.then === 'function' && typeof p.catch === 'function',
    } as unknown) as typeof realPromiseProp,
    pendingDelay: {
      type: Number,
      default: 200,
    },
  },

  setup(props, { slots }) {
    const promised = usePromise({
      pendingDelay: props.pendingDelay,
      promise: props.promise,
    })

    watch(
      () => props.promise,
      promise => {
        // @ts-ignore
        promised.state.promise = promise
      }
    )

    return () => {
      if (slots.combined) {
        const node = slots.combined({
          ...promised.state,
        })
        assert(
          node.length > 0,
          'Provided scoped slot "combined" cannot be empty'
        )
        return node[0]
      }

      if (promised.state.error) {
        return getSlotVNode(slots, 'rejected', promised.state.error)
      }

      if (!promised.state.isPending) {
        return getSlotVNode(slots, 'default', promised.state.data)
      }

      if (!promised.state.isDelayOver) return h()

      return getSlotVNode(slots, 'pending', promised.state.data)
    }
  },
})
