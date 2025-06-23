import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { format } from 'date-fns'

export default function PreenfriadoFruta() {
const router = useRouter()
const [recepciones, setRecepciones] = useState<any[]>([])
const [pallets, setPallets] = useState<any[]>([])
const [mensaje, setMensaje] = useState('')
const [registrosTemperatura, setRegistrosTemperatura] = useState<any[]>([])
const [form, setForm] = useState({
    recepcion_id: '',
    pallet_id: '',
    temperatura_inicial: '',
    fecha_inicio: '',
    observaciones: ''
})
const [temperaturaForm, setTemperaturaForm] = useState({
    hora: '1',
    temperatura: ''
})

const cargarRecepciones = async () => {
    const res = await fetch('/api/recepcion/listar')
    const data = await res.json()
    setRecepciones(data.recepciones)
}

const cargarPallets = async () => {
    const res = await fetch('/api/preenfriado/pallets')
    const data = await res.json()
    setPallets(data.pallets)
}

const cargarRegistrosTemperatura = async (palletId: string) => {
    if (!palletId) return
    const res = await fetch(`/api/preenfriado/registros?pallet_id=${palletId}`)
    const data = await res.json()
    setRegistrosTemperatura(data.registros)
}

useEffect(() => {
    const usuario = localStorage.getItem('usuario')
    if (!usuario) {
    router.push('/login')
    return
    }
    cargarRecepciones()
    cargarPallets()
}, [])

const handleSubmit = async (e: any) => {
    e.preventDefault()
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
    const datos = { 
    ...form, 
    usuario_preenfriado_id: usuario.id,
    temperaturas: registrosTemperatura
    }

    const res = await fetch('/api/preenfriado/crear', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
    })

    const result = await res.json()
    if (result.success) {
    setMensaje('Proceso de preenfriado registrado correctamente.')
    setForm({
        recepcion_id: '',
        pallet_id: '',
        temperatura_inicial: '',
        fecha_inicio: '',
        observaciones: ''
    })
    setRegistrosTemperatura([])
    cargarPallets()
    } else {
    setMensaje('Error al registrar: ' + result.message)
    }
}

const agregarTemperatura = () => {
    if (!temperaturaForm.temperatura) return
    
    setRegistrosTemperatura([...registrosTemperatura, {
    hora: temperaturaForm.hora,
    temperatura: temperaturaForm.temperatura,
    fecha_registro: new Date().toISOString()
    }])
    
    setTemperaturaForm({
    hora: (parseInt(temperaturaForm.hora) + 1).toString(),
    temperatura: ''
    })
}

const eliminarTemperatura = (index: number) => {
    const nuevasTemperaturas = [...registrosTemperatura]
    nuevasTemperaturas.splice(index, 1)
    setRegistrosTemperatura(nuevasTemperaturas)
}

