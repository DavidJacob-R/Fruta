import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import HeaderControlCalidad from "./HeaderControlCalidad";
import ListaPedidos from "./ListaPedidos";
import PedidoDetalle from "./PedidoDetalle";
import FormularioCalidad from "./FormularioCalidad";
import { Pedido, Motivo } from "../../../api/control_calidad/types";

export default function ControlCalidad() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [motivos, setMotivos] = useState<Motivo[]>([]);
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [mensaje, setMensaje] = useState<string>("");
  const [form, setForm] = useState({
    rechazos: 0,
    motivo_rechazo_id: "",
    comentarios: "",
    cajas_finales: 0,
  });
  const [email, setEmail] = useState<string>("");

  const cargarDatos = async () => {
    setMensaje("");
    try {
      const [pedidosRes, motivosRes] = await Promise.all([
        fetch("/api/control_calidad/listar"),
        fetch("/api/control_calidad/motivos"),
      ]);
      const pedidosData = await pedidosRes.json();
      const motivosData = await motivosRes.json();
      setPedidos(Array.isArray(pedidosData) ? pedidosData : pedidosData.pedidos || []);
      setMotivos(Array.isArray(motivosData) ? motivosData : motivosData.motivos || []);
    } catch {
      setMensaje("Error al cargar pedidos o motivos");
    }
  };

  useEffect(() => {
    const usuario = localStorage.getItem("usuario");
    if (usuario) {
      const user = JSON.parse(usuario);
      setEmail(user.email || "");
    } else {
      router.push("/login");
      return;
    }
    cargarDatos();
  }, []);

  const handleSelectPedido = (pedido: Pedido) => {
    setSelectedPedido(pedido);
    setForm({
      rechazos: 0,
      motivo_rechazo_id: "",
      comentarios: "",
      cajas_finales: pedido.cantidad_cajas,
    });
    setStep(2);
    setMensaje("");
  };

  useEffect(() => {
    if (selectedPedido) {
      setForm((prev) => ({
        ...prev,
        cajas_finales: selectedPedido.cantidad_cajas - prev.rechazos,
      }));
    }
  }, [form.rechazos, selectedPedido]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPedido) return;
    if (form.rechazos > 0 && !form.motivo_rechazo_id) {
      setMensaje("Debe seleccionar un motivo para los rechazos");
      return;
    }
    if (form.rechazos > selectedPedido.cantidad_cajas) {
      setMensaje("Los rechazos no pueden superar la cantidad total");
      return;
    }
    try {
      const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
      const body = {
        recepcion_id: selectedPedido.id,
        usuario_control_id: usuario.id,
        cajas_aprobadas: form.cajas_finales,
        cajas_rechazadas: form.rechazos,
        notas: form.comentarios,
        motivos: form.rechazos > 0 ? [{ motivo_id: Number(form.motivo_rechazo_id), cantidad_cajas: form.rechazos }] : [],
      };
      const res = await fetch("/api/control_calidad/guardar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (result.success) {
        setMensaje("✅ Control de calidad registrado correctamente");
        setTimeout(() => {
          setStep(1);
          setSelectedPedido(null);
          cargarDatos();
        }, 1500);
      } else {
        setMensaje("Error al guardar: " + (result.message || ""));
      }
    } catch {
      setMensaje("Error al registrar el control de calidad");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181712] via-[#24180c] to-[#242126] text-white px-2 py-8 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <HeaderControlCalidad
          email={email}
          onReload={cargarDatos}
          onBack={() => router.push("/panel/empleado")}
          mensaje={mensaje}
        />

        {step === 1 && (
          <div className="bg-[#1c1917] border border-orange-300 rounded-2xl p-6 shadow-md hover:shadow-lg transition mb-8">
            <ListaPedidos pedidos={pedidos} onSelect={handleSelectPedido} />
          </div>
        )}

        {step === 2 && selectedPedido && (
          <div className="space-y-6">
            <PedidoDetalle pedido={selectedPedido} />
            <FormularioCalidad
              form={form}
              setForm={setForm}
              motivos={motivos}
              pedido={selectedPedido}
              onVolver={() => setStep(1)}
              onSubmit={handleSubmit}
            />
          </div>
        )}

        <div className="text-center text-gray-400 mt-8">
          © {new Date().getFullYear()} El Molinito
        </div>
      </div>
    </div>
  );
}