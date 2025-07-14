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
          setStep(1);
          setSelectedPedido(null);
          setMensaje("");
          cargarDatos();
        }, 1500);
      } else {
        setMensaje("Error al guardar: " + (result.message || ""));
      }
    } catch (err) {
      setMensaje("Error al registrar el control de calidad");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    router.push("/");
  };

  const handleRecargar = () => {
    cargarDatos();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181712] via-[#24180c] to-[#242126] text-white p-6">
      <div className="w-full max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-7">
          <div className="flex flex-col items-center md:items-start">
            <div className="bg-orange-100 shadow-lg rounded-full w-16 h-16 flex items-center justify-center mb-2">
              <span className="text-3xl">🍊</span>
            </div>
            <h1 className="text-3xl font-bold text-orange-500 mb-1 drop-shadow">Control de Calidad</h1>
            <p className="text-gray-300 text-base">
              Bienvenido, <span className="font-semibold">{email}</span>
            </p>
          </div>
          <button
            onClick={handleRecargar}
            className="mt-4 md:mt-0 bg-orange-500 hover:bg-orange-700 text-white px-4 py-2 rounded-xl font-bold shadow transition"
            title="Recargar pedidos">
            🔄 Recargar
          </button>
        </div>

        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => router.push("/panel/empleado")}
            className="flex items-center text-orange-400 hover:text-orange-300 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Volver al panel
          </button>
        </div>

        {/* Mensaje de éxito/error */}
        {mensaje && (
          <div
            className={`mb-5 text-center px-4 py-3 rounded-xl font-bold ${
              mensaje.includes("correctamente") ? "bg-green-700 text-green-100" : "bg-red-800 text-red-100"
            }`}>
            {mensaje}
          </div>
        )}

        {/* Paso 1: Listado de pedidos pendientes */}
        {step === 1 && (
          <div className="bg-[#1c1917] border border-orange-300 rounded-2xl p-6 shadow-md mb-8">
            <h2 className="text-xl font-semibold text-orange-400 mb-6">Pedidos pendientes</h2>
            <div className="space-y-4">
              {pedidos.length === 0 && (
                <div className="text-center text-gray-400">No hay pedidos pendientes de control de calidad.</div>
              )}
              {pedidos.map((pedido) => (
                <div
                  key={pedido.id}
                  onClick={() => handleSelectPedido(pedido)}
                  className="bg-[#1c1917] border border-orange-300 hover:border-orange-500 hover:shadow-orange-200/60 transition rounded-xl p-5 shadow-sm cursor-pointer group">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="font-bold text-orange-400 text-sm">EMPRESA:</p>
                      <p className="group-hover:text-orange-300 transition">{pedido.empresa_nombre ?? '-'}</p>
                    </div>
                    <div>
                      <p className="font-bold text-orange-400 text-sm">FRUTA:</p>
                      <p className="group-hover:text-orange-300 transition">{pedido.fruta_nombre ?? '-'}</p>
                    </div>
                    <div>
                      <p className="font-bold text-orange-400 text-sm">AGRICULTOR:</p>
                      <p className="group-hover:text-orange-300 transition">{(pedido.agricultor_nombre || '') + ' ' + (pedido.agricultor_apellido || '')}</p>
                    </div>
                    <div>
                      <p className="font-bold text-orange-400 text-sm">CANTIDAD:</p>
                      <p className="group-hover:text-orange-300 transition">{pedido.cantidad_cajas}</p>
                    </div>
                    <div>
                      <p className="font-bold text-orange-400 text-sm">EMPAQUE:</p>
                      <p className="group-hover:text-orange-300 transition">{pedido.empaque_nombre ?? '-'}</p>
                    </div>
                    <div className="flex items-end justify-end">
                      <span className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-full text-sm font-medium shadow">
                        SELECCIONAR
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Paso 2: Control de calidad del pedido seleccionado */}
        {step === 2 && selectedPedido && (
          <div className="relative">
            <div className="bg-[#232117] border-2 border-orange-400 rounded-xl p-4 mb-7 shadow-lg sticky top-2 z-10">
              <div className="flex flex-wrap gap-4 justify-between">
                <div>
                  <span className="text-orange-400 font-bold text-sm">EMPRESA:</span>{" "}
                  <span>{selectedPedido.empresa_nombre ?? '-'}</span>
                </div>
                <div>
                  <span className="text-orange-400 font-bold text-sm">AGRICULTOR:</span>{" "}
                  <span>{(selectedPedido.agricultor_nombre || '') + ' ' + (selectedPedido.agricultor_apellido || '')}</span>
                </div>
                <div>
                  <span className="text-orange-400 font-bold text-sm">FRUTA:</span>{" "}
                  <span>{selectedPedido.fruta_nombre ?? '-'}</span>
                </div>
                <div>
                  <span className="text-orange-400 font-bold text-sm">EMPAQUE:</span>{" "}
                  <span>{selectedPedido.empaque_nombre ?? '-'}</span>
                </div>
                <div>
                  <span className="text-orange-400 font-bold text-sm">CANTIDAD INICIAL:</span>{" "}
                  <span>{selectedPedido.cantidad_cajas}</span>
                </div>
              </div>
            </div>
            <div className="bg-[#1c1917] border border-orange-300 rounded-2xl p-6 shadow-md">
              <h2 className="text-xl font-semibold text-orange-400 mb-6">Confirmar Control de Calidad</h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block font-bold mb-2 text-orange-400">Cajas rechazadas</label>
                    <input
                      type="number"
                      min="0"
                      max={selectedPedido.cantidad_cajas}
                      value={form.rechazos}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          rechazos: parseInt(e.target.value) || 0,
                          cajas_finales: selectedPedido.cantidad_cajas - (parseInt(e.target.value) || 0)
                        })
                      }
                      className="w-full p-3 rounded-lg bg-[#242424] border border-gray-700 text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50"
                      required/>
                  </div>
                  {form.rechazos > 0 && (
                    <div>
                      <label className="block font-bold mb-2 text-orange-400">Motivo de rechazo</label>
                      <select
                        value={form.motivo_rechazo_id}
                        onChange={(e) => setForm({ ...form, motivo_rechazo_id: e.target.value })}
                        className="w-full p-3 rounded-lg bg-[#242424] border border-gray-700 text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50"
                        required>
                        <option value="">Seleccione un motivo</option>
                        {motivos.map((motivo) => (
                          <option key={motivo.id} value={motivo.id}>{motivo.nombre}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block font-bold mb-2 text-orange-400">Cajas finales</label>
                    <div className="flex items-center">
                      <p className="mr-3 text-gray-300">{form.cajas_finales}</p>
                      <button
                        type="button"
                        className="text-orange-400 hover:text-orange-300 text-sm font-medium flex items-center"
                        onClick={() => {
                          const newValue = prompt("Editar cantidad final:", form.cajas_finales.toString());
                          if (newValue && !isNaN(parseInt(newValue))) {
                            setForm({
                              ...form,
                              cajas_finales: parseInt(newValue),
                              rechazos: selectedPedido.cantidad_cajas - parseInt(newValue),
                            });
                          }
                        }}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        EDITAR
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold mb-2 text-orange-400">Comentarios</label>
                    <textarea
                      value={form.comentarios}
                      onChange={(e) => setForm({ ...form, comentarios: e.target.value })}
                      className="w-full p-3 rounded-lg bg-[#242424] border border-gray-700 text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50"
                      rows={3}/>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-8">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-5 py-2.5 rounded-full font-medium shadow border border-gray-600 transition">
                    Volver
                  </button>
                  <div className="flex items-center space-x-4">
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-2.5 rounded-full font-bold shadow-lg border-none transition">
                      Guardar y generar ticket
                    </button>
                  </div>
                </div>
              </form>
              <div className="mt-8 pt-6 border-t border-gray-700">
                <p className="text-sm text-gray-400">NOTA: Solo puedes cambiar el número de rechazos/cajas finales.</p>
              </div>
            </div>
          </div>
        )}

        {/* Logout y footer */}
        <div className="text-center mt-10">
        </div>
        <div className="mt-6 text-xs text-gray-400 text-center">
          © {new Date().getFullYear()} El Molinito
        </div>
      </div>
    </div>
  );
}
