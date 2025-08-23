import { NextRouter } from 'next/router'

interface Modulo {
  nombre: string;
  ruta: string;
  icon: string;
}

interface BarraLateralProps {
  email: string;
  modoNoche: boolean;
  modulos: Modulo[];
  router: NextRouter;
  accentNight: string;
  accentDay: string;
  cardNight: string;
  cardDay: string;
  softShadow: string;
}

export default function BarraLateral({ 
  email, 
  modoNoche, 
  modulos, 
  router, 
  accentNight, 
  accentDay, 
  cardNight, 
  cardDay, 
  softShadow 
}: BarraLateralProps) {
  
  const handleModuloClick = (ruta: string) => {
    router.push(ruta);
  };

  return (
    <aside className={`flex flex-col h-screen w-[260px] md:w-[280px] ${modoNoche ? cardNight : cardDay} p-6 ${softShadow} border-r sticky top-0 z-20`}>
      <div className="flex flex-col items-center mb-8">
        <div className={`rounded-full p-3 mb-2 ${modoNoche ? 'bg-orange-500/20' : 'bg-orange-100'}`}>
          <span className="text-3xl">🏗️</span>
        </div>
        <h2 className="text-lg font-bold mb-1 text-center">Almacén de Materiales</h2>
        <span className={`text-xs ${modoNoche ? 'text-orange-200' : 'text-orange-700'}`}>{email}</span>
      </div>
      
      <nav className="flex-1 flex flex-col gap-1">
        {modulos.map((modulo, idx) => (
          <button
            key={idx}
            onClick={() => handleModuloClick(modulo.ruta)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left font-semibold transition ${
              router.pathname === modulo.ruta
                ? modoNoche ? 'bg-orange-700' : 'bg-orange-200' 
                : modoNoche ? 'hover:bg-[#1e1914]' : 'hover:bg-orange-100'
            } ${modoNoche ? accentNight : accentDay}`}
          >
            <span className="text-xl">{modulo.icon}</span>
            <span>{modulo.nombre}</span>
            {router.pathname === modulo.ruta && (
              <span className="ml-auto text-xs bg-orange-500/20 px-2 py-1 rounded-full">Actual</span>
            )}
          </button>
        ))}
      </nav>
    </aside>
  )
}