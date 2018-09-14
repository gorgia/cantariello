import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/components/Login'
import Register from '@/components/Register'
import Profile from '@/components/Profile'
import Choice from '@/components/Choice'
import Game from '@/components/Game'
import Home from '@/components/Home'
import Leaderboard from '@/components/Leaderboard'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/register',
      name: 'Register',
      component: Register
    },
    {
      path: '/profile/:username',
      name: 'Profile',
      component: Profile
    },
    {
      path: '/choice',
      name: 'Choice',
      component: Choice
    },
    {
      path: '/game',
      name: 'Game',
      component: Game
    },
    {
      path: '/leaderboard',
      name: 'Leaderboard',
      component: Leaderboard
    }

  ]
})
