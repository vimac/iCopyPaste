import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/landing',
      name: 'LandingPage',
      component: require('@/components/LandingPage').default
    },
    {
      path: '/dashboard/',
      component: require('@/components/Dashboard').default,
      children: [
        {
          path: '',
          name: 'Dashboard',
          component: require('@/components/Dashboard/Empty').default
        },
        {
          path: ':table',
          name: 'WorkingPanel',
          component: require('@/components/Dashboard/WorkingPanel').default
        }
      ]
    },
    {
      path: '*',
      redirect: '/landing'
    }
  ]
})
