// panel/Rutas/almacen-cooler/acomodo.tsx
import { useState } from 'react'
import { useRouter } from 'next/router'

export default function AcomodoPallets() {
  const router = useRouter()
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [palletNumber, setPalletNumber] = useState('')
  const [selectedFruits, setSelectedFruits] = useState<Array<{
    id: string
    fruit: string
    size: string
    quantity: number
    farmer: string
  }>>([])

  const handleAddFruit = () => {
    // This would be replaced with actual data from a form
    setSelectedFruits([
      ...selectedFruits,
      {
        id: 'HH0120001',
        fruit: 'Zarzamora',
        size: '6 OZ',
        quantity: 60,
        farmer: 'Juan Perez'
      },
      {
        id: 'HH0120002',
        fruit: 'Zarzamora',
        size: '6 OZ',
        quantity: 100,
        farmer: 'Juan Perez'
      },
      {
        id: 'HH0120003',
        fruit: 'Zarzamora',
        size: '6 OZ',
        quantity: 40,
        farmer: 'Pedro S.'
      },
      {
        id: 'HH0120004',
        fruit: 'Arandano',
        size: '6 OZ',
        quantity: 40,
        farmer: 'Julian C.'
      }
    ])
    setPalletNumber('0026')
    setShowConfirmation(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181712] via-[#24180c] to-[#242126] text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-blue-400">Acomodo de Pallets</h1>
          <button
            onClick={() => router.push('/panel/cooler')}
            className="bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white px-7 py-3 rounded-full font-bold shadow-xl border-none transition duration-200"
          >
            Volver
          </button>
        </div>

        {!showConfirmation ? (
          <div className="bg-[#1c1917] rounded-xl p-6 shadow-lg border border-blue-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Empresa</label>
                <select className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2">
                  <option>HEALTHY HARVEST</option>
                  <option>AGROINDUSTRIAL EL MOLINITO</option>
                  <option>QUEEN BERRIES</option>
                  <option>RIGAL</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Tipo de fruta</label>
                <select className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2">
                  <option>Zarzamora</option>
                  <option>Arandano</option>
                  <option>Frambuesa</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Empaque</label>
                <select className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2">
                  <option>6 OZ</option>
                  <option>12 OZ</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Número de Pallet</label>
                <input 
                  type="text" 
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2"
                  placeholder="Ej. 0026"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Cantidad</label>
                <input 
                  type="number" 
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2"
                  placeholder="Ej. 200"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <button
                onClick={handleAddFruit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg"
              >
                Confirmar Acomodo
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#1c1917] rounded-xl p-6 shadow-lg border border-blue-300">
            <h2 className="text-xl font-bold text-blue-400 mb-6 text-center">MENÚ DE CONFIRMACIÓN ACOMODO DE PALLETS</h2>
            
            <div className="mb-6">
              <p className="text-lg"><span className="font-bold">EMPRESA:</span> HEALTHY HARVEST</p>
              <p className="text-lg"><span className="font-bold">NÚMERO DE PALLET:</span> {palletNumber}</p>
            </div>

            <div className="overflow-x-auto mb-8">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="border border-gray-600 p-3">FRUTA ZARZAMORA 6 OZ</th>
                    <th className="border border-gray-600 p-3">FRUTA ZARZAMORA 6 OZ</th>
                    <th className="border border-gray-600 p-3">FRUTA ZARZAMORA 6 OZ</th>
                    <th className="border border-gray-600 p-3">FRUTA ARANDANO 6 OZ</th>
                    <th className="border border-gray-600 p-3">CANTIDAD TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {selectedFruits.map((fruit, index) => (
                      <td key={index} className="border border-gray-600 p-3 text-center">
                        <p className="font-bold">ID</p>
                        <p>{fruit.id}</p>
                        <p className="mt-2 font-bold">CANTIDAD</p>
                        <p>{fruit.quantity}</p>
                      </td>
                    ))}
                    <td className="border border-gray-600 p-3">
                      <p>40 Arandano 6oz</p>
                      <p>200 zarzamora 6oz</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-center gap-4">
              <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg">
                EDITAR
              </button>
              <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg">
                ELIMINAR
              </button>
            </div>

            <div className="mt-8 border-t border-gray-600 pt-6 flex justify-center">
              <button
                onClick={() => setShowConfirmation(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium shadow-lg"
              >
                CONTINUAR
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}