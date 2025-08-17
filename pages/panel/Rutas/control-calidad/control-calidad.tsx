import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/router";
import HeaderControlCalidad from "./HeaderControlCalidad";
import PedidoDetalle from "./PedidoDetalle";
import FormularioCalidad from "./FormularioCalidad";
import { Pedido, Motivo } from "../../../api/control_calidad/types";

type ListaProps = {
  pedidos: Pedido[];
  onSelect: (pedido: Pedido) => void;
};

function TextoDato({ etiqueta, valor }: { etiqueta: string; valor: string | number | undefined | null }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-300">
      <span className="rounded-md bg-[#2ecc71]/10 px-2 py-1 text-[#2ecc71] text-xs">{etiqueta}</span>
      <span className="text-gray-200">{valor ?? "-"}</span>
    </div>
  );
}

function formatoFecha(fecha: any) {
  if (!fecha) return "-";
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("es-MX", { year: "numeric", month: "short", day: "2-digit" });
}

function ListaPedidos({ pedidos, onSelect }: ListaProps) {
  const items = Array.isArray(pedidos) ? pedidos : [];

  return (
    <div className="w-full">
      <div className="flex items-end justify-between mb-4">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-semibold text-white">Pedidos pendientes</h2>
          <p className="text-gray-400 text-sm">Selecciona un pedido para continuar con el control de calidad</p>
        </div>
        <div className="text-sm text-gray-400">{items.length} pedido{items.length === 1 ? "" : "s"}</div>
      </div>

      <div className="rounded-2xl border border-[#2ecc71]/30 bg-[#1e2225] overflow-hidden">
        {items.length === 0 ? (
          <div className="p-10 text-center text-gray-400">No hay pedidos pendientes</div>
        ) : (
          <ul className="divide-y divide-white/5">
            {items.map((p, idx) => {
              const tieneNota = Number.isFinite(p?.numero_nota) && (p?.numero_nota as number) > 0;
              const titulo = tieneNota ? `Nota #${p.numero_nota}` : `Recepcion #${p?.id ?? "-"}`;

              const lineaSecundaria = [
                (p as any)?.empresa_nombre,
                [(p as any)?.agricultor_nombre, (p as any)?.agricultor_apellido].filter(Boolean).join(" "),
              ]
                .filter(Boolean)
                .join(" • ");

              return (
                <li key={`${p?.id ?? "k"}-${idx}`}>
                  <button type="button" onClick={() => onSelect(p)} className="group w-full text-left focus:outline-none">
                    <div className="p-5 sm:p-6 transition ease-out hover:bg-white/[0.03]">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-3">
                            <h3 className="text-base sm:text-lg font-medium text-white truncate">{titulo}</h3>
                            <span className="px-2 py-0.5 rounded-full text-xs bg-[#2ecc71]/10 text-[#2ecc71] border border-[#2ecc71]/30">
                              Pendiente
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-400 truncate">{lineaSecundaria || "Sin datos"}</p>
                        </div>
                        <div className="shrink-0">
                          <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-gray-200 group-hover:border-[#2ecc71]/40 group-hover:bg-[#2ecc71]/10">
                            Ver detalle
                            <span className="translate-x-0 group-hover:translate-x-0.5 transition">→</span>
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <TextoDato etiqueta="Fruta" valor={(p as any)?.fruta_nombre} />
                        <TextoDato etiqueta="Empaque" valor={(p as any)?.empaque_nombre} />
                        <TextoDato etiqueta="Cajas" valor={(p as any)?.cantidad_cajas} />
                        <TextoDato etiqueta="Fecha" valor={formatoFecha((p as any)?.fecha_recepcion)} />
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

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

  const handleSubmit = async (e: FormEvent) => {
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
        setMensaje("Control de calidad registrado correctamente");
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
    <div className="min-h-screen bg-[#1a1d1f] text-white flex flex-col items-center px-4 py-8 sm:px-6 md:px-10">
      <div className="w-full max-w-6xl space-y-10">
        <HeaderControlCalidad
          email={email}
          onReload={cargarDatos}
          onBack={() => router.push("/panel/empleado")}
          mensaje={mensaje}
        />

        {step === 1 && (
          <div className="rounded-3xl bg-[#23272a] border border-[#2ecc71] shadow-xl p-6 sm:p-8">
            <ListaPedidos pedidos={pedidos} onSelect={handleSelectPedido} />
          </div>
        )}

        {step === 2 && selectedPedido && (
          <div className="space-y-8">
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

        <div className="mt-10 text-lg text-gray-400 text-center">© {new Date().getFullYear()} El Molinito</div>
      </div>
    </div>
  );
}
