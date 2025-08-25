import { useEffect, useMemo, useState } from 'react'
import withGuard from '@/components/withGuard'
import { useUi } from '@/components/ui-context'
import { FiHome, FiX, FiUsers, FiPlus, FiEdit2, FiShield, FiSearch, FiUserCheck, FiUserX } from 'react-icons/fi'
import { useRouter } from 'next/router'

type Rol = { id:number, nombre:string, descripcion?:string }
type Seccion = { id:number, clave:string, titulo:string }
type Usuario = { id:number, email:string, nombre:string, apellido:string, rol_id:number, rol_nombre:string, activo:boolean, secciones:string[] }

function BadgeRol({ nombre, darkMode }: { nombre:string, darkMode:boolean }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
      darkMode
        ? 'bg-[#1f1f1f] border-[#3a3a3a] text-orange-300'
        : 'bg-orange-50 border-orange-200 text-orange-700'
    }`}>
      {nombre || 'sin rol'}
    </span>
  )
}

function Drawer({
  open,
  title,
  onClose,
  children,
  darkMode
}:{
  open:boolean
  title:string
  onClose:()=>void
  children:React.ReactNode
  darkMode:boolean
}) {
  const bg = darkMode ? 'bg-[#1a1a1a] border-gray-700' : 'bg-white border-orange-200'
  const topbar = darkMode ? 'border-gray-700' : 'border-orange-200'
  const btn = darkMode
    ? 'p-2 rounded-lg border border-gray-600 text-white bg-[#232323] hover:bg-gray-800'
    : 'p-2 rounded-lg border border-orange-300 text-[#1a1a1a] bg-white hover:bg-orange-50'
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity ${open?'opacity-100 pointer-events-auto':'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <aside
        className={`fixed right-0 top-0 h-full w-full sm:w-[720px] md:w-[860px] xl:w-[980px] ${bg} border-l z-50 transform transition-transform ${
          open?'translate-x-0':'translate-x-full'
        }`}
      >
        <div className={`flex items-center justify-between px-5 py-4 border-b ${topbar}`}>
          <div className={`${darkMode ? 'text-orange-300' : 'text-orange-700'} font-semibold truncate`}>{title}</div>
          <button onClick={onClose} className={btn}>
            <FiX />
          </button>
        </div>
        <div className="h-[calc(100%-56px)] overflow-auto p-5">
          {children}
        </div>
      </aside>
    </>
  )
}

function Modal({
  open,
  title,
  onClose,
  children,
  darkMode
}:{
  open:boolean
  title:string
  onClose:()=>void
  children:React.ReactNode
  darkMode:boolean
}) {
  if (!open) return null
  const frame = darkMode
    ? 'border border-gray-700 bg-[#1a1a1a]'
    : 'border border-orange-200 bg-white'
  const head = darkMode ? 'border-gray-700 text-orange-300' : 'border-orange-200 text-orange-700'
  const btn = darkMode
    ? 'px-3 py-1 rounded-lg border border-gray-600 text-white bg-[#232323] hover:bg-gray-800'
    : 'px-3 py-1 rounded-lg border border-orange-300 text-[#1a1a1a] bg-white hover:bg-orange-50'
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>
      <div className={`relative w-full max-w-6xl max-h-[88vh] overflow-hidden rounded-2xl shadow-xl ${frame}`}>
        <div className={`flex items-center justify-between px-5 py-3 border-b ${head}`}>
          <div className="font-semibold truncate">{title}</div>
          <button onClick={onClose} className={btn}>Cerrar</button>
        </div>
        <div className="p-5 overflow-auto">{children}</div>
      </div>
    </div>
  )
}

function PickPermisos({
  secciones,
  selectedIds,
  onToggle,
  onClear,
  onSelectAll,
  darkMode
}:{
  secciones: Seccion[]
  selectedIds: Set<number>
  onToggle: (id:number)=>void
  onClear: ()=>void
  onSelectAll: ()=>void
  darkMode: boolean
}) {
  const [query, setQuery] = useState('')
  const seleccionadas = useMemo(()=>secciones.filter(s=>selectedIds.has(s.id)),[secciones, selectedIds])
  const disponibles = useMemo(()=>{
    const k = query.trim().toLowerCase()
    const lista = secciones.filter(s=>!selectedIds.has(s.id))
    if (!k) return lista
    return lista.filter(s=>s.titulo.toLowerCase().includes(k) || s.clave.toLowerCase().includes(k))
  },[secciones, selectedIds, query])

  const card = darkMode ? 'border border-[#353535] bg-[#232323]' : 'border border-orange-200 bg-white'
  const sticky = darkMode ? 'bg-[#232323] border-[#353535]' : 'bg-white border-orange-200'
  const input =
    darkMode
      ? 'w-full border-2 border-[#353535] bg-[#1a1a1a] text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400'
      : 'w-full border-2 border-orange-200 bg-white text-[#1a1a1a] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300'
  const btn =
    darkMode
      ? 'px-2 py-1 rounded-lg border text-xs font-semibold shadow-sm bg-[#1a1a1a] border-gray-700 text-white hover:bg-gray-800'
      : 'px-2 py-1 rounded-lg border text-xs font-semibold shadow-sm bg-white border-orange-300 text-[#1a1a1a] hover:bg-orange-50'

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
        <div className={`rounded-2xl ${card} relative`}>
          <div className={`sticky top-0 z-10 flex items-center justify-between px-4 py-3 ${sticky}`}>
            <div className={`text-sm font-semibold ${darkMode ? 'text-orange-300' : 'text-orange-700'}`}>Seleccionadas</div>
            <div className="flex gap-2">
              <button onClick={onClear} className={btn}>Quitar todo</button>
              <button onClick={onSelectAll} className={btn}>Seleccionar todo</button>
            </div>
          </div>
          <div className="px-4 pb-4">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3 max-h-[60vh] overflow-auto">
              {seleccionadas.length===0 && <div className={`text-sm ${darkMode?'text-white/80':'text-[#666]'}`}>sin secciones</div>}
              {seleccionadas.map(s=>(
                <label key={'sel-'+s.id} className={`group rounded-xl ${darkMode?'border border-gray-600 bg-[#1f1f1f]':'border border-orange-200 bg-orange-50'} p-4`}>
                  <div className="flex items-start gap-3">
                    <input type="checkbox" checked={true} onChange={()=>onToggle(s.id)} className="accent-gray-500 w-5 h-5 mt-0.5"/>
                    <div className="w-full text-sm md:text-base leading-snug break-words whitespace-normal [overflow-wrap:anywhere] [word-break:break-word]">
                      {s.titulo}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className={`rounded-2xl ${card} relative`}>
          <div className={`sticky top-0 z-10 px-4 py-3 ${sticky}`}>
            <div className={`text-sm font-semibold ${darkMode ? 'text-orange-300' : 'text-orange-700'} mb-2`}>Disponibles</div>
            <input className={input} placeholder="buscar seccion" value={query} onChange={e=>setQuery(e.target.value)} />
          </div>
          <div className="px-4 pb-4">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3 max-h-[60vh] overflow-auto">
              {disponibles.length===0 && <div className={`text-sm ${darkMode?'text-white/80':'text-[#666]'}`}>no hay más secciones</div>}
              {disponibles.map(s=>(
                <label key={'dis-'+s.id} className={`group rounded-xl ${darkMode?'border border-gray-700 bg-[#1a1a1a]':'border border-orange-200 bg-white'} p-4`}>
                  <div className="flex items-start gap-3">
                    <input type="checkbox" checked={false} onChange={()=>onToggle(s.id)} className="accent-gray-500 w-5 h-5 mt-0.5"/>
                    <div className="w-full text-sm md:text-base leading-snug break-words whitespace-normal [overflow-wrap:anywhere] [word-break:break-word]">
                      {s.titulo}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function UsuarioCard({
  u,
  rolActual,
  onOpen,
  darkMode
}:{
  u: Usuario
  rolActual: string
  onOpen: ()=>void
  darkMode: boolean
}) {
  const card = darkMode ? 'border border-[#353535] bg-[#232323] hover:bg-[#2a2a2a]' : 'border border-orange-200 bg-white hover:bg-orange-50'
  const textMuted = darkMode ? 'text-white/90' : 'text-[#333]'
  return (
    <button onClick={onOpen} className={`text-left rounded-2xl p-4 shadow-sm focus:outline-none focus:ring-2 ${darkMode?'focus:ring-gray-500':'focus:ring-orange-300'} ${card}`}>
      <div className="flex items-center justify-between">
        <div className={`text-base font-bold ${darkMode?'text-orange-300':'text-orange-700'}`}>{u.nombre} {u.apellido}</div>
        <BadgeRol nombre={rolActual} darkMode={darkMode}/>
      </div>
      <div className={`text-sm break-all ${textMuted}`}>{u.email}</div>
      <div className="mt-3 flex items-center gap-3">
        <span className={`px-2 py-0.5 rounded-full text-xs border inline-flex items-center gap-1 ${
          u.activo
            ? (darkMode ? 'border-emerald-600 text-emerald-400 bg-[#1c2924]' : 'border-emerald-300 text-emerald-700 bg-emerald-50')
            : (darkMode ? 'border-gray-600 text-gray-300 bg-[#1f1f1f]' : 'border-gray-300 text-gray-700 bg-gray-50')
        }`}>
          {u.activo ? <FiUserCheck/> : <FiUserX/>} {u.activo?'activo':'inactivo'}
        </span>
      </div>
    </button>
  )
}

export default withGuard('panel_usuarios')(function UsuariosAdmin() {
  const router = useRouter()
  const { darkMode } = useUi()

  const [vista, setVista] = useState<'inicio'|'listado'|'crear'>('inicio')

  const [roles, setRoles] = useState<Rol[]>([])
  const [secciones, setSecciones] = useState<Seccion[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])

  const [busqueda, setBusqueda] = useState('')
  const [filtroRol, setFiltroRol] = useState<number | 'todos'>('todos')
  const [guardando, setGuardando] = useState(false)

  const [crear, setCrear] = useState({ email:'', pass:'', nombre:'', apellido:'', rol_id:1, activo:true })

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerTitulo, setDrawerTitulo] = useState('')
  const [usuarioSelId, setUsuarioSelId] = useState<number|null>(null)
  const [editUsuario, setEditUsuario] = useState<{email:string,nombre:string,apellido:string,rol_id:number,activo:boolean,pass:string}>({ email:'', nombre:'', apellido:'', rol_id:1, activo:true, pass:'' })

  const [permsUsuarioSel, setPermsUsuarioSel] = useState<Set<number>>(new Set())
  const [permModalOpen, setPermModalOpen] = useState(false)
  const [permTemp, setPermTemp] = useState<Set<number>>(new Set())

  const softShadow = 'shadow-[0_2px_10px_0_rgba(0,0,0,0.06)]'
  const input = darkMode
    ? 'border-2 border-[#353535] bg-[#1a1a1a] text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400'
    : 'border-2 border-orange-200 bg-white text-[#1a1a1a] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300'
  const btnPri = darkMode
    ? 'px-4 py-2 rounded-lg border text-sm font-semibold shadow-sm bg-gray-900 border-gray-700 text-white hover:bg-gray-800'
    : 'px-4 py-2 rounded-lg border text-sm font-semibold shadow-sm bg-orange-600 border-orange-700 text-white hover:bg-orange-700'
  const btnSec = darkMode
    ? 'px-4 py-2 rounded-lg border text-sm font-semibold shadow-sm bg-[#232323] border-gray-700 text-white hover:bg-gray-800'
    : 'px-4 py-2 rounded-lg border text-sm font-semibold shadow-sm bg-white border-orange-300 text-[#1a1a1a] hover:bg-orange-50'

  const claveToId = useMemo(()=>{
    const m = new Map<string, number>()
    for (const s of secciones) m.set(s.clave, s.id)
    return m
  },[secciones])

  const cargar = () => {
    Promise.all([
      fetch('/api/roles/listar').then(r=>r.json()).catch(()=>({roles:[]})),
      fetch('/api/secciones/listar').then(r=>r.json()).catch(()=>({secciones:[]})),
      fetch('/api/usuarios/listar').then(r=>r.json()).catch(()=>({usuarios:[]}))
    ]).then(([r1,r2,r3])=>{
      setRoles(r1.roles||[])
      setSecciones(r2.secciones||[])
      setUsuarios(r3.usuarios||[])
    })
  }

  useEffect(()=>{ cargar() },[])

  const usuariosFiltrados = useMemo(()=>{
    const k = busqueda.trim().toLowerCase()
    return usuarios.filter(u=>{
      if (filtroRol!=='todos' && u.rol_id!==filtroRol) return false
      if (!k) return true
      return (u.email||'').toLowerCase().includes(k)
        || (u.nombre||'').toLowerCase().includes(k)
        || (u.apellido||'').toLowerCase().includes(k)
        || (u.rol_nombre||'').toLowerCase().includes(k)
    })
  },[usuarios,busqueda,filtroRol])

  const crearUsuario = () => {
    if (!crear.email || !crear.pass || !crear.nombre) return
    setGuardando(true)
    fetch('/api/usuarios/crear',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(crear) })
      .then(r=>r.json())
      .then(()=>{
        setCrear({ email:'', pass:'', nombre:'', apellido:'', rol_id:1, activo:true })
        cargar()
        setVista('listado')
      })
      .finally(()=>setGuardando(false))
  }

  const abrirUsuario = (u: Usuario) => {
    const ids = new Set<number>()
    for (const c of u.secciones||[]) {
      const id = claveToId.get(c)
      if (typeof id==='number') ids.add(id)
    }
    setUsuarioSelId(u.id)
    setEditUsuario({ email:u.email, nombre:u.nombre, apellido:u.apellido, rol_id:u.rol_id, activo:u.activo, pass:'' })
    setPermsUsuarioSel(ids)
    setDrawerTitulo('Editar usuario: '+u.nombre+' '+u.apellido)
    setDrawerOpen(true)
  }

  const abrirPermisosModal = () => {
    setPermTemp(new Set(permsUsuarioSel))
    setPermModalOpen(true)
  }

  const togglePermTemp = (id:number) => {
    setPermTemp(prev=>{
      const s = new Set(prev)
      if (s.has(id)) s.delete(id); else s.add(id)
      return s
    })
  }

  const guardarPermisosModal = () => {
    if (usuarioSelId===null) return
    const arr = Array.from(permTemp)
    setGuardando(true)
    fetch('/api/usuarios/permisos/guardar',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ usuario_id: usuarioSelId, secciones: arr }) })
      .then(()=>{
        setPermsUsuarioSel(new Set(permTemp))
        setPermModalOpen(false)
        cargar()
      })
      .finally(()=>setGuardando(false))
  }

  const guardarUsuario = () => {
    if (usuarioSelId===null) return
    const body = { id: usuarioSelId, email: editUsuario.email, pass: editUsuario.pass||'', nombre: editUsuario.nombre, apellido: editUsuario.apellido, rol_id: editUsuario.rol_id, activo: editUsuario.activo }
    setGuardando(true)
    fetch('/api/usuarios/actualizar',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) })
      .then(()=>cargar())
      .finally(()=>setGuardando(false))
  }

  const rolNombre = (id:number)=> roles.find(r=>r.id===id)?.nombre || ''

  const hoy = new Date().toISOString().slice(0,10)
  const stats = useMemo(()=>{
    const total = usuarios.length
    const activos = usuarios.filter(u=>u.activo).length
    const inactivos = total - activos
    const porRol = roles.map(r=>({ rol: r.nombre, count: usuarios.filter(u=>u.rol_id===r.id).length }))
    return { total, activos, inactivos, porRol }
  },[usuarios, roles])

  const card = darkMode ? 'bg-[#232323] border border-[#353535]' : 'bg-[#f8f7f5] border border-orange-200'

  return (
    <div className={`${darkMode ? 'bg-[#161616] text-white' : 'bg-[#f6f4f2] text-[#1a1a1a]'} min-h-screen transition-colors duration-300`}>
      {/* Encabezado degradado */}
      <section className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-b-2xl p-6 text-white shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">Usuarios</h1>
            <p className="text-orange-100">
              {vista==='inicio' ? 'Resumen y métricas generales'
               : vista==='listado' ? 'Listado y búsqueda de usuarios'
               : 'Alta de nuevo usuario'}
            </p>
          </div>
          <button
            className="px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition flex items-center gap-2"
            onClick={() => router.push('/panel/administrador')}
            title="Ir al menú principal"
          >
            <FiHome />
            <span className="hidden sm:inline">Menú</span>
          </button>
        </div>
      </section>

      {/* Chips navegación */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setVista('inicio')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${vista==='inicio'
            ? 'bg-orange-500 text-white'
            : darkMode ? 'bg-[#353535] hover:bg-[#404040]' : 'bg-orange-100 hover:bg-orange-200'}`}
        >
          📊 Resumen
        </button>
        <button
          onClick={() => setVista('listado')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${vista==='listado'
            ? 'bg-blue-500 text-white'
            : darkMode ? 'bg-[#353535] hover:bg-[#404040]' : 'bg-orange-100 hover:bg-orange-200'}`}
        >
          <span className="inline-flex items-center gap-2"><FiUsers/> Listado</span>
        </button>
        <button
          onClick={() => setVista('crear')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${vista==='crear'
            ? 'bg-green-600 text-white'
            : darkMode ? 'bg-[#353535] hover:bg-[#404040]' : 'bg-orange-100 hover:bg-orange-200'}`}
        >
          <span className="inline-flex items-center gap-2"><FiPlus/> Crear</span>
        </button>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Vista: Resumen */}
        {vista==='inicio' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`rounded-2xl p-5 ${card} ${softShadow}`}>
              <div className="text-sm opacity-70 mb-1">Total</div>
              <div className="text-3xl font-bold">{stats.total}</div>
            </div>
            <div className={`rounded-2xl p-5 ${card} ${softShadow}`}>
              <div className="text-sm opacity-70 mb-1">Activos</div>
              <div className="text-3xl font-bold text-emerald-500">{stats.activos}</div>
            </div>
            <div className={`rounded-2xl p-5 ${card} ${softShadow}`}>
              <div className="text-sm opacity-70 mb-1">Inactivos</div>
              <div className="text-3xl font-bold text-rose-500">{stats.inactivos}</div>
            </div>
            <div className={`rounded-2xl p-5 ${card} ${softShadow}`}>
              <div className="text-sm opacity-70 mb-1">Fecha</div>
              <div className="text-3xl font-bold">{hoy}</div>
            </div>

            <div className={`md:col-span-4 rounded-2xl p-6 ${card} ${softShadow}`}>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><FiShield/> Usuarios por rol</h3>
              {roles.length===0 ? (
                <div className={`${darkMode?'text-white/80':'text-[#555]'} text-sm`}>Sin roles</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {stats.porRol.map((r)=>(
                    <div key={r.rol} className={`rounded-xl px-4 py-3 ${darkMode?'bg-[#1f1f1f] border border-[#353535]':'bg-white border border-orange-200'}`}>
                      <div className={`${darkMode?'text-orange-300':'text-orange-700'} text-sm font-semibold`}>{r.rol}</div>
                      <div className="text-2xl font-bold">{r.count}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Vista: Listado */}
        {vista==='listado' && (
          <div className="space-y-4">
            <div className={`rounded-2xl p-4 ${card} ${softShadow} flex flex-col md:flex-row md:items-center md:justify-between gap-3`}>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${darkMode?'bg-[#1a1a1a] border-[#353535]':'bg-white border-orange-200'}`}>
                <FiSearch className="opacity-70"/>
                <input
                  className={`bg-transparent outline-none ${darkMode?'text-white':'text-[#1a1a1a]'}`}
                  value={busqueda}
                  onChange={e=>setBusqueda(e.target.value)}
                  placeholder="Buscar por nombre, correo o rol"
                />
              </div>
              <div className="flex items-center gap-2">
                <select
                  className={input}
                  value={String(filtroRol)}
                  onChange={e=>setFiltroRol(e.target.value==='todos'?'todos':Number(e.target.value))}
                >
                  <option value="todos">Todos los roles</option>
                  {roles.map(r=><option key={r.id} value={r.id}>{r.nombre}</option>)}
                </select>
                <button className={btnSec} onClick={()=>setVista('crear')}>
                  <FiPlus/> Nuevo
                </button>
              </div>
            </div>

            {usuariosFiltrados.length===0 ? (
              <div className={`rounded-2xl border border-dashed ${darkMode?'border-[#3a3a3a] bg-[#1c1c1c] text-white/80':'border-orange-200 bg-orange-50 text-[#333]'} p-8 text-center`}>Sin resultados</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {usuariosFiltrados.map(u=>(
                  <UsuarioCard
                    key={u.id}
                    u={u}
                    rolActual={rolNombre(u.rol_id) || u.rol_nombre}
                    onOpen={()=>abrirUsuario(u)}
                    darkMode={darkMode}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Vista: Crear */}
        {vista==='crear' && (
          <div className={`rounded-2xl p-6 ${card} ${softShadow}`}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><FiPlus/> Crear usuario</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <input className={input} placeholder="email" value={crear.email} onChange={e=>setCrear({...crear,email:e.target.value})}/>
              <input className={input} placeholder="contraseña" type="password" value={crear.pass} onChange={e=>setCrear({...crear,pass:e.target.value})}/>
              <select className={input} value={crear.rol_id} onChange={e=>setCrear({...crear,rol_id:Number(e.target.value)})}>
                {roles.map(r=><option key={r.id} value={r.id}>{r.nombre}</option>)}
              </select>
              <input className={input} placeholder="nombre" value={crear.nombre} onChange={e=>setCrear({...crear,nombre:e.target.value})}/>
              <input className={input} placeholder="apellido" value={crear.apellido} onChange={e=>setCrear({...crear,apellido:e.target.value})}/>
              <label className="inline-flex items-center gap-2">
                <input className="accent-gray-500 w-4 h-4" type="checkbox" checked={crear.activo} onChange={e=>setCrear({...crear,activo:e.target.checked})}/>
                <span>activo</span>
              </label>
            </div>
            <div className="mt-4 flex gap-3 justify-end">
              <button className={btnSec} onClick={()=>setVista('listado')}>Cancelar</button>
              <button disabled={guardando} onClick={crearUsuario} className={`${btnPri} ${guardando?'opacity-70':''}`}>{guardando?'Guardando...':'Crear'}</button>
            </div>
          </div>
        )}
      </div>

      {/* Drawer edición */}
      <Drawer open={drawerOpen} title={drawerTitulo} onClose={()=>setDrawerOpen(false)} darkMode={darkMode}>
        {usuarioSelId!==null && (
          <div className="space-y-6">
            <div className={`rounded-2xl p-4 ${darkMode?'bg-[#232323] border border-[#353535]':'bg-white border border-orange-200'}`}>
              <div className={`text-base font-bold ${darkMode?'text-orange-300':'text-orange-700'} mb-3`}>Datos del usuario</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input className={input} placeholder="nombre" value={editUsuario.nombre} onChange={e=>setEditUsuario({...editUsuario,nombre:e.target.value})}/>
                <input className={input} placeholder="apellido" value={editUsuario.apellido} onChange={e=>setEditUsuario({...editUsuario,apellido:e.target.value})}/>
                <input className={`${input} md:col-span-2`} placeholder="email" value={editUsuario.email} onChange={e=>setEditUsuario({...editUsuario,email:e.target.value})}/>
                <select className={input} value={editUsuario.rol_id} onChange={e=>setEditUsuario({...editUsuario,rol_id:Number(e.target.value)})}>
                  {roles.map(r=><option key={r.id} value={r.id}>{r.nombre}</option>)}
                </select>
                <label className="inline-flex items-center gap-2">
                  <input className="accent-gray-500 w-4 h-4" type="checkbox" checked={editUsuario.activo} onChange={e=>setEditUsuario({...editUsuario,activo:e.target.checked})}/>
                  <span>activo</span>
                </label>
                <input className={input} placeholder="nueva contraseña" type="password" value={editUsuario.pass} onChange={e=>setEditUsuario({...editUsuario,pass:e.target.value})}/>
              </div>
            </div>

            <div className={`rounded-2xl p-4 ${darkMode?'bg-[#232323] border border-[#353535]':'bg-white border border-orange-200'}`}>
              <div className={`text-base font-bold ${darkMode?'text-orange-300':'text-orange-700'} mb-3`}>Permisos</div>
              <div className="flex items-center justify-between gap-3">
                <div className={`${darkMode?'text-white/80':'text-[#333]'} text-sm`}>permisos asignados: {permsUsuarioSel.size}</div>
                <button className={btnSec} onClick={()=>{
                  setPermTemp(new Set(permsUsuarioSel))
                  setPermModalOpen(true)
                }}>
                  <FiShield/> Configurar
                </button>
              </div>
            </div>

            <div className="h-16"></div>
            <div className={`fixed bottom-0 right-0 w-full sm:w-[720px] md:w-[860px] xl:w-[980px] ${darkMode?'bg-[#1a1a1a] border-t border-gray-700':'bg-white border-t border-orange-200'} p-3`}>
              <div className="flex gap-3">
                <button className={btnPri} disabled={guardando} onClick={guardarUsuario}>{guardando?'Guardando...':'Guardar cambios'}</button>
                <button className={btnSec} onClick={()=>setDrawerOpen(false)}>Cerrar</button>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Modal permisos */}
      <Modal open={permModalOpen} title="Seleccionar permisos" onClose={()=>setPermModalOpen(false)} darkMode={darkMode}>
        <PickPermisos
          secciones={secciones}
          selectedIds={permTemp}
          onToggle={(id:number)=>{
            setPermTemp(prev=>{
              const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s
            })
          }}
          onClear={()=>setPermTemp(new Set())}
          onSelectAll={()=>setPermTemp(new Set(secciones.map(s=>s.id)))}
          darkMode={darkMode}
        />
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button className={btnPri} disabled={guardando} onClick={()=>{
            if (usuarioSelId===null) return
            const arr = Array.from(permTemp)
            setGuardando(true)
            fetch('/api/usuarios/permisos/guardar',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ usuario_id: usuarioSelId, secciones: arr }) })
              .then(()=>{
                setPermsUsuarioSel(new Set(permTemp))
                setPermModalOpen(false)
                cargar()
              })
              .finally(()=>setGuardando(false))
          }}>{guardando?'Guardando...':'Guardar permisos'}</button>
          <button className={btnSec} onClick={()=>setPermModalOpen(false)}>Cancelar</button>
        </div>
      </Modal>
    </div>
  )
})
