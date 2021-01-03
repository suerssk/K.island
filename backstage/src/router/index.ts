import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from '../views/index.vue'
import { getStorageToken } from '@/utils/util'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'island',
    redirect: '/overview',
    component: Home,
    children: [{
      path: 'overview',
      name: 'Overview',
      meta: {
        title: '嗐！瞧瞧这人气'
      },
      component: () => import('../views/Overview/index.vue')
    }, {
      path: 'add',
      name: 'Add',
      meta: {
        title: '叮！新品上架哦'
      },
      component: () => import('../views/AddRecord/index.vue')
    }, {
      path: 'management',
      name: 'Management',
      meta: {
        title: '哗！杂货翻新啦'
      },
      component: () => import('../views/ManageRecords/index.vue')
    }, {
      path: 'reply',
      name: 'Reply',
      meta: {
        title: '噔噔噔！聊个五毛钱的天？'
      },
      component: () => import('../views/ConcatReply/index.vue')
    }]
  },
  {
    path: '/login',
    name: 'Login',
    meta: {
      requireAuth: true,
      title: '嘀！加油站'
    },
    component: () => import('../views/Login.vue')
  },
  {
    path: '/:catchAll(.*)',
    name: 'NotFound',
    meta: {
      title: '诶？！你迷路了吗'
    },
    component: () => import('../views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const token = getStorageToken() // null | token
  // 去往非登录页且无 token
  if (!to.path.includes('login') && !token) {
    next('/login')
  } else {
    next()
  }
})

// 路由后置守卫 由路由信息 设置标签页标题
router.afterEach(to => {
  let title: string
  if (to.meta && to.meta.title) {
    title = to.meta.title + ' - K.island'
  } else {
    title = 'K.island'
  }
  document.title = title
})

export default router
