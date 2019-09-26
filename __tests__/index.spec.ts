/* eslint-disable no-unused-vars */
import VueCompositionApi from '@vue/composition-api'
import fakePromise from 'faked-promise'
import Vue from 'vue'
// @ts-ignore
import MultipleChildrenHelper from './utils/MultipleChildrenHelper.vue'
// @ts-ignore
import CombinedMultipleChildren from './utils/CombinedMultipleChildren.vue'

Vue.use(VueCompositionApi)

// keep a real setTimeout
const timeout = setTimeout
const tick = () => new Promise(resolve => timeout(resolve, 0))
jest.useFakeTimers()

function factory(
  component: any,
  { pendingDelay = 0, startAsNull = false } = {}
) {
  const el = document.createElement('div')
  el.textContent = 'hey'
  document.body.appendChild(el)
  const [promise, resolve, reject] = fakePromise()
  const vm = new Vue({
    el,
    data: { promise: startAsNull ? null : promise, pendingDelay },
    render(h) {
      return h(component, {
        props: { promise: this.promise, pendingDelay: this.pendingDelay },
      })
    },
  })

  return { vm, promise, resolve, reject, el }
}

function combinedFactory(options?: Parameters<typeof factory>[1]) {
  return factory(CombinedMultipleChildren, options)
}

function multipleFactory(options?: Parameters<typeof factory>[1]) {
  return factory(MultipleChildrenHelper, options)
}

