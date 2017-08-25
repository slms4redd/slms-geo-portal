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

Vue.i18n.add('en', translationsEn)

describe('Banner.vue', (done) => {
  const Constructor = Vue.extend(Banner, store)
  const vm = new Constructor().$mount()
  it('displays title and subtitles', () => {
    expect(vm.$el.querySelector('#title h1').textContent)
      .to.equal('This is the title')
    expect(vm.$el.querySelector('#title h2').textContent)
      .to.equal('This is the subtitle')
  })
})
