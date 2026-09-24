function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700 max-w-md w-full text-center space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-emerald-400">
          Gatew 🌿
        </h1>
        <p className="text-slate-300 text-sm">
          Tailwind CSS y Supabase listos para la acción.
        </p>
        <button className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all text-slate-950 font-semibold rounded-xl cursor-pointer">
          Empezar
        </button>
      </div>
    </div>
  )
}

export default App
