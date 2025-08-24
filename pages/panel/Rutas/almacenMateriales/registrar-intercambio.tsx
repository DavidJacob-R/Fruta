import React, { useMemo } from 'react'
import { Empresa, Material } from '../../../api/almacen/materiales'

type IntercambioData = {
  tipo: 'intercambio'
  empresaOrigen: Empresa | null
  empresaDestino: Empresa | null
  materialOrigen: Material | null
  materialDestino: Material | null
  cantidadOrigen: string | number
  cantidadDestino: string | number
  fecha: string
  notas: string
}

interface RegistrarIntercambioProps {
  darkMode?: boolean
  data?: Partial<IntercambioData>
  empresas?: Empresa[]
  materiales?: Material[]
  onChange?: (data: IntercambioData) => void
  onConfirm?: () => void
  onBack?: () => void
}

export default function RegistrarIntercambio(props: RegistrarIntercambioProps) {
  const {
    darkMode = true,
    data,
    empresas = [],
    materiales = [],
    onChange = () => {},
    onConfirm = () => {},
    onBack = () => {},
  } = props

  const safeData: IntercambioData = useMemo(() => {
    return {
      tipo: 'intercambio',
      empresaOrigen: null,
      empresaDestino: null,
      materialOrigen: null,
      materialDestino: null,
      cantidadOrigen: '',
      cantidadDestino: '',
      fecha: new Date().toISOString().split('T')[0],
      notas: '',
      ...(data || {}),
    }
  }, [data])

  const setField = (patch: Partial<IntercambioData>) => {
    onChange({ ...safeData, ...patch })
  }

  const disableConfirm =
    !safeData.empresaOrigen ||
    !safeData.empresaDestino ||
    !safeData.materialOrigen ||
    !safeData.materialDestino ||
    !safeData.cantidadOrigen ||
    !safeData.cantidadDestino

  return (
    <div
      className={`w-full max-w-2xl mx-auto rounded-3xl shadow-2xl p-10 flex flex-col items-center pt-20 relative z-0 transition
      ${darkMode ? 'bg-white/10 backdrop-blur-lg border-2 border-orange-400' : 'bg-white border-2 border-orange-200'}`}
    >
      <div className="flex flex-col items-center mb-6">
        <div
          className={`${
            darkMode ? 'bg-white/10 border-orange-500' : 'bg-orange-100 border-orange-300'
          } shadow-lg rounded-full w-16 h-16 flex items-center justify-center mb-2 border-2`}
        >
          <span className={`text-3xl ${darkMode ? 'text-orange-400' : 'text-orange-500'}`}>🔄</span>
        </div>
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-orange-400' : 'text-orange-600'} mb-2 drop-shadow`}>
          Intercambio de Materiales
        </h1>
      </div>

      <div className="w-full space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Origen */}
          <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-gray-100'} p-4 rounded-lg`}>
            <h3 className={`font-bold mb-3 ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>Origen</h3>

            <div className="mb-3">
              <label className={`block mb-1 font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>
                Empresa Origen
              </label>
              <select
                value={safeData.empresaOrigen?.id ?? ''}
                onChange={(e) =>
                  setField({
                    empresaOrigen: empresas.find((emp) => emp.id === Number(e.target.value)) || null,
                  })
                }
                className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition
                  ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
              >
                <option value="">Seleccionar empresa</option>
                {empresas.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className={`block mb-1 font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>
                Material a Intercambiar
              </label>
              <select
                value={safeData.materialOrigen?.id ?? ''}
                onChange={(e) =>
                  setField({
                    materialOrigen: materiales.find((m) => m.id === Number(e.target.value)) || null,
                  })
                }
                className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition
                  ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
              >
                <option value="">Seleccionar material</option>
                {materiales.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block mb-1 font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>Cantidad</label>
              <input
                type="number"
                min="1"
                value={String(safeData.cantidadOrigen)}
                onChange={(e) => setField({ cantidadOrigen: e.target.value })}
                className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition
                  ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                placeholder="Cantidad"
              />
            </div>
          </div>

          {/* Destino */}
          <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-gray-100'} p-4 rounded-lg`}>
            <h3 className={`font-bold mb-3 ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>Destino</h3>

            <div className="mb-3">
              <label className={`block mb-1 font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>
                Empresa Destino
              </label>
              <select
                value={safeData.empresaDestino?.id ?? ''}
                onChange={(e) =>
                  setField({
                    empresaDestino: empresas.find((emp) => emp.id === Number(e.target.value)) || null,
                  })
                }
                className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition
                  ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
              >
                <option value="">Seleccionar empresa</option>
                {empresas.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className={`block mb-1 font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>
                Material a Recibir
              </label>
              <select
                value={safeData.materialDestino?.id ?? ''}
                onChange={(e) =>
                  setField({
                    materialDestino: materiales.find((m) => m.id === Number(e.target.value)) || null,
                  })
                }
                className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition
                  ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
              >
                <option value="">Seleccionar material</option>
                {materiales.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block mb-1 font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>Cantidad</label>
              <input
                type="number"
                min="1"
                value={String(safeData.cantidadDestino)}
                onChange={(e) => setField({ cantidadDestino: e.target.value })}
                className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition
                  ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                placeholder="Cantidad"
              />
            </div>
          </div>
        </div>

        {/* Notas y Fecha */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block mb-1 font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>Fecha de Intercambio</label>
            <input
              type="date"
              value={safeData.fecha}
              onChange={(e) => setField({ fecha: e.target.value })}
              className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition
                ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
            />
          </div>

          <div>
            <label className={`block mb-1 font-medium ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>Notas del Intercambio</label>
            <textarea
              value={safeData.notas}
              onChange={(e) => setField({ notas: e.target.value })}
              className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition
                ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
              rows={2}
              placeholder="Motivo del intercambio, condiciones especiales, etc."
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-4 pt-4">
          <button
            onClick={onBack}
            className={`flex-1 px-6 py-3 rounded-xl border-2 font-bold transition
              ${darkMode ? 'border-orange-400 text-orange-300 hover:bg-orange-900/30' : 'border-orange-300 text-orange-700 hover:bg-orange-100'}`}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={disableConfirm}
            className={`flex-1 px-6 py-3 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 transition ${
              disableConfirm ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Confirmar Intercambio
          </button>
        </div>
      </div>
    </div>
  )
}

// Evita SSG/ISR; fuerza SSR (no pre-render en build).
export async function getServerSideProps() {
  return { props: {} }
}
