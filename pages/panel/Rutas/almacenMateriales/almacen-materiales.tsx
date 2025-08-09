import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Material, MovimientoData } from '../../../api/almacenmateriales/types'

import ExistenciasMateriales from './existencias-materiales'
import RegistrarEntrada from './registrar-entrada'
import RegistrarSalida from './registrar-salida'
import RegistrarIntercambio from './registrar-intercambio'
import ConfirmacionView from './confirmacion-view'

export default function AlmacenMateriales() {
  const router = useRouter()
  const [darkMode, setDarkMode] = useState(true)
  const [view, setView] = useState<'main' | 'entradas' | 'salidas' | 'intercambios' | 'confirmacion'>('main')
  const [movimientoData, setMovimientoData] = useState<MovimientoData | any>(null)
  const [existencias, setExistencias] = useState<Material[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  const empresas = [
    { id: 1, nombre: 'HEALTHY HARVEST' },
    { id: 2, nombre: 'EL MOLINITO' }
  ]

  const proveedores = [
    { id: 1, nombre: 'UNIPACK' },
    { id: 2, nombre: 'EMPAQUES DEL NORTE' }
  ]

  const agricultores = [
    { id: 1, nombre: 'JUAN PEREZ' },
    { id: 2, nombre: 'MARIA GOMEZ' }
  ]

  const materiales = [
    { id: 1, nombre: 'CAJA DKLSMDS', cantidad: 100 },
    { id: 2, nombre: 'CLAMSHELL 12OZ', cantidad: 250 },
    { id: 3, nombre: 'BANDEJA PLÁSTICA', cantidad: 75 },
    { id: 4, nombre: 'BOLSA DE RED', cantidad: 300 }
  ]

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
    setExistencias(materiales)
  }, [darkMode])

  const handleEntrada = () => {
    setMovimientoData({
      tipo: 'entrada',
      empresa: null,
      proveedor: null,
      material: null,
      cantidad: '',
      fecha: new Date().toISOString().split('T')[0],
      esComprado: null 
    })
    setView('entradas')
  }

  const handleSalida = () => {
    setMovimientoData({
      tipo: 'salida',
      empresa: null,
      agricultor: null,
      material: null,
      cantidad: '',
      fecha: new Date().toISOString().split('T')[0]
    })
    setView('salidas')
  }

  const handleIntercambio = () => {
    setMovimientoData({
      tipo: 'intercambio',
      empresaOrigen: null,
      empresaDestino: null,
      materialOrigen: null,
      materialDestino: null,
      cantidadOrigen: '',
      cantidadDestino: '',
      fecha: new Date().toISOString().split('T')[0],
      notas: ''
    })
    setView('intercambios')
  }

  const handleConfirmar = () => {
    setView('confirmacion')
  }

  const handleGenerarTicket = () => {
    alert(`Movimiento registrado correctamente: ${JSON.stringify(movimientoData)}`)
    setView('main')
    setExistencias(prev => {
      return prev.map(mat => {
        if (movimientoData.tipo === 'entrada' && mat.id === movimientoData.material?.id) {
          return { ...mat, cantidad: mat.cantidad + Number(movimientoData.cantidad) }
        }
        if (movimientoData.tipo === 'salida' && mat.id === movimientoData.material?.id) {
          return { ...mat, cantidad: mat.cantidad - Number(movimientoData.cantidad) }
        }
        if (movimientoData.tipo === 'intercambio') {
          if (mat.id === movimientoData.materialOrigen?.id) {
            return { ...mat, cantidad: mat.cantidad - Number(movimientoData.cantidadOrigen) }
          }
          if (mat.id === movimientoData.materialDestino?.id) {
            return { ...mat, cantidad: mat.cantidad + Number(movimientoData.cantidadDestino) }
          }
        }
        return mat
      })
    })
  }

  return (
    <div className={`min-h-screen flex flex-col justify-between transition-colors duration-300
      ${darkMode ? 'bg-gradient-to-br from-[#171a1b] via-[#22272a] to-[#222111]' : 'bg-gradient-to-br from-orange-50 via-white to-gray-100'}`}>
      <header className="w-full flex justify-end items-center pt-5 pr-8">
        <button
          onClick={() => setDarkMode(d => !d)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full shadow border text-base font-semibold transition
            ${darkMode
              ? "bg-[#22282a]/90 border-orange-400 text-orange-100 hover:bg-[#232a2d]/90"
              : "bg-white border-orange-200 text-orange-700 hover:bg-orange-100"}`}>
          {darkMode
            ? (<><span role="img" aria-label="noche">🌙</span> Noche</>)
            : (<><span role="img" aria-label="dia">☀️</span> Día</>)
          }
        </button>
      </header>

      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10 select-none">
        <div className={`w-14 h-14 ${darkMode ? 'bg-white/10 border-orange-500' : 'bg-orange-100 border-orange-300'} border-2 shadow-xl rounded-full flex items-center justify-center`}>
          <span className={`text-3xl font-black ${darkMode ? 'text-orange-400' : 'text-orange-500'}`}>📦</span>
        </div>
        <span className={`font-bold tracking-widest uppercase text-xl drop-shadow 
          ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>Almacén</span>
      </div>

      <main className="flex-1 flex items-center justify-center py-12 px-3">
        {view === 'main' && (
          <ExistenciasMateriales
            darkMode={darkMode}
            onEntrada={handleEntrada}
            onSalida={handleSalida}
            onIntercambio={handleIntercambio}
            existencias={existencias.filter(item =>
              item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.cantidad.toString().includes(searchTerm)
            )}
            searchTerm={searchTerm}
            onSearchChange={(e) => setSearchTerm(e.target.value)}
            onBack={() => router.push('/panel/empleado')}
          />
        )}
        {view === 'entradas' && movimientoData && movimientoData.tipo === 'entrada' && (
          <RegistrarEntrada
            darkMode={darkMode}
            data={movimientoData}
            empresas={empresas}
            proveedores={proveedores}
            materiales={materiales}
            onChange={(data) => setMovimientoData(data)}
            onConfirm={handleConfirmar}
            onBack={() => setView('main')}
          />
        )}
        {view === 'salidas' && movimientoData && movimientoData.tipo === 'salida' && (
          <RegistrarSalida
            darkMode={darkMode}
            data={movimientoData}
            empresas={empresas}
            agricultores={agricultores}
            materiales={materiales}
            onChange={(data) => setMovimientoData(data)}
            onConfirm={handleConfirmar}
            onBack={() => setView('main')}
          />
        )}
        {view === 'intercambios' && movimientoData && movimientoData.tipo === 'intercambio' && (
          <RegistrarIntercambio
            darkMode={darkMode}
            data={movimientoData}
            empresas={empresas}
            proveedores={proveedores}  
            materiales={materiales}
            onChange={(data) => setMovimientoData(data)}
            onConfirm={handleConfirmar}
            onBack={() => setView('main')}
          />
        )}
        {view === 'confirmacion' && movimientoData && (
          <ConfirmacionView
            darkMode={darkMode}
            data={movimientoData}
            onGenerarTicket={handleGenerarTicket}
            onBack={() => setView(movimientoData.tipo === 'entrada' ? 'entradas' : 
                                movimientoData.tipo === 'salida' ? 'salidas' : 'intercambios')}
          />
        )}
      </main>

      <footer className={`w-full text-center py-4 text-sm mt-auto
        ${darkMode ? "bg-[#181a1b] text-orange-200" : "bg-orange-50 text-orange-900"}`}>
        © {new Date().getFullYear()} El Molinito – Sistema de Almacén
      </footer>
    </div>
  )
}