return (
    <div className="min-h-screen bg-black text-white p-6">
    <button
        onClick={() => router.push('/panel/empleado')}
        className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded"
    >
        Volver al panel principal
    </button>

    <h1 className="text-2xl font-bold text-blue-500 mb-6">Preenfriado de Fruta</h1>

    <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded-xl border border-blue-500 max-w-xl">
        <div className="mb-4">
        <label>Recepción asociada:</label>
        <select
            value={form.recepcion_id}
            onChange={(e) => setForm({ ...form, recepcion_id: e.target.value })}
            className="w-full p-2 rounded bg-black border border-gray-700 text-white"
        >
            <option value="">Selecciona una recepción</option>
            {recepciones.map((r) => (
            <option key={r.id} value={r.id}>
                {r.codigo_caja} - {r.agricultor} - {r.fruta}
            </option>
            ))}
        </select>
        </div>

        <div className="mb-4">
        <label>Pallet:</label>
        <select
            value={form.pallet_id}
            onChange={(e) => {
            setForm({ ...form, pallet_id: e.target.value })
            cargarRegistrosTemperatura(e.target.value)
            }}
            className="w-full p-2 rounded bg-black border border-gray-700 text-white"
            required
        >
            <option value="">Selecciona un pallet</option>
            {pallets.map((p) => (
            <option key={p.id} value={p.id}>
                Pallet #{p.codigo} - {p.fruta} - {p.agricultor}
            </option>
            ))}
        </select>
        </div>

        <div className="mb-4">
        <label>Temperatura inicial (°C):</label>
        <input
            type="number"
            step="0.1"
            value={form.temperatura_inicial}
            onChange={(e) => setForm({ ...form, temperatura_inicial: e.target.value })}
            className="w-full p-2 rounded bg-black border border-gray-700 text-white"
            required
        />
        </div>

        <div className="mb-4">
        <label>Fecha y hora de inicio:</label>
        <input
            type="datetime-local"
            value={form.fecha_inicio}
            onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })}
            className="w-full p-2 rounded bg-black border border-gray-700 text-white"
            required
        />
        </div>

        <div className="mb-4">
        <label>Observaciones:</label>
        <textarea
            value={form.observaciones}
            onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
            className="w-full p-2 rounded bg-black border border-gray-700 text-white"
        />
        </div>

        <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-blue-400">
        <h3 className="text-lg font-semibold text-blue-400 mb-3">Registro de Temperaturas</h3>
        
        <div className="flex gap-2 mb-3">
            <select
            value={temperaturaForm.hora}
            onChange={(e) => setTemperaturaForm({ ...temperaturaForm, hora: e.target.value })}
            className="p-2 rounded bg-black border border-gray-700 text-white"
            >
            {[1, 2, 3, 4, 5, 6].map((h) => (
                <option key={h} value={h}>Hora {h}</option>
            ))}
            </select>
            
            <input
            type="number"
            step="0.1"
            value={temperaturaForm.temperatura}
            onChange={(e) => setTemperaturaForm({ ...temperaturaForm, temperatura: e.target.value })}
            placeholder="Temperatura °C"
            className="flex-1 p-2 rounded bg-black border border-gray-700 text-white"
            />
            
            <button
            type="button"
            onClick={agregarTemperatura}
            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
            Agregar
            </button>
        </div>

        {registrosTemperatura.length > 0 && (
            <div className="mt-4">
            <h4 className="font-medium mb-2">Temperaturas registradas:</h4>
            <ul className="space-y-2">
                {registrosTemperatura.map((reg, index) => (
                <li key={index} className="flex justify-between items-center bg-gray-700 p-2 rounded">
                    <span>Hora {reg.hora}: {reg.temperatura}°C</span>
                    <button
                    type="button"
                    onClick={() => eliminarTemperatura(index)}
                    className="text-red-400 hover:text-red-300"
                    >
                    Eliminar
                    </button>
                </li>
                ))}
            </ul>
            </div>
        )}
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
        Registrar Preenfriado
        </button>

        {mensaje && <p className="mt-4 text-blue-400">{mensaje}</p>}
    </form>

    <h2 className="text-xl mt-10 mb-4 text-blue-400 font-semibold">Procesos de Preenfriado</h2>
    <div className="overflow-x-auto bg-gray-900 p-4 rounded-xl border border-blue-500">
        <table className="min-w-full table-auto text-sm text-white">
        <thead>
            <tr className="text-blue-400 border-b border-gray-700">
            <th className="p-2">Pallet</th>
            <th className="p-2">Recepción</th>
            <th className="p-2">Temp. Inicial</th>
            <th className="p-2">Registros</th>
            <th className="p-2">Fecha Inicio</th>
            <th className="p-2">Observaciones</th>
            </tr>
        </thead>
        <tbody>
            {pallets.filter(p => p.preenfriado).map((p) => (
            <tr key={p.id} className="border-b border-gray-700 hover:bg-gray-800">
                <td className="p-2">#{p.codigo}</td>
                <td className="p-2">{p.recepcion_codigo}</td>
                <td className="p-2">{p.preenfriado.temperatura_inicial}°C</td>
                <td className="p-2">
                {p.preenfriado.registros.length} registros
                </td>
                <td className="p-2">{format(new Date(p.preenfriado.fecha_inicio), 'yyyy-MM-dd HH:mm')}</td>
                <td className="p-2">{p.preenfriado.observaciones || '-'}</td>
            </tr>
            ))}
        </tbody>
        </table>
    </div>
    </div>
)
}