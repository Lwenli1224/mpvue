import Vue from 'vue'
import injectStyles from '../transition/inject-styles'
import { isIE9 } from 'web/util/index'
import { nextFrame } from 'web/runtime/modules/transition'

describe('Component keep-alive', () => {
  const duration = injectStyles()
  let components, one, two, el
  beforeEach(() => {
    one = {
      template: '<div>one</div>',
      created: jasmine.createSpy('one created'),
      mounted: jasmine.createSpy('one mounted'),
      activated: jasmine.createSpy('one activated'),
      deactivated: jasmine.createSpy('one deactivated')
    }
    two = {
      template: '<div>two</div>',
      created: jasmine.createSpy('two created'),
      mounted: jasmine.createSpy('two mounted'),
      activated: jasmine.createSpy('two activated'),
      deactivated: jasmine.createSpy('two deactivated')
    }
    components = {
      one,
      two
    }
    el = document.createElement('div')
    document.body.appendChild(el)
  })

  function assertHookCalls (component, callCounts) {
    expect([
      component.created.calls.count(),
      component.mounted.calls.count(),
      component.activated.calls.count(),
      component.deactivated.calls.count()
    ]).toEqual(callCounts)
  }

  it('should work', done => {
    const vm = new Vue({
      template: '<div><component :is="view" keep-alive></component></div>',
      data: {
        view: 'one'
      },
      components
    }).$mount()
    expect(vm.$el.textContent).toBe('one')
    assertHookCalls(one, [1, 1, 1, 0])
    assertHookCalls(two, [0, 0, 0, 0])
    vm.view = 'two'
    waitForUpdate(() => {
      expect(vm.$el.textContent).toBe('two')
      assertHookCalls(one, [1, 1, 1, 1])
      assertHookCalls(two, [1, 1, 1, 0])
      vm.view = 'one'
    }).then(() => {
      expect(vm.$el.textContent).toBe('one')
      assertHookCalls(one, [1, 1, 2, 1])
      assertHookCalls(two, [1, 1, 1, 1])
      vm.view = 'two'
    }).then(() => {
      expect(vm.$el.textContent).toBe('two')
      assertHookCalls(one, [1, 1, 2, 2])
      assertHookCalls(two, [1, 1, 2, 1])
    }).then(done)
  })

  if (!isIE9) {
    it('with transition-mode out-in', done => {
      let next
      const vm = new Vue({
        template: `<div>
          <component
            :is="view"
            class="test"
            keep-alive
            transition="test"
            transition-mode="out-in">
          </component>
        </div>`,
        data: {
          view: 'one'
        },
        components,
        transitions: {
          test: {
            afterLeave () {
              next()
            }
          }
        }
      }).$mount(el)
      expect(vm.$el.textContent).toBe('one')
      assertHookCalls(one, [1, 1, 1, 0])
      assertHookCalls(two, [0, 0, 0, 0])
      vm.view = 'two'
      waitForUpdate(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-leave">one</div>'
        )
        assertHookCalls(one, [1, 1, 1, 1])
        assertHookCalls(two, [0, 0, 0, 0])
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-leave-active">one</div>'
        )
      }).thenWaitFor(_next => { next = _next }).then(() => {
        expect(vm.$el.innerHTML).toBe('')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-enter">two</div>'
        )
        assertHookCalls(one, [1, 1, 1, 1])
        assertHookCalls(two, [1, 1, 1, 0])
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-enter-active">two</div>'
        )
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test">two</div>'
        )
        assertHookCalls(one, [1, 1, 1, 1])
        assertHookCalls(two, [1, 1, 1, 0])
      }).then(() => {
        vm.view = 'one'
      }).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-leave">two</div>'
        )
        assertHookCalls(one, [1, 1, 1, 1])
        assertHookCalls(two, [1, 1, 1, 1])
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-leave-active">two</div>'
        )
      }).thenWaitFor(_next => { next = _next }).then(() => {
        expect(vm.$el.innerHTML).toBe('')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-enter">one</div>'
        )
        assertHookCalls(one, [1, 1, 2, 1])
        assertHookCalls(two, [1, 1, 1, 1])
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-enter-active">one</div>'
        )
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test">one</div>'
        )
        assertHookCalls(one, [1, 1, 2, 1])
        assertHookCalls(two, [1, 1, 1, 1])
      }).then(done)
    })

    it('with transition-mode in-out', done => {
      let next
      const vm = new Vue({
        template: `<div>
          <component
            :is="view"
            class="test"
            keep-alive
            transition="test"
            transition-mode="in-out">
          </component>
        </div>`,
        data: {
          view: 'one'
        },
        components,
        transitions: {
          test: {
            afterEnter () {
              next()
            }
          }
        }
      }).$mount(el)
      expect(vm.$el.textContent).toBe('one')
      assertHookCalls(one, [1, 1, 1, 0])
      assertHookCalls(two, [0, 0, 0, 0])
      vm.view = 'two'
      waitForUpdate(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test">one</div>' +
          '<div class="test test-enter">two</div>'
        )
        assertHookCalls(one, [1, 1, 1, 1])
        assertHookCalls(two, [1, 1, 1, 0])
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test">one</div>' +
          '<div class="test test-enter-active">two</div>'
        )
      }).thenWaitFor(_next => { next = _next }).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test">one</div>' +
          '<div class="test">two</div>'
        )
      }).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-leave">one</div>' +
          '<div class="test">two</div>'
        )
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-leave-active">one</div>' +
          '<div class="test">two</div>'
        )
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test">two</div>'
        )
        assertHookCalls(one, [1, 1, 1, 1])
        assertHookCalls(two, [1, 1, 1, 0])
      }).then(() => {
        vm.view = 'one'
      }).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test">two</div>' +
          '<div class="test test-enter">one</div>'
        )
        assertHookCalls(one, [1, 1, 2, 1])
        assertHookCalls(two, [1, 1, 1, 1])
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test">two</div>' +
          '<div class="test test-enter-active">one</div>'
        )
      }).thenWaitFor(_next => { next = _next }).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test">two</div>' +
          '<div class="test">one</div>'
        )
      }).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-leave">two</div>' +
          '<div class="test">one</div>'
        )
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-leave-active">two</div>' +
          '<div class="test">one</div>'
        )
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test">one</div>'
        )
        assertHookCalls(one, [1, 1, 2, 1])
        assertHookCalls(two, [1, 1, 1, 1])
      }).then(done)
    })
  }
})