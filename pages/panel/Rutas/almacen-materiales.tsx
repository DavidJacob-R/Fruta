import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

interface Empresa {
  id: number
  nombre: string
}

interface Proveedor {
  id: number
  nombre: string
}

interface Agricultor {
  id: number
  nombre: string
}

interface Material {
  id: number
  nombre: string
  cantidad: number
}

interface MovimientoEntrada {
  tipo: 'entrada'
  empresa: Empresa | null
  proveedor: Proveedor | null
  material: Material | null
  cantidad: string
  identificador: string
}

interface MovimientoSalida {
  tipo: 'salida'
  empresa: Empresa | null
  agricultor: Agricultor | null
  material: Material | null
  cantidad: string
  identificador: string
}

type MovimientoData = MovimientoEntrada | MovimientoSalida

export default function AlmacenMateriales() {
  const router = useRouter()
  const [darkMode, setDarkMode] = useState(true)
  const [view, setView] = useState<'main' | 'entradas' | 'salidas' | 'confirmacion'>('main')
  const [movimientoData, setMovimientoData] = useState<MovimientoData | null>(null)
  const [existencias, setExistencias] = useState<Material[]>([])

  const empresas: Empresa[] = [
    { id: 1, nombre: 'HEALTHY HARVEST' },
    { id: 2, nombre: 'EL MOLINITO' }
  ]

  const proveedores: Proveedor[] = [
    { id: 1, nombre: 'UNIPACK' },
    { id: 2, nombre: 'EMPAQUES DEL NORTE' }
  ]

  const agricultores: Agricultor[] = [
    { id: 1, nombre: 'JUAN PEREZ' },
    { id: 2, nombre: 'MARIA GOMEZ' }
  ]

  const materiales: Material[] = [
    { id: 1, nombre: 'CAJA DKLSMDS', cantidad: 100 },
    { id: 2, nombre: 'CLAMSHELL 12OZ', cantidad: 250 }
  ]

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
    // Aquí deberías cargar las existencias actuales desde tu API
    // fetch('/api/almacen/existencias').then(...)
  }, [darkMode])

  const handleEntrada = () => {
    setMovimientoData({
      tipo: 'entrada',
      empresa: null,
      proveedor: null,
      material: null,
      cantidad: '',
      identificador: ''
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
      identificador: ''
    })
    setView('salidas')
  }

  const handleConfirmar = () => {
    setView('confirmacion')
  }

  const handleGenerarTicket = () => {
    // Aquí deberías enviar los datos a tu API para registrar el movimiento
    // fetch('/api/almacen/movimientos', { method: 'POST', body: ... })
    setView('main')
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
          <MainView
            darkMode={darkMode}
            onEntrada={handleEntrada}
            onSalida={handleSalida}
            existencias={existencias}
            onBack={() => router.push('/panel/empleado')}
          />
        )}
        {view === 'entradas' && movimientoData && movimientoData.tipo === 'entrada' && (
          <EntradasView
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
          <SalidasView
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
        {view === 'confirmacion' && movimientoData && (
          <ConfirmacionView
            darkMode={darkMode}
            data={movimientoData}
            onGenerarTicket={handleGenerarTicket}
            onBack={() => setView(movimientoData.tipo === 'entrada' ? 'entradas' : 'salidas')}
          />
        )}
      </main>
      <footer className={`w-full text-center py-4 text-sm mt-auto
        ${darkMode
          ? "bg-[#181a1b] text-orange-200"
          : "bg-orange-50 text-orange-900"
        }`}>
        © {new Date().getFullYear()} El Molinito – Sistema de Almacén
      </footer>
    </div>
  )
}

type MainViewProps = {
  darkMode: boolean
  onEntrada: () => void
  onSalida: () => void
  existencias: Material[]
  onBack: () => void
}

