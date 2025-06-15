'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function PanelProgramador() {
  const router = useRouter()
  const [rol, setRol] = useState<string | null>(null)

  useEffect(() => {
    const verificarSesion = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const { data: usuario } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('id', session.user.id)
        .single()

      if (usuario?.rol !== 'programador') {
        router.push('/login')
        return
      }

      setRol('programador')
    }

    verificarSesion()
  }, [])

  if (!rol) return <p>Cargando...</p>

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Panel del Programador</h1>
    </div>
  )
}
