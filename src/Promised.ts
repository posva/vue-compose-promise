import { assert } from './utils'
import { usePromise } from './usePromise'
import { createComponent } from '@vue/composition-api'
import { CreateElement, VNode } from 'vue'

function convertVNodeArray(
  h: CreateElement,
  wrapperTag: string,
  nodes: VNode[]
) {
  // for arrays and single text nodes
  if (nodes.length > 1 || !nodes[0].tag) return h(wrapperTag, {}, nodes)
  return nodes[0]
}

function getSlotVNode(vm: any, h: CreateElement, slotName: string, data: any) {
  // use scopedSlots if available
  if (vm.$scopedSlots[slotName]) {
    const node = vm.$scopedSlots[slotName](data)
    assert(
      (Array.isArray(node) && node.length) || node,
      `Provided scoped slot "${slotName}" is empty`
    )
    return Array.isArray(node) ? convertVNodeArray(h, vm.tag, node) : node
  }

  const slot = vm.$slots[slotName]
  assert(slot, `No slot "${slotName}" provided`)
  // 2.5.x compatibility
  assert(slot.length, `Provided slot "${slotName}" is empty`)
  return convertVNodeArray(h, vm.tag, slot)
}

export const Promised = createComponent({
  props: {
    tag: {
      type: String,
      default: 'span',
    },
    promise: {
      // allow polyfied Promise
      validator: p =>
        p && typeof p.then === 'function' && typeof p.catch === 'function',
    },
    pendingDelay: {
      type: Number,
      default: 200,
    },
  },

  // @ts-ignore
  setup(props) {
    const promised = usePromise({
      pendingDelay: props.pendingDelay,
      promise: props.promise,
    })

    return {
      ...promised.state,
    }
  },

  render(h) {
    // @ts-ignore
    if (this.$scopedSlots.combined) {
      // @ts-ignore
      const node = this.$scopedSlots.combined({
        // @ts-ignore
        isPending: this.isPending,
        // @ts-ignore
        isDelayOver: this.isDelayOver,
        data: this.data,
        // @ts-ignore
        error: this.error,
      })
      assert(
        (Array.isArray(node) && node.length) || node,
        'Provided scoped slot "combined" cannot be empty'
      )
      // @ts-ignore
      return Array.isArray(node) ? convertVNodeArray(h, this.tag, node) : node
    }

    // @ts-ignore
    if (this.error) {
      // @ts-ignore
      return getSlotVNode(this, h, 'rejected', this.error)
    }

    // @ts-ignore
    if (!this.isPending) {
      return getSlotVNode(this, h, 'default', this.data)
    }

    // @ts-ignore
    if (!this.isDelayOver) return h()

    return getSlotVNode(this, h, 'pending', this.data)
  },
})
