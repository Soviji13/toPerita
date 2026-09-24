import { useState } from 'react'
import { uploadImageToCloudinary } from '../lib/cloudinary'
import { supabase } from '../lib/supabaseClient'

export function UploadTest({ userId }: { userId: string }) {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!file || !title) return

    try {
      setIsUploading(true)
      setStatusMsg('Subiendo a Cloudinary...')

      // 1. Subir a Cloudinary obteniendo ambos valores
      const { secure_url, public_id } = await uploadImageToCloudinary(file)

      setStatusMsg('Guardando en la base de datos...')

      // 2. Guardar en Supabase cumpliendo el contrato de tipos
      const { error } = await supabase.from('images').insert({
        title,
        img_url: secure_url,
        cloudinary_public_id: public_id,
        user_id: userId,
      })

      if (error) throw error

      setStatusMsg('¡Foto subida y registrada con éxito! 📸')
      setTitle('')
      setFile(null)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      setStatusMsg(`Error: ${msg}`)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <form onSubmit={handleUpload} className="mt-6 p-4 bg-slate-800/60 border border-slate-700 rounded-xl space-y-4">
      <h3 className="text-sm font-semibold text-emerald-400">Subir nueva foto</h3>

      <div>
        <label className="block text-xs text-slate-400 mb-1">Título</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej: Atardecer en la playa"
          required
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
        />
      </div>

      <div>
        <label className="block text-xs text-slate-400 mb-1">Archivo de imagen</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          required
          className="w-full text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-emerald-500 file:text-slate-950 file:cursor-pointer hover:file:bg-emerald-400"
        />
      </div>

      <button
        type="submit"
        disabled={isUploading}
        className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-semibold rounded-lg text-sm cursor-pointer transition"
      >
        {isUploading ? 'Procesando...' : 'Subir imagen'}
      </button>

      {statusMsg && <p className="text-xs text-center text-slate-300">{statusMsg}</p>}
    </form>
  )
}