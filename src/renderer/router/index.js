import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/landing'
    },
    {
      path: '/landing',
      name: 'LandingPage',
      component: require('../components/LandingPage').default
    },
    {
      path: '/workspace',
      name: 'Workspace',
      component: require('../components/Workspace').default,
      children: [
        {
          path: 'model',
          name: 'ModelPage',
          component: require('../components/MainPage/ModelPage').default
        },
        {
          path: 'query',
          component: require('../components/MainPage/QueryPage').default,
          children: [
            {
              path: '',
              name: 'Empty',
              component: require('../components/Dashboard/Empty').default
            },
            {
              path: ':table',
              name: 'WorkingPanel',
              component: require('../components/Dashboard/WorkingPanel').default
            }
          ]
        }
      ]
    },
    {
      path: '*',
      redirect: '/landing'
    }
  ]
})
