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
          path: 'project',
          name: 'ProjectPage',
          component: require('../components/MainPage/ProjectPage').default,
          children: [
            {
              path: 'files',
              name: 'ProjectFiles',
              component: require('../components/Project/ProjectFiles').default
            },
            {
              path: 'settings',
              name: 'ProjectSettings',
              component: require('../components/Project/ProjectSettings').default
            }
          ]
        },
        {
          path: 'model',
          name: 'ModelPage',
          component: require('../components/MainPage/ModelPage').default
        },
        {
          path: 'query',
          name: 'QueryPage',
          component: require('../components/MainPage/QueryPage').default,
          children: [
            {
              path: '',
              name: 'AddedQueries',
              component: require('../components/Query/AddedQueries').default
            },
            {
              path: ':table',
              name: 'QueryForm',
              component: require('../components/Query/QueryForm').default
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
