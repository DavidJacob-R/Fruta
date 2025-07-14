// panel/Rutas/almacen-cooler/existencias.tsx
import { useState } from 'react'
import { useRouter } from 'next/router'

export default function ExistenciasCooler() {
  const router = useRouter()
  const [view, setView] = useState<'general' | 'detailed'>('general')
  const [showExitMenu, setShowExitMenu] = useState(false)

  const generalInventory = [
    { company: 'AGROINDUSTRIAL EL MOLINITO', product: 'ZARZAMORA 12oz', quantity: 340 },
    { company: 'AGROINDUSTRIAL EL MOLINITO', product: 'ZARZAMORA 6oz', quantity: 200 },
    { company: 'AGROINDUSTRIAL EL MOLINITO', product: 'FRAMBUESA 6oz', quantity: 567 },
    { company: 'AGROINDUSTRIAL EL MOLINITO', product: 'ARANDANO 6oz', quantity: 2 },
    { company: 'HEALTHY HARVEST', product: 'ZARZAMORA 12oz', quantity: 340 },
    { company: 'HEALTHY HARVEST', product: 'ZARZAMORA 6oz', quantity: 200 },
    { company: 'HEALTHY HARVEST', product: 'FRAMBUESA 6oz', quantity: 567 },
    { company: 'HEALTHY HARVEST', product: 'ARANDANO 6oz', quantity: 2 },
    { company: 'QUEEN BERRIES', product: 'ZARZAMORA 12oz', quantity: 340 },
    { company: 'QUEEN BERRIES', product: 'ZARZAMORA 6oz', quantity: 200 },
    { company: 'QUEEN BERRIES', product: 'FRAMBUESA 6oz', quantity: 567 },
    { company: 'QUEEN BERRIES', product: 'ARANDANO 6oz', quantity: 2 },
    { company: 'RIGAL', product: 'ZARZAMORA 12oz', quantity: 340 },
    { company: 'RIGAL', product: 'ZARZAMORA 6oz', quantity: 200 },
  ]

  const detailedInventory = [
    {
      pallet: '0026',
      company: 'HEALTHY HARVEST',
      fruits: [
        { farmer: 'JUAN PEREZ', product: 'ZARZAMORA 6 OZ', id: 'HH0120001', quantity: 60 },
        { farmer: 'JUAN PEREZ', product: 'ZARZAMORA 6 OZ', id: 'HH0120002', quantity: 100 },
        { farmer: 'PEDRO S.', product: 'ZARZAMORA 6 OZ', id: 'HH0120003', quantity: 40 },
        { farmer: 'JULIAN C.', product: 'ARANDANO 6 OZ', id: 'HH0320001', quantity: 40 },
      ],
      total: { zarzamora: 200, arandano: 40 }
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181712] via-[#24180c] to-[#242126] text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-blue-400">Existencias Cooler</h1>
          <button
            onClick={() => router.push('/panel/cooler')}
            className="bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white px-7 py-3 rounded-full font-bold shadow-xl border-none transition duration-200"
          >
            Volver
          </button>
        </div>

        <div className="flex mb-6 border-b border-gray-600">
          <button
            onClick={() => setView('general')}
            className={`px-4 py-2 font-medium ${view === 'general' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
          >
            Generales
          </button>
          <button
            onClick={() => setView('detailed')}
            className={`px-4 py-2 font-medium ${view === 'detailed' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
          >
            Detalladas
          </button>
        </div>

        {!showExitMenu ? (
          <>
            {view === 'general' ? (
              <div className="bg-[#1c1917] rounded-xl p-6 shadow-lg border border-blue-300">
                <h2 className="text-xl font-bold text-blue-400 mb-6">EXISTENCIAS GENERALES</h2>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-800">
                        <th className="border border-gray-600 p-3">AGROINDUSTRIAL EL MOLINITO</th>
                        <th className="border border-gray-600 p-3">HEALTHY HARVEST</th>
                        <th className="border border-gray-600 p-3">QUEEN BERRIES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {['ZARZAMORA 12oz', 'ZARZAMORA 6oz', 'FRAMBUESA 6oz', 'ARANDANO 6oz'].map((product) => (
                        <tr key={product}>
                          {['AGROINDUSTRIAL EL MOLINITO', 'HEALTHY HARVEST', 'QUEEN BERRIES'].map((company) => {
                            const item = generalInventory.find(i => i.company === company && i.product === product)
                            return (
                              <td key={`${company}-${product}`} className="border border-gray-600 p-3 text-center">
                                {item ? `${item.product} ${item.quantity}` : '-'}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 bg-gray-800 p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">RIGAL</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {generalInventory
                      .filter(item => item.company === 'RIGAL')
                      .map(item => (
                        <div key={item.product} className="bg-gray-700 p-3 rounded">
                          {item.product} {item.quantity}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#1c1917] rounded-xl p-6 shadow-lg border border-blue-300">
                <h2 className="text-xl font-bold text-blue-400 mb-6">EXISTENCIAS DETALLADAS</h2>
                
                {detailedInventory.map((pallet, idx) => (
                  <div key={idx} className="mb-8">
                    <div className="overflow-x-auto mb-6">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-800">
                            {pallet.fruits.map((_, i) => (
                              <th key={i} className="border border-gray-600 p-2">AGRICULTOR</th>
                            ))}
                            <th className="border border-gray-600 p-2">CANTIDAD TOTAL</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            {pallet.fruits.map((fruit, i) => (
                              <td key={i} className="border border-gray-600 p-2 text-center">
                                {fruit.farmer}
                              </td>
                            ))}
                            <td rowSpan={5} className="border border-gray-600 p-2">
                              <p>{pallet.total.zarzamora} zarzamora 6oz</p>
                              <p>{pallet.total.arandano} arandano 6oz</p>
                              <p className="mt-2 font-bold">EMPRESA</p>
                              <p>{pallet.company}</p>
                              <p className="mt-2 font-bold">#PALLET</p>
                              <p>{pallet.pallet}</p>
                            </td>
                          </tr>
                          <tr>
                            {pallet.fruits.map((fruit, i) => (
                              <td key={i} className="border border-gray-600 p-2 text-center">
                                <p className="font-bold">FRUTA</p>
                                {fruit.product}
                              </td>
                            ))}
                          </tr>
                          <tr>
                            {pallet.fruits.map((fruit, i) => (
                              <td key={i} className="border border-gray-600 p-2 text-center">
                                <p className="font-bold">ID</p>
                                {fruit.id}
                              </td>
                            ))}
                          </tr>
                          <tr>
                            {pallet.fruits.map((fruit, i) => (
                              <td key={i} className="border border-gray-600 p-2 text-center">
                                <p className="font-bold">CANTIDAD</p>
                                {fruit.quantity}
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}

                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => setShowExitMenu(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg"
                  >
                    Registrar Salida
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-[#1c1917] rounded-xl p-6 shadow-lg border border-blue-300">
            <h2 className="text-xl font-bold text-blue-400 mb-6 text-center">MENÚ DE CONFIRMACIÓN DE SALIDAS</h2>
            
            <div className="mb-6">
              <p className="text-lg"><span className="font-bold">EMPRESA:</span> HEALTHY HARVEST</p>
              <p className="text-lg"><span className="font-bold">CLIENTE:</span> N/I</p>
            </div>

            <div className="mb-8">
              <h3 className="font-bold text-lg mb-3">PALLETS QUE SALDRAN</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {['0010', '0054', '0011', '0098', '0187', '0078', '0098', '0026', '0089'].map(pallet => (
                  <div key={pallet} className="bg-gray-800 p-3 rounded text-center">
                    {pallet}
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="font-bold text-lg mb-3">DOCUMENTOS</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {['CARTA DE INSTRUCCIÓN', 'MANIFIESTO DE CARGA', 'PACKING LIST', 'PROFORMA'].map(doc => (
                  <div key={doc} className="bg-gray-800 p-3 rounded text-center">
                    {doc}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center gap-4 mt-8">
              <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg">
                EDITAR
              </button>
              <button 
                onClick={() => setShowExitMenu(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
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