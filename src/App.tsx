import { useState, useEffect } from 'react'
import { supabase } from './lib/supabaseClient'
import type { User } from '@supabase/supabase-js'
import { UploadTest } from './components/UploadTest'

export default function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // 1. Escuchar el estado de autenticación
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) fetchRole(user.id)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        fetchRole(currentUser.id)
      } else {
        setRole(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // 2. Traer el perfil del usuario autenticado (comprobando RLS)
  async function fetchRole(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (!error && data) {
      setRole(data.role)
    }
  }

  // 3. Manejador del Login
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setErrorMsg(error.message)
    }
    setLoading(false)
  }

  // 4. Manejador del Logout
  async function handleLogout() {
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-sm w-full shadow-2xl">
        <h1 className="text-2xl font-bold mb-6 text-center text-emerald-400">
          Gatew Auth 🌿
        </h1>

        {user ? (
          <div className="space-y-4">
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50 space-y-1">
              <p className="text-xs uppercase tracking-wider text-slate-400">Conectado como</p>
              <p className="font-medium text-slate-200 truncate">{user.email}</p>
              <p className="text-sm text-emerald-400 font-semibold pt-1">
                Rol: {role ?? 'Cargando rol...'}
              </p>
            </div>

            <UploadTest userId={user.id} />

            <button
              onClick={handleLogout}
              className="w-full py-2.5 bg-rose-600/80 hover:bg-rose-600 text-white font-medium rounded-xl transition cursor-pointer"
            >
              Cerrar sesión
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm rounded-xl">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 transition text-sm"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 transition text-sm"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-semibold rounded-xl transition cursor-pointer mt-2"
            >
              {loading ? 'Comprobando...' : 'Iniciar sesión'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
