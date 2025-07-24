import { useEffect, useState } from "react";
import { useRouter } from "next/router";

type Pedido = {
  id: number;
  numero_nota: number;
  tipo_nota: string;
  empresa_nombre?: string;
  agricultor_nombre?: string;
  agricultor_apellido?: string;
  fruta_nombre?: string;
  empaque_nombre?: string;
  cantidad_cajas: number;
  fecha_recepcion: string;
};

type Motivo = {
  id: number;
  nombre: string;
  descripcion: string;
};

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
    } catch (error) {
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
          router.push("/panel/Rutas/control-calidad");
        }, 1500);
      } else {
        setMensaje("Error al guardar: " + (result.message || ""));
      }
    } catch (err) {
      setMensaje("Error al registrar el control de calidad");
    }
  };

  const handleRecargar = () => {
    cargarDatos();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#23272a] via-[#2c2f33] to-[#1a1d1f] text-white p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-3xl md:max-w-4xl">
        {/* Header */}
        <div className="flex flex-col items-center mb-8 md:mb-10">
          <div className="bg-[#27ae60]/20 shadow-lg rounded-full w-20 h-20 flex items-center justify-center mb-2">
            <span className="text-4xl md:text-5xl">🛡️</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-[#27ae60] mb-2 drop-shadow">
            Control de Calidad
          </h1>
          <p className="text-gray-200 text-lg md:text-xl">
            Bienvenido, <span className="font-semibold">{email}</span>
          </p>
        </div>

        {/* Botón Recargar y volver */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-7 gap-4">
          <button
            onClick={handleRecargar}
            className="bg-[#2ecc71] hover:bg-[#27ae60] text-white font-bold px-8 py-4 rounded-2xl shadow-xl border-none text-lg active:scale-95 transition duration-200"
            title="Recargar pedidos"
          >
            🔄 Recargar
          </button>
          <button
            onClick={() => router.push("/panel/empleado")}
            className="bg-gradient-to-r from-[#4fa3ff] via-[#3566b2] to-[#23272a] hover:from-[#3566b2] hover:to-[#2c2f33] text-white font-bold px-8 py-4 rounded-2xl shadow-xl border-none text-lg active:scale-95 transition duration-200"
          >
            Volver al Panel principal
          </button>
        </div>

        {/* Mensaje de éxito/error */}
        {mensaje && (
          <div
            className={`mb-7 text-center px-4 py-5 rounded-2xl font-bold text-lg ${
              mensaje.includes("correctamente")
                ? "bg-[#27ae60] text-white"
                : "bg-[#e74c3c] text-white"
            }`}
          >
            {mensaje}
          </div>
        )}

        {/* Listado de pedidos pendientes */}
        {step === 1 && (
          <div className="bg-[#23272a]/90 border border-[#2ecc71] rounded-3xl p-6 md:p-10 shadow-md mb-8">
            <h2 className="text-2xl font-semibold text-[#2ecc71] mb-8">
              Pedidos pendientes
            </h2>
            <div className="space-y-6">
              {pedidos.length === 0 && (
                <div className="text-center text-gray-400 text-lg">
                  No hay pedidos pendientes de control de calidad.
                </div>
              )}
              {pedidos.map((pedido) => (
                <div
                  key={pedido.id}
                  onClick={() => handleSelectPedido(pedido)}
                  className="bg-[#23272a]/80 border border-[#27ae60] hover:border-[#2ecc71] focus:border-[#2ecc71] hover:shadow-[#2ecc71]/30 active:bg-[#27ae60]/10 transition rounded-2xl p-6 md:p-7 shadow-md cursor-pointer group"
                  tabIndex={0}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <p className="font-bold text-[#27ae60] text-base md:text-lg">
                        EMPRESA:
                      </p>
                      <p className="group-hover:text-[#2ecc71] transition text-base">
                        {pedido.empresa_nombre ?? "-"}
                      </p>
                    </div>
                    <div>
                      <p className="font-bold text-[#27ae60] text-base md:text-lg">FRUTA:</p>
                      <p className="group-hover:text-[#2ecc71] transition text-base">
                        {pedido.fruta_nombre ?? "-"}
                      </p>
                    </div>
                    <div>
                      <p className="font-bold text-[#27ae60] text-base md:text-lg">
                        AGRICULTOR:
                      </p>
                      <p className="group-hover:text-[#2ecc71] transition text-base">
                        {(pedido.agricultor_nombre || "") +
                          " " +
                          (pedido.agricultor_apellido || "")}
                      </p>
                    </div>
                    <div>
                      <p className="font-bold text-[#27ae60] text-base md:text-lg">
                        CANTIDAD:
                      </p>
                      <p className="group-hover:text-[#2ecc71] transition text-base">
                        {pedido.cantidad_cajas}
                      </p>
                    </div>
                    <div>
                      <p className="font-bold text-[#27ae60] text-base md:text-lg">
                        EMPAQUE:
                      </p>
                      <p className="group-hover:text-[#2ecc71] transition text-base">
                        {pedido.empaque_nombre ?? "-"}
                      </p>
                    </div>
                    <div className="flex items-end justify-end">
                      <span className="bg-gradient-to-r from-[#27ae60] to-[#2ecc71] hover:from-[#2ecc71] hover:to-[#27ae60] text-white px-5 py-3 rounded-2xl text-base font-medium shadow">
                        SELECCIONAR
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Control de calidad del pedido seleccionado */}
        {step === 2 && selectedPedido && (
          <div className="relative">
            <div className="bg-[#23272a] border-2 border-[#2ecc71] rounded-2xl p-5 md:p-8 mb-8 shadow-lg sticky top-2 z-10">
              <div className="flex flex-wrap gap-6 justify-between">
                <div>
                  <span className="text-[#2ecc71] font-bold text-base md:text-lg">
                    EMPRESA:
                  </span>{" "}
                  <span>{selectedPedido.empresa_nombre ?? "-"}</span>
                </div>
                <div>
                  <span className="text-[#2ecc71] font-bold text-base md:text-lg">
                    AGRICULTOR:
                  </span>{" "}
                  <span>
                    {(selectedPedido.agricultor_nombre || "") +
                      " " +
                      (selectedPedido.agricultor_apellido || "")}
                  </span>
                </div>
                <div>
                  <span className="text-[#2ecc71] font-bold text-base md:text-lg">
                    FRUTA:
                  </span>{" "}
                  <span>{selectedPedido.fruta_nombre ?? "-"}</span>
                </div>
                <div>
                  <span className="text-[#2ecc71] font-bold text-base md:text-lg">
                    EMPAQUE:
                  </span>{" "}
                  <span>{selectedPedido.empaque_nombre ?? "-"}</span>
                </div>
                <div>
                  <span className="text-[#2ecc71] font-bold text-base md:text-lg">
                    CANTIDAD INICIAL:
                  </span>{" "}
                  <span>{selectedPedido.cantidad_cajas}</span>
                </div>
              </div>
            </div>
            <div className="bg-[#2c2f33] border border-[#27ae60] rounded-2xl p-6 md:p-10 shadow-md">
              <h2 className="text-2xl font-semibold text-[#27ae60] mb-8">
                Confirmar Control de Calidad
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <label className="block font-bold mb-3 text-[#27ae60] text-lg">
                      Cajas rechazadas
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={selectedPedido.cantidad_cajas}
                      value={form.rechazos}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          rechazos: parseInt(e.target.value) || 0,
                          cajas_finales:
                            selectedPedido.cantidad_cajas -
                            (parseInt(e.target.value) || 0),
                        })
                      }
                      className="w-full p-4 rounded-2xl bg-[#f4f7fa] border border-[#27ae60] text-gray-900 text-lg focus:border-[#2ecc71] focus:ring-2 focus:ring-[#27ae60]/40"
                      required
                    />
                  </div>
                  {form.rechazos > 0 && (
                    <div>
                      <label className="block font-bold mb-3 text-[#e74c3c] text-lg">
                        Motivo de rechazo
                      </label>
                      <select
                        value={form.motivo_rechazo_id}
                        onChange={(e) =>
                          setForm({ ...form, motivo_rechazo_id: e.target.value })
                        }
                        className="w-full p-4 rounded-2xl bg-[#fff4f4] border border-[#e74c3c] text-gray-900 text-lg focus:border-[#e74c3c] focus:ring-2 focus:ring-[#e74c3c]/40"
                        required
                      >
                        <option value="">Seleccione un motivo</option>
                        {motivos.map((motivo) => (
                          <option key={motivo.id} value={motivo.id}>
                            {motivo.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block font-bold mb-3 text-[#27ae60] text-lg">
                      Cajas finales
                    </label>
                    <div className="flex items-center gap-3">
                      <p className="mr-2 text-gray-300 text-lg">{form.cajas_finales}</p>
                      <button
                        type="button"
                        className="text-[#27ae60] hover:text-[#3566b2] text-base font-medium flex items-center active:scale-95"
                        onClick={() => {
                          const newValue = prompt(
                            "Editar cantidad final:",
                            form.cajas_finales.toString()
                          );
                          if (newValue && !isNaN(parseInt(newValue))) {
                            setForm({
                              ...form,
                              cajas_finales: parseInt(newValue),
                              rechazos:
                                selectedPedido.cantidad_cajas -
                                parseInt(newValue),
                            });
                          }
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        EDITAR
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold mb-3 text-[#3566b2] text-lg">
                      Comentarios
                    </label>
                    <textarea
                      value={form.comentarios}
                      onChange={(e) =>
                        setForm({ ...form, comentarios: e.target.value })
                      }
                      className="w-full p-4 rounded-2xl bg-[#f4f7fa] border border-[#c8d6e5] text-gray-900 text-lg focus:border-[#3566b2] focus:ring-2 focus:ring-[#3566b2]/30"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-center mt-8 gap-5">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="bg-[#23272a] hover:bg-[#2c2f33] text-white px-8 py-4 rounded-2xl font-medium shadow border border-[#c8d6e5] text-lg active:scale-95 transition"
                  >
                    Volver
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-[#27ae60] to-[#2ecc71] hover:from-[#2ecc71] hover:to-[#27ae60] text-white px-8 py-4 rounded-2xl font-bold shadow-lg border-none text-lg active:scale-95 transition"
                  >
                    Guardar y generar ticket
                  </button>
                </div>
              </form>
              <div className="mt-10 pt-6 border-t border-[#c8d6e5]">
                <p className="text-base text-gray-400">
                  NOTA: Solo puedes cambiar el número de rechazos/cajas finales.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-10 text-base text-gray-400 text-center">
          © {new Date().getFullYear()} El Molinito
        </div>
      </div>
    </div>
  );
}
