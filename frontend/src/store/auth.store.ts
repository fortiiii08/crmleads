import { create } from 'zustand'

interface User {
  id: string
  name: string
  email: string
  role: string
  tenantId: string
  tenant: { id: string; name: string; slug: string }
}

interface AuthStore {
  user: User | null
  token: string | null
  setAuth: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: (() => {
    try { return JSON.parse(localStorage.getItem('crm_user') || 'null') } catch { return null }
  })(),
  token: localStorage.getItem('crm_token'),
  setAuth: (user, token) => {
    localStorage.setItem('crm_user', JSON.stringify(user))
    localStorage.setItem('crm_token', token)
    set({ user, token })
  },
  logout: () => {
    localStorage.removeItem('crm_user')
    localStorage.removeItem('crm_token')
    set({ user: null, token: null })
  },
}))