describe('Promised', () => {
  beforeEach(() => {
    jest.runAllTimers()
  })

  describe('three slots', () => {
    it('displays pending', async () => {
      const { vm } = multipleFactory()
      expect(vm.$el.textContent).toMatchInlineSnapshot(`"pending"`)
    })

    it('displays the resolved value once resolved', async () => {
      const { vm, resolve } = multipleFactory()
      resolve('foo')
      await tick()
      expect(vm.$el.textContent).toBe('foo')
    })

    it('displays an error if rejected', async () => {
      const { vm, reject } = multipleFactory()
      reject(new Error('hello'))
      await tick()
      expect(vm.$el.textContent).toBe('hello')
    })

    it('cancels previous promise', async () => {
      const { vm, resolve } = multipleFactory()
      const other = fakePromise()
      vm.promise = other[0]
      resolve('foo')
      await tick()
      expect(vm.$el.textContent).toBe('pending')
    })

    it('cancels previous rejected promise', async () => {
      const { vm, reject } = multipleFactory()
      const other = fakePromise()
      vm.promise = other[0]
      reject(new Error('failed'))
      await tick()
      expect(vm.$el.textContent).toBe('pending')
    })

    describe('pendingDelay', () => {
      it.skip('displays nothing before the delay', async () => {
        const { vm } = multipleFactory({ pendingDelay: 1 })
        expect(vm.$el.textContent).toBe('')
        jest.advanceTimersByTime(10)
        // jest.runOnlyPendingTimers()
        await tick()
        expect(vm.$el.textContent).toBe('pending')
      })

      it.skip('custom pendingDelay', async () => {
        const { vm } = multipleFactory({ pendingDelay: 200 })
        expect(setTimeout).toHaveBeenCalledTimes(1)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 200)
        const [promise] = fakePromise()
        vm.pendingDelay = 100
        vm.promise = promise
        await tick()
        expect(setTimeout).toHaveBeenCalledTimes(2)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 100)
      })

      it('cancels previous timeouts', async () => {
        const { vm } = multipleFactory({ pendingDelay: 1 })
        expect(clearTimeout).not.toHaveBeenCalled()
        const [promise] = fakePromise()
        vm.promise = promise
        await tick()
        expect(clearTimeout).toHaveBeenCalled()
      })

      it.skip('cancels timeout when promise is set to null', async () => {
        const { vm } = multipleFactory({ pendingDelay: 1 })
        // TODO: why is this called?
        expect(clearTimeout).not.toHaveBeenCalled()
        vm.promise = null
        await tick()
        expect(clearTimeout).toHaveBeenCalledTimes(1)
      })
    })

    describe('errors', () => {
      let errorSpy: jest.SpyInstance
      beforeEach(() => {
        // silence the log
        errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {
          // useful for debugging
          // console.log('CONSOLE ERROR')
        })
      })

      afterEach(() => {
        errorSpy.mockRestore()
      })
    })

    describe('combined slot', () => {
      let errorSpy: jest.SpyInstance
      beforeEach(() => {
        // silence the log
        errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {
          // useful for debugging
          // console.log('CONSOLE ERROR')
        })
      })

      afterEach(() => {
        errorSpy.mockRestore()
      })

      it('displays initial state', () => {
        const { vm } = combinedFactory()
        expect(vm.$el.textContent!.trim()).toBe('true true')
      })

      it('displays data when resolved', async () => {
        const { vm, resolve } = combinedFactory()
        resolve('foo')
        await tick()
        expect(vm.$el.querySelector('.pending')!.textContent).toBe('false')
        expect(vm.$el.querySelector('.delay')!.textContent).toBe('true')
        expect(vm.$el.querySelector('.data')!.textContent).toBe('foo')
      })

      it('works with no promise', () => {
        const { vm } = combinedFactory({ startAsNull: true })
        expect(vm.$el.textContent!.trim()).toBe('true false')
      })

      it('displays an error if rejected', async () => {
        const { vm, reject } = combinedFactory()
        reject(new Error('hello'))
        await tick()
        expect(vm.$el.querySelector('.pending')!.textContent).toBe('false')
        expect(vm.$el.querySelector('.delay')!.textContent).toBe('true')
        expect(vm.$el.querySelector('.error')!.textContent).toBe('hello')
        expect(vm.$el.querySelector('.data')!.textContent).toBe('')
      })

      it('data contains previous data in between calls', async () => {
        const { vm, resolve } = combinedFactory()

        resolve('foo')
        await tick()
        expect(vm.$el.querySelector('.pending')!.textContent).toBe('false')
        expect(vm.$el.querySelector('.delay')!.textContent).toBe('true')
        expect(vm.$el.querySelector('.data')!.textContent).toBe('foo')

        const [promise, resolve2] = fakePromise()

        vm.promise = promise
        await tick()

        resolve2('bar')
        expect(vm.$el.querySelector('.pending')!.textContent).toBe('true')
        expect(vm.$el.querySelector('.delay')!.textContent).toBe('true')
        expect(vm.$el.querySelector('.data')!.textContent).toBe('foo')

        await tick()

        expect(vm.$el.querySelector('.pending')!.textContent).toBe('false')
        expect(vm.$el.querySelector('.delay')!.textContent).toBe('true')
        expect(vm.$el.querySelector('.data')!.textContent).toBe('bar')
      })

      it('data is reset when promise is set to null', async () => {
        const { vm, resolve } = combinedFactory()

        resolve('foo')
        await tick()
        expect(vm.$el.querySelector('.pending')!.textContent).toBe('false')
        expect(vm.$el.querySelector('.delay')!.textContent).toBe('true')
        expect(vm.$el.querySelector('.data')!.textContent).toBe('foo')

        vm.promise = null
        await tick()

        expect(vm.$el.textContent!.trim()).toBe('true false')
      })

      it.skip('throws if slot is empty', () => {
        expect(errorSpy).not.toHaveBeenCalled()
        expect(() => {
          // wrapper = mount(Promised, {
          //   scopedSlots: {
          //     combined: '<template></template>',
          //   },
          //   propsData: { promise: null, pendingDelay: 0 },
          // })
        }).toThrow(/Provided scoped slot "combined" cannot be empty/)
        expect(errorSpy).toHaveBeenCalledTimes(2)
      })

      it.skip('allows multiple nodes', async () => {})

      it('can be resolved right away', async () => {
        const { vm } = combinedFactory({ startAsNull: true })
        vm.promise = Promise.resolve('hello')

        await tick()
        expect(vm.$el.querySelector('.pending')!.textContent).toBe('false')
        expect(vm.$el.querySelector('.delay')!.textContent).toBe('true')
        expect(vm.$el.querySelector('.data')!.textContent).toBe('hello')
      })
    })
  })
})
