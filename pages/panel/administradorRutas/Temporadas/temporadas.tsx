import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

type Temporada = {
  id: number;
  titulo: string;
  fecha_inicio: string;
  fecha_fin: string;
  activa: boolean;
  creado_en: string;
};

export default function TemporadasAdmin() {
  const router = useRouter();
  const [modoNoche, setModoNoche] = useState(true);
  const [temporadas, setTemporadas] = useState<Temporada[]>([]);
  const [form, setForm] = useState({
    id: 0,
    titulo: '',
    fecha_inicio: '',
    fecha_fin: '',
  });
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const temaGuardado = localStorage.getItem('tema');
    if (temaGuardado) setModoNoche(temaGuardado === 'noche');
    cargar();
  }, []);

  const cargar = () => {
    setCargando(true);
    fetch('/api/temporadas/listar')
      .then(r => r.json())
      .then(d => setTemporadas(Array.isArray(d.temporadas) ? d.temporadas : []))
      .finally(() => setCargando(false));
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const limpiar = () => {
    setForm({ id: 0, titulo: '', fecha_inicio: '', fecha_fin: '' });
  };

  const crear = async () => {
    setMensaje('');
    if (!form.titulo || !form.fecha_inicio || !form.fecha_fin) {
      setMensaje('completa');
      return;
    }
    const r = await fetch('/api/temporadas/crear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo: form.titulo,
        fecha_inicio: form.fecha_inicio,
        fecha_fin: form.fecha_fin,
      }),
    });
    if (r.ok) {
      limpiar();
      cargar();
      setMensaje('ok');
    } else {
      setMensaje('error');
    }
  };

  const guardarEdicion = async () => {
    setMensaje('');
    const r = await fetch(`/api/temporadas/editar/${form.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo: form.titulo,
        fecha_inicio: form.fecha_inicio,
        fecha_fin: form.fecha_fin,
      }),
    });
    if (r.ok) {
      limpiar();
      cargar();
      setMensaje('ok');
    } else {
      setMensaje('error');
    }
  };

  const editar = (t: Temporada) => {
    setForm({
      id: t.id,
      titulo: t.titulo,
      fecha_inicio: t.fecha_inicio.slice(0, 10),
      fecha_fin: t.fecha_fin.slice(0, 10),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activar = async (id: number) => {
    await fetch(`/api/temporadas/activar/${id}`, { method: 'POST' });
    cargar();
  };

  const bgDay = "bg-[#f6f4f2]";
  const cardDay = "bg-[#f8f7f5] border border-orange-200";
  const textDay = "text-[#1a1a1a]";
  const bgNight = "bg-[#161616]";
  const cardNight = "bg-[#232323] border border-[#353535]";
  const textNight = "text-white";
  const softShadow = "shadow-[0_2px_10px_0_rgba(0,0,0,0.06)]";

  return (
    <div className={`${modoNoche ? bgNight : bgDay} min-h-screen ${modoNoche ? textNight : textDay} transition-colors duration-300 p-6`}>
      <div className="max-w-5xl mx-auto space-y-8">
        <header className={`rounded-2xl p-6 ${modoNoche ? cardNight : cardDay} ${softShadow} flex items-center justify-between`}>
          <h1 className="text-2xl font-bold">Temporadas</h1>
          <button
            onClick={() => router.push('/panel/administrador')}
            className="px-4 py-2 rounded-xl border border-orange-400"
          >
            Volver
          </button>
        </header>

        <section className={`rounded-2xl p-6 ${modoNoche ? cardNight : cardDay} ${softShadow}`}>
          <h2 className="text-lg font-semibold mb-4">{form.id ? 'Editar temporada' : 'Nueva temporada'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              name="titulo"
              value={form.titulo}
              onChange={onChange}
              placeholder="Titulo"
              className={`px-4 py-3 rounded-xl outline-none ${modoNoche ? 'bg-[#1f1f1f] border border-[#353535] text-white' : 'bg-white border border-orange-200'}`}
            />
            <input
              type="date"
              name="fecha_inicio"
              value={form.fecha_inicio}
              onChange={onChange}
              className={`px-4 py-3 rounded-xl outline-none ${modoNoche ? 'bg-[#1f1f1f] border border-[#353535] text-white' : 'bg-white border border-orange-200'}`}
            />
            <input
              type="date"
              name="fecha_fin"
              value={form.fecha_fin}
              onChange={onChange}
              className={`px-4 py-3 rounded-xl outline-none ${modoNoche ? 'bg-[#1f1f1f] border border-[#353535] text-white' : 'bg-white border border-orange-200'}`}
            />
            {!form.id ? (
              <button
                onClick={crear}
                className="px-4 py-3 rounded-xl bg-orange-600 text-white font-semibold"
              >
                Crear
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={guardarEdicion}
                  className="px-4 py-3 rounded-xl bg-orange-600 text-white font-semibold"
                >
                  Guardar
                </button>
                <button
                  onClick={limpiar}
                  className="px-4 py-3 rounded-xl border border-orange-400"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
          {mensaje === 'ok' && <p className="mt-3 text-green-500">hecho</p>}
          {mensaje === 'error' && <p className="mt-3 text-red-500">error</p>}
          {mensaje === 'completa' && <p className="mt-3 text-red-500">completa los campos</p>}
        </section>

        <section className={`rounded-2xl p-6 ${modoNoche ? cardNight : cardDay} ${softShadow}`}>
          <h2 className="text-lg font-semibold mb-4">Listado</h2>
          {cargando ? (
            <div className="p-6">Cargando...</div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {temporadas.map(t => (
                <div key={t.id} className={`flex items-center justify-between rounded-xl px-4 py-3 ${modoNoche ? 'bg-[#1f1f1f] border border-[#353535]' : 'bg-white border border-orange-200'}`}>
                  <div className="flex flex-col">
                    <span className="font-bold">{t.titulo}</span>
                    <span className="text-sm">{t.fecha_inicio.slice(0,10)} a {t.fecha_fin.slice(0,10)}</span>
                    <span className={`text-sm ${t.activa ? 'text-green-500' : 'text-gray-400'}`}>{t.activa ? 'activa' : 'inactiva'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => editar(t)} className="px-3 py-2 rounded-lg border border-orange-400">Editar</button>
                    <button onClick={() => activar(t.id)} className="px-3 py-2 rounded-lg bg-orange-600 text-white">Hacer activa</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