function MainView({ darkMode, onEntrada, onSalida, existencias, onBack }: MainViewProps) {
  return (
    <div className={`w-full max-w-xl mx-auto rounded-3xl shadow-2xl p-10 flex flex-col items-center pt-20 relative z-0 transition
      ${darkMode
        ? 'bg-white/10 backdrop-blur-lg border-2 border-orange-400'
        : 'bg-white border-2 border-orange-200'
      }`}>
      <h1 className={`text-4xl font-extrabold mb-8 text-center drop-shadow-xl
        ${darkMode ? 'text-orange-300' : 'text-orange-700'}`}>
        Almacén de Materiales
      </h1>
      <div className="w-full flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row gap-7 justify-center">
          <button
            onClick={onEntrada}
            className={`flex-1 min-w-[170px] shadow-xl hover:scale-105 transition-transform rounded-2xl px-8 py-6 text-lg font-extrabold tracking-wide border-2 focus:ring-2 outline-none
              ${"bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 py-4 shadow font-bold border-none transition"}`} >
            Registrar Entrada
          </button>
          <button
            onClick={onSalida}
            className={`flex-1 min-w-[170px] shadow-xl hover:scale-105 transition-transform rounded-2xl px-8 py-6 text-lg font-extrabold tracking-wide border-2 focus:ring-2 outline-none
              ${"bg-green-600 hover:bg-green-700 text-white rounded-xl px-8 py-4 shadow font-bold border-none transition"}`} >
            Registrar Salida
          </button>
        </div>
        <div className={`mt-6 w-full rounded-xl p-4 ${darkMode ? 'bg-black/30' : 'bg-orange-50'}`}>
          <h3 className={`font-bold text-lg mb-3 ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>
            Existencias Actuales
          </h3>
          <div className="space-y-2">
            {existencias.length > 0 ? (
              existencias.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <span className={darkMode ? 'text-white' : 'text-gray-800'}>{item.nombre}</span>
                  <span className={`font-mono ${darkMode ? 'text-orange-300' : 'text-orange-600'}`}>
                    {item.cantidad} unidades
                  </span>
                </div>
              ))
            ) : (
              <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>No hay datos de existencias</p>
            )}
          </div>
        </div>
        <button
          className={`w-full shadow px-6 py-4 text-lg font-bold rounded-2xl border transition-transform hover:scale-105 focus:ring-2 outline-none
            ${"border-2 border-orange-300 text-orange-800 bg-white hover:bg-orange-100 rounded-xl px-8 py-4 font-bold shadow transitio" }`}
          onClick={onBack}>
          Regresar al menú principal
        </button>
      </div>
    </div>
  )
}

type EntradasViewProps = {
  darkMode: boolean
  data: MovimientoEntrada
  empresas: Empresa[]
  proveedores: Proveedor[]
  materiales: Material[]
  onChange: (data: MovimientoEntrada) => void
  onConfirm: () => void
  onBack: () => void
}

function EntradasView({ darkMode, data, empresas, proveedores, materiales, onChange, onConfirm, onBack }: EntradasViewProps) {
  return (
    <div className={`w-full max-w-xl mx-auto rounded-3xl shadow-2xl p-10 flex flex-col items-center pt-20 relative z-0 transition
      ${darkMode
        ? 'bg-white/10 backdrop-blur-lg border-2 border-orange-400'
        : 'bg-white border-2 border-orange-200'
      }`}>
      <h1 className={`text-3xl font-extrabold mb-6 text-center drop-shadow-xl
        ${darkMode ? 'text-orange-300' : 'text-orange-700'}`}>
        Entrada de Materiales
      </h1>
      <div className="w-full space-y-5">
        <div>
          <label className={`block mb-1 font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>
            Empresa
          </label>
          <select
            value={data.empresa?.id || ''}
            onChange={(e) => onChange({ ...data, empresa: empresas.find((emp) => emp.id == Number(e.target.value)) || null })}
            className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition
              ${darkMode
                ? 'bg-gray-800 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-800'
              }`}>
            <option value="">Seleccionar empresa</option>
            {empresas.map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={`block mb-1 font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>
            Proveedor
          </label>
          <select
            value={data.proveedor?.id || ''}
            onChange={(e) => onChange({ ...data, proveedor: proveedores.find((prov) => prov.id == Number(e.target.value)) || null })}
            className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition
              ${darkMode
                ? 'bg-gray-800 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-800'
              }`}>
            <option value="">Seleccionar proveedor</option>
            {proveedores.map((prov) => (
              <option key={prov.id} value={prov.id}>{prov.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={`block mb-1 font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>
            Material
          </label>
          <select
            value={data.material?.id || ''}
            onChange={(e) => onChange({ ...data, material: materiales.find((mat) => mat.id == Number(e.target.value)) || null })}
            className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition
              ${darkMode
                ? 'bg-gray-800 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-800'
              }`}>
            <option value="">Seleccionar material</option>
            {materiales.map((mat) => (
              <option key={mat.id} value={mat.id}>{mat.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={`block mb-1 font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>
            Cantidad
          </label>
          <input
            type="number"
            value={data.cantidad}
            onChange={(e) => onChange({ ...data, cantidad: e.target.value })}
            className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition
              ${darkMode
                ? 'bg-gray-800 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-800'
              }`}
            placeholder="Ingrese la cantidad"
          />
        </div>
        <div>
          <label className={`block mb-1 font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>
            Identificador
          </label>
          <input
            type="text"
            value={data.identificador}
            onChange={(e) => onChange({ ...data, identificador: e.target.value })}
            className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition
              ${darkMode
                ? 'bg-gray-800 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-800'
              }`}
            placeholder="Ej: HH0120001"
          />
        </div>
        <div className="flex gap-4 pt-4">
          <button
            onClick={onBack}
            className={`flex-1 px-6 py-3 rounded-xl border-2 font-bold transition
              ${darkMode
                ? 'border-orange-400 text-orange-300 hover:bg-orange-900/30'
                : 'border-orange-300 text-orange-700 hover:bg-orange-100'
              }`}>
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={!data.empresa || !data.proveedor || !data.material || !data.cantidad}
            className={`flex-1 px-6 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition
              ${(!data.empresa || !data.proveedor || !data.material || !data.cantidad) ? 'opacity-50 cursor-not-allowed' : ''}`}>
            Continuar
          </button>
        </div>
      </div>
    </div>
  )
}

type SalidasViewProps = {
  darkMode: boolean
  data: MovimientoSalida
  empresas: Empresa[]
  agricultores: Agricultor[]
  materiales: Material[]
  onChange: (data: MovimientoSalida) => void
  onConfirm: () => void
  onBack: () => void
}

function SalidasView({ darkMode, data, empresas, agricultores, materiales, onChange, onConfirm, onBack }: SalidasViewProps) {
  return (
    <div className={`w-full max-w-xl mx-auto rounded-3xl shadow-2xl p-10 flex flex-col items-center pt-20 relative z-0 transition
      ${darkMode
        ? 'bg-white/10 backdrop-blur-lg border-2 border-orange-400'
        : 'bg-white border-2 border-orange-200'
      }`}>
      <h1 className={`text-3xl font-extrabold mb-6 text-center drop-shadow-xl
        ${darkMode ? 'text-orange-300' : 'text-orange-700'}`}>
        Salida de Materiales
      </h1>
      <div className="w-full space-y-5">
        <div>
          <label className={`block mb-1 font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>
            Empresa
          </label>
          <select
            value={data.empresa?.id || ''}
            onChange={(e) => onChange({ ...data, empresa: empresas.find((emp) => emp.id == Number(e.target.value)) || null })}
            className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition
              ${darkMode
                ? 'bg-gray-800 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-800'
              }`}>
            <option value="">Seleccionar empresa</option>
            {empresas.map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={`block mb-1 font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>
            Agricultor
          </label>
          <select
            value={data.agricultor?.id || ''}
            onChange={(e) => onChange({ ...data, agricultor: agricultores.find((agr) => agr.id == Number(e.target.value)) || null })}
            className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition
              ${darkMode
                ? 'bg-gray-800 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-800'
              }`}>
            <option value="">Seleccionar agricultor</option>
            {agricultores.map((agr) => (
              <option key={agr.id} value={agr.id}>{agr.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={`block mb-1 font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>
            Material
          </label>
          <select
            value={data.material?.id || ''}
            onChange={(e) => onChange({ ...data, material: materiales.find((mat) => mat.id == Number(e.target.value)) || null })}
            className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition
              ${darkMode
                ? 'bg-gray-800 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-800'
              }`}>
            <option value="">Seleccionar material</option>
            {materiales.map((mat) => (
              <option key={mat.id} value={mat.id}>{mat.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={`block mb-1 font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>
            Cantidad
          </label>
          <input
            type="number"
            value={data.cantidad}
            onChange={(e) => onChange({ ...data, cantidad: e.target.value })}
            className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition
              ${darkMode
                ? 'bg-gray-800 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-800'
              }`}
            placeholder="Ingrese la cantidad"
          />
        </div>
        <div>
          <label className={`block mb-1 font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>
            Identificador
          </label>
          <input
            type="text"
            value={data.identificador}
            onChange={(e) => onChange({ ...data, identificador: e.target.value })}
            className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition
              ${darkMode
                ? 'bg-gray-800 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-800'
              }`}
            placeholder="Ej: HH0120001"
          />
        </div>
        <div className="flex gap-4 pt-4">
          <button
            onClick={onBack}
            className={`flex-1 px-6 py-3 rounded-xl border-2 font-bold transition
              ${darkMode
                ? 'border-orange-400 text-orange-300 hover:bg-orange-900/30'
                : 'border-orange-300 text-orange-700 hover:bg-orange-100'
              }`}>
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={!data.empresa || !data.agricultor || !data.material || !data.cantidad}
            className={`flex-1 px-6 py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 transition
              ${(!data.empresa || !data.agricultor || !data.material || !data.cantidad) ? 'opacity-50 cursor-not-allowed' : ''}`}>
            Continuar
          </button>
        </div>
      </div>
    </div>
  )
}

type ConfirmacionViewProps = {
  darkMode: boolean
  data: MovimientoData
  onGenerarTicket: () => void
  onBack: () => void
}

function ConfirmacionView({ darkMode, data, onGenerarTicket, onBack }: ConfirmacionViewProps) {
  return (
    <div className={`w-full max-w-xl mx-auto rounded-3xl shadow-2xl p-10 flex flex-col items-center pt-20 relative z-0 transition
      ${darkMode
        ? 'bg-white/10 backdrop-blur-lg border-2 border-orange-400'
        : 'bg-white border-2 border-orange-200'
      }`}>
      <h1 className={`text-3xl font-extrabold mb-6 text-center drop-shadow-xl
        ${darkMode ? 'text-orange-300' : 'text-orange-700'}`}>
        Confirmación de {data.tipo === 'entrada' ? 'Entrada' : 'Salida'}
      </h1>
      <div className={`w-full rounded-xl p-6 mb-6 ${darkMode ? 'bg-black/30' : 'bg-orange-50'}`}>
        <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-orange-300' : 'text-orange-700'}`}>
          {data.tipo === 'entrada' ? 'MENÚ DE CONFIRMACIÓN ENTRADAS DEL ALMACÉN' : 'MENÚ DE CONFIRMACIÓN SALIDAS DEL ALMACÉN'}
        </h2>
        <div className="space-y-4">
          <div>
            <span className={`font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>EMPRESA: </span>
            <span className={darkMode ? 'text-white' : 'text-gray-800'}>{data.empresa?.nombre}</span>
          </div>
          {data.tipo === 'entrada' ? (
            <div>
              <span className={`font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>PROVEEDOR: </span>
              <span className={darkMode ? 'text-white' : 'text-gray-800'}>{(data as MovimientoEntrada).proveedor?.nombre}</span>
            </div>
          ) : (
            <div>
              <span className={`font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>AGRICULTOR: </span>
              <span className={darkMode ? 'text-white' : 'text-gray-800'}>{(data as MovimientoSalida).agricultor?.nombre}</span>
            </div>
          )}
          <div>
            <span className={`font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>MATERIAL: </span>
            <span className={darkMode ? 'text-white' : 'text-gray-800'}>{data.material?.nombre}</span>
          </div>
          <div>
            <span className={`font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>CANTIDAD: </span>
            <span className={darkMode ? 'text-white' : 'text-gray-800'}>{data.cantidad}</span>
          </div>
          <div>
            <span className={`font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>IDENTIFICADOR: </span>
            <span className={darkMode ? 'text-white' : 'text-gray-800'}>{data.identificador || 'N/A'}</span>
          </div>
        </div>
      </div>
      <div className="w-full flex flex-col gap-4">
        <div className="flex gap-4">
          <button
            onClick={onBack}
            className={`flex-1 px-6 py-3 rounded-xl border-2 font-bold transition
              ${darkMode
                ? 'border-orange-400 text-orange-300 hover:bg-orange-900/30'
                : 'border-orange-300 text-orange-700 hover:bg-orange-100'
              }`}>
            Editar
          </button>
          <button
            onClick={onBack}
            className={`flex-1 px-6 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition`}>
            Eliminar
          </button>
        </div>
        <button
          onClick={onGenerarTicket}
          className={`w-full px-6 py-4 rounded-xl font-bold text-white transition
            ${data.tipo === 'entrada'
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-green-600 hover:bg-green-700'
            }`}>
          {data.tipo === 'entrada' ? 'CONTINUAR' : 'CONTINUAR Y GENERAR TICKET'}
        </button>
      </div>
    </div>
  )
}
