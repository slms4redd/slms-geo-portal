import Vue from 'vue'
import Banner from '@/components/Banner'
import Vuex from 'vuex'
import store from '@/store'
import I18n from '@/I18n'

Vue.use(I18n.plugin, store)
Vue.use(Vuex)
Vue.i18n.set('en')

const translationsEn = {
  banner: {
    title: 'This is the title',
    subtitle: 'This is the subtitle'
  }
}

const translationsEnTitle = {
  banner: {
    title: 'This is the title'
  }
}

describe('Banner.vue', (done) => {
  it('displays title and subtitles', () => {
    Vue.i18n.replace('en', translationsEn)
    const Constructor = Vue.extend(Banner, store)
    const vm = new Constructor().$mount()
    expect(vm.$el.querySelector('#title h1').textContent)
      .to.equal('This is the title')
    expect(vm.$el.querySelector('#title h2').textContent)
      .to.equal('This is the subtitle')
  })

  it('displays title only', () => {
    Vue.i18n.replace('en', translationsEnTitle)
    const Constructor = Vue.extend(Banner, store)
    const vm = new Constructor().$mount()
    expect(vm.$el.querySelector('#title h1').textContent)
      .to.equal('This is the title')
    should.not.exist(vm.$el.querySelector('#title h2'))
  })
})
