import { useState } from 'react'
import { useRouter } from 'next/router'

export default function AlmacenCoolerMenu() {
  const router = useRouter()
  
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  const handleOptionClick = (option: string) => {
    setSelectedOption(option)
    switch(option) {
      case 'acomodo':
        router.push('/panel/cooler/acomodo')
        break
      case 'existencias':
        router.push('/panel/cooler/existencias')
        break
      default:
        break
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181712] via-[#24180c] to-[#242126] text-white p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="flex flex-col items-center mb-10">
          <div className="bg-blue-100 shadow-lg rounded-full w-16 h-16 flex items-center justify-center mb-2">
            <span className="text-3xl">❄️</span>
          </div>
          <h1 className="text-3xl font-bold text-blue-400 mb-2 drop-shadow">ALMACÉN DEL COOLER</h1>
        </div>

        {/* Opciones principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div 
            onClick={() => handleOptionClick('acomodo')}
            className={`cursor-pointer bg-[#1c1917] border ${selectedOption === 'acomodo' ? 'border-blue-500' : 'border-blue-300'} hover:border-blue-500 hover:shadow-blue-200/60 transition rounded-2xl p-8 shadow-md hover:shadow-lg group`}
          >
            <h2 className="text-xl font-semibold text-blue-400 mb-3 group-hover:text-blue-300 transition">ACOMODO DE PALLETS</h2>
            <p className="text-sm text-gray-400 group-hover:text-gray-200 transition">Administra la organización de pallets en el cooler.</p>
          </div>

          <div 
            onClick={() => handleOptionClick('existencias')}
            className={`cursor-pointer bg-[#1c1917] border ${selectedOption === 'existencias' ? 'border-blue-500' : 'border-blue-300'} hover:border-blue-500 hover:shadow-blue-200/60 transition rounded-2xl p-8 shadow-md hover:shadow-lg group`}
          >
            <h2 className="text-xl font-semibold text-blue-400 mb-3 group-hover:text-blue-300 transition">EXISTENCIAS</h2>
            <p className="text-sm text-gray-400 group-hover:text-gray-200 transition">Consulta y gestiona las existencias en el cooler.</p>
          </div>
        </div>

        {/* Botón de retroceso */}
        <div className="text-center">
          <button
            onClick={() => router.push('/panel/empleado')}
            className="bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white px-7 py-3 rounded-full font-bold shadow-xl border-none transition duration-200"
          >
            Volver al panel
          </button>
        </div>
      </div>
    </div>
  )
}