import { useEffect, useMemo, useState, type FormEvent } from "react"
import { useRouter } from "next/router"
import HeaderControlCalidad from "./HeaderControlCalidad"
import PedidoDetalle from "./PedidoDetalle"
import FormularioCalidad from "./FormularioCalidad"
import ListaPedidos from "./ListaPedidos"
import { Pedido, Motivo } from "../../../api/control_calidad/types"

export default function ControlCalidad() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [motivos, setMotivos] = useState<Motivo[]>([])
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null)
  const [mensaje, setMensaje] = useState<string>("")
  const [email, setEmail] = useState<string>("")

  // Formato original: número de rechazos + comentarios
  const [rechazos, setRechazos] = useState<number>(0)
  const [comentarios, setComentarios] = useState<string>("")

  // NUEVO: multi-selección de motivos (sin cantidades)
  const [selectedMotivos, setSelectedMotivos] = useState<number[]>([])

  async function cargarDatos() {
    setMensaje("")
    try {
      const [pedidosRes, motivosRes] = await Promise.all([
        fetch("/api/control_calidad/listar"),
        fetch("/api/control_calidad/motivos"),
      ])
      const pedidosData = await pedidosRes.json()
      const motivosData = await motivosRes.json()
      setPedidos(Array.isArray(pedidosData) ? pedidosData : (pedidosData.pedidos || []))
      setMotivos(Array.isArray(motivosData) ? motivosData : (motivosData.motivos || []))
    } catch {
      setMensaje("Error al cargar pedidos o motivos")
    }
  }

  useEffect(() => {
    const usuario = localStorage.getItem("usuario")
    if (usuario) {
      try {
        const user = JSON.parse(usuario)
        setEmail(user.email || "")
      } catch {}
    } else {
      router.push("/login")
      return
    }
    cargarDatos()
  }, [])

  function handleSelectPedido(pedido: Pedido) {
    setSelectedPedido(pedido)
    setRechazos(0)
    setComentarios("")
    setSelectedMotivos([])
    setStep(2)
    setMensaje("")
  }

  // Derivados
  const cajasFinales = useMemo(() => {
    if (!selectedPedido) return 0
    return Math.max(0, (selectedPedido.cantidad_cajas || 0) - (rechazos || 0))
  }, [selectedPedido, rechazos])

  function toggleMotivo(id: number) {
    setSelectedMotivos(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!selectedPedido) return

    // Validaciones: igual que antes, pero permitimos varios motivos
    if ((rechazos || 0) < 0) {
      setMensaje("Los rechazos no pueden ser negativos.")
      return
    }
    if (rechazos > selectedPedido.cantidad_cajas) {
      setMensaje("Los rechazos no pueden superar la cantidad total.")
      return
    }
    if (rechazos > 0 && selectedMotivos.length === 0) {
      setMensaje("Selecciona al menos un motivo de rechazo.")
      return
    }
    if (rechazos === 0 && selectedMotivos.length > 0) {
      setMensaje("Defina la cantidad de cajas rechazadas mayor a 0.")
      return
    }

    try {
      const usuario = JSON.parse(localStorage.getItem("usuario") || "{}")
      const payload = {
        recepcion_id: selectedPedido.id,
        usuario_control_id: usuario.id,
        cajas_aprobadas: cajasFinales,
        cajas_rechazadas: rechazos,
        notas: comentarios,
        // Compatibilidad: mandamos cantidad_cajas=0 por cada motivo elegido (el backend puede ignorar ese campo)
        motivos: selectedMotivos.map(mID => ({ motivo_id: mID, cantidad_cajas: 0 }))
      }

      const res = await fetch("/api/control_calidad/guardar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const result = await res.json()

      if (result?.success) {
        setMensaje("Control de calidad registrado correctamente")
        setTimeout(() => {
          setStep(1)
          setSelectedPedido(null)
          setSelectedMotivos([])
          setRechazos(0)
          setComentarios("")
          cargarDatos()
        }, 900)
      } else {
        setMensaje("Error al guardar: " + (result?.message || ""))
      }
    } catch {
      setMensaje("Error al registrar el control de calidad")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-925 to-neutral-950 text-white">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <HeaderControlCalidad
          email={email}
          onReload={cargarDatos}
          onBack={() => router.push("/panel/empleado")}
          mensaje={mensaje}
        />

        {step === 1 && (
          <section className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4 sm:p-6">
            <ListaPedidos pedidos={pedidos} onSelect={handleSelectPedido} />
          </section>
        )}

        {step === 2 && selectedPedido && (
          <section className="mt-4 space-y-4">
            <PedidoDetalle pedido={selectedPedido} />
            <FormularioCalidad
              pedido={selectedPedido}
              motivos={motivos}
              rechazos={rechazos}
              setRechazos={setRechazos}
              cajasFinales={cajasFinales}
              selectedMotivos={selectedMotivos}
              toggleMotivo={toggleMotivo}
              comentarios={comentarios}
              setComentarios={setComentarios}
              onVolver={() => setStep(1)}
              onSubmit={handleSubmit}
            />
          </section>
        )}
      </main>

      <footer className="w-full text-center py-5 text-sm text-neutral-500">
        © {new Date().getFullYear()} El Molinito – Control de calidad
      </footer>
    </div>
  )
}
