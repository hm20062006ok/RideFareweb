import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'home', component: () => import('../views/Home.vue') },
  { path: '/settings', name: 'settings', component: () => import('../views/Settings.vue') },
  { path: '/template/:id', name: 'template-edit', component: () => import('../views/TemplateEdit.vue'), props: true },
  { path: '/template/:templateId/rule/:ruleId', name: 'rule-edit', component: () => import('../views/RuleEdit.vue'), props: true },
]

export default createRouter({ history: createWebHistory(), routes })
