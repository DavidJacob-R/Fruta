import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Material, MovimientoData } from '../../../api/almacen/materiales'
import ExistenciasPanel from './existencias-panel'
import RegistrarEntrada from './registrar-entrada'
import RegistrarSalida from './registrar-salida'
import RegistrarIntercambio from './registrar-intercambio'
import ConfirmacionView from './confirmacion-view'

export default function AlmacenMateriales() {
  const router = useRouter()
  const [darkMode, setDarkMode] = useState(true)
  const [view, setView] = useState<'main' | 'entradas' | 'salidas' | 'intercambios' | 'confirmacion' | 'existencias'>('main')
  const [movimientoData, setMovimientoData] = useState<MovimientoData | any>(null)
  const [existencias, setExistencias] = useState<Material[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    const usuario = typeof window !== 'undefined' ? localStorage.getItem('usuario') : null
    if (usuario) {
      const user = JSON.parse(usuario)
      setEmail(user.email)
    }
  }, [])

  // Datos de ejemplo
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
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
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
    <div className={`min-h-screen bg-gradient-to-br ${darkMode ? 'from-[#171a1b] via-[#22272a] to-[#222111]' : 'from-orange-50 via-white to-gray-100'} text-white p-6 flex flex-col`}>
      <header className="w-full flex justify-end mb-8">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full shadow border text-base font-semibold transition
            ${darkMode
              ? "bg-[#22282a]/90 border-orange-400 text-orange-100 hover:bg-[#232a2d]/90"
              : "bg-white border-orange-200 text-orange-700 hover:bg-orange-100"}`}>
          {darkMode ? (<><span role="img" aria-label="noche">🌙</span> Noche</>) : (<><span role="img" aria-label="dia">☀️</span> Día</>)}
        </button>
      </header>

      {view === 'main' && (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-full max-w-4xl">
            <div className="flex flex-col items-center mb-7">
              <div className={`${darkMode ? 'bg-white/10 border-orange-500' : 'bg-orange-100 border-orange-300'} shadow-lg rounded-full w-16 h-16 flex items-center justify-center mb-2 border-2`}>
                <span className={`text-3xl ${darkMode ? 'text-orange-400' : 'text-orange-500'}`}>📦</span>
              </div>
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-orange-400' : 'text-orange-600'} mb-2 drop-shadow`}>Almacén de Materiales</h1>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-base`}>Bienvenido, <span className="font-semibold">{email}</span></p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
              <button
                onClick={handleEntrada}
                className={`cursor-pointer ${darkMode ? 'bg-[#1c2b3a] border-orange-400 hover:border-orange-500 hover:shadow-orange-200/40' : 'bg-white border-orange-300 hover:border-orange-400 hover:shadow-orange-100/40'} border hover:shadow-lg transition rounded-2xl p-6 shadow-md group text-left`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">📥</span>
                  <div>
                    <h2 className={`text-lg font-semibold ${darkMode ? 'text-orange-400 group-hover:text-orange-300' : 'text-orange-600 group-hover:text-orange-500'} transition`}>
                      Registrar Entrada
                    </h2>
                    <p className={`text-sm ${darkMode ? 'text-gray-400 group-hover:text-gray-200' : 'text-gray-500 group-hover:text-gray-700'} transition`}>
                      Accede al módulo de entradas
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={handleSalida}
                className={`cursor-pointer ${darkMode ? 'bg-[#1c2b3a] border-orange-400 hover:border-orange-500 hover:shadow-orange-200/40' : 'bg-white border-orange-300 hover:border-orange-400 hover:shadow-orange-100/40'} border hover:shadow-lg transition rounded-2xl p-6 shadow-md group text-left`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">📤</span>
                  <div>
                    <h2 className={`text-lg font-semibold ${darkMode ? 'text-orange-400 group-hover:text-orange-300' : 'text-orange-600 group-hover:text-orange-500'} transition`}>
                      Registrar Salida
                    </h2>
                    <p className={`text-sm ${darkMode ? 'text-gray-400 group-hover:text-gray-200' : 'text-gray-500 group-hover:text-gray-700'} transition`}>
                      Accede al módulo de salidas
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={handleIntercambio}
                className={`cursor-pointer ${darkMode ? 'bg-[#1c2b3a] border-orange-400 hover:border-orange-500 hover:shadow-orange-200/40' : 'bg-white border-orange-300 hover:border-orange-400 hover:shadow-orange-100/40'} border hover:shadow-lg transition rounded-2xl p-6 shadow-md group text-left`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">🔄</span>
                  <div>
                    <h2 className={`text-lg font-semibold ${darkMode ? 'text-orange-400 group-hover:text-orange-300' : 'text-orange-600 group-hover:text-orange-500'} transition`}>
                      Intercambio
                    </h2>
                    <p className={`text-sm ${darkMode ? 'text-gray-400 group-hover:text-gray-200' : 'text-gray-500 group-hover:text-gray-700'} transition`}>
                      Accede al módulo de intercambios
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setView('existencias')}
                className={`cursor-pointer ${darkMode ? 'bg-[#1c2b3a] border-orange-400 hover:border-orange-500 hover:shadow-orange-200/40' : 'bg-white border-orange-300 hover:border-orange-400 hover:shadow-orange-100/40'} border hover:shadow-lg transition rounded-2xl p-6 shadow-md group text-left`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">📊</span>
                  <div>
                    <h2 className={`text-lg font-semibold ${darkMode ? 'text-orange-400 group-hover:text-orange-300' : 'text-orange-600 group-hover:text-orange-500'} transition`}>
                      Consultar Existencias
                    </h2>
                    <p className={`text-sm ${darkMode ? 'text-gray-400 group-hover:text-gray-200' : 'text-gray-500 group-hover:text-gray-700'} transition`}>
                      Accede al módulo de existencias
                    </p>
                  </div>
                </div>
              </button>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => router.push('/panel/empleado')}
                className={`bg-gradient-to-r ${darkMode ? 'from-gray-600 via-gray-700 to-gray-800 hover:from-gray-700 hover:to-gray-900' : 'from-orange-200 via-orange-100 to-orange-200 hover:from-orange-300 hover:to-orange-200'} text-${darkMode ? 'white' : 'orange-800'} px-7 py-3 rounded-full font-bold shadow-xl border-none transition duration-200`}
              >
                Volver al Panel principal
              </button>
            </div>
          </div>
        </div>
      )}

      {view === 'existencias' && (
        <ExistenciasPanel
          darkMode={darkMode}
          existencias={materiales.filter(item =>
            item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.cantidad.toString().includes(searchTerm)
          )}
          searchTerm={searchTerm}
          onSearchChange={(e) => setSearchTerm(e.target.value)}
          onBack={() => setView('main')}
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
          onBack={() =>
            setView(
              movimientoData.tipo === 'entrada'
                ? 'entradas'
                : movimientoData.tipo === 'salida'
                ? 'salidas'
                : 'intercambios'
            )
          }
        />
      )}

      <footer className={`mt-10 text-xs text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        © {new Date().getFullYear()} El Molinito – Sistema de Almacén
      </footer>
    </div>
  )
}

// Evita SSG/ISR; fuerza SSR en esta ruta
export async function getServerSideProps() {
  return { props: {} }
}
