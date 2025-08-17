import { useEffect, useMemo, useState } from 'react'
import withGuard from '@/components/withGuard'
import { FiHome } from 'react-icons/fi'
import { useRouter } from 'next/router'

type Rol = { id:number, nombre:string, descripcion?:string }
type Seccion = { id:number, clave:string, titulo:string }
type Usuario = { id:number, email:string, nombre:string, apellido:string, rol_id:number, rol_nombre:string, activo:boolean, secciones:string[] }

type FilaUsuarioProps = {
  u: Usuario
  roles: Rol[]
  secciones: Seccion[]
  permisosUsuario: Record<number, Set<number>>
  onToggleSeccionUsuario: (usuarioId:number, seccionId:number)=>void
  onGuardarPermisosUsuario: (usuarioId:number)=>void
  onActualizarUsuario: (u: Usuario, nuevo: Partial<Usuario> & { pass?:string }) => void
  textMain: string
  textSecondary: string
}

function BadgeRol({ nombre }: { nombre:string }) {
  return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#232323] border border-gray-600 text-orange-400">{nombre||'sin rol'}</span>
}

function Modal({
  open,
  title,
  onClose,
  children
}:{
  open:boolean
  title:string
  onClose:()=>void
  children:React.ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>
      <div className="relative w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl border border-gray-700 bg-[#1a1a1a] shadow-xl">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-700">
          <div className="text-orange-400 font-semibold">{title}</div>
          <button onClick={onClose} className="px-3 py-1 rounded-lg border border-gray-600 text-white bg-[#232323] hover:bg-gray-800">Cerrar</button>
        </div>
        <div className="p-5 overflow-auto">{children}</div>
      </div>
    </div>
  )
}

function PermisosGrid({
  secciones,
  baseClaves,
  pendingIds,
  onToggle
}:{
  secciones: Seccion[]
  baseClaves: string[]
  pendingIds: Set<number>
  onToggle: (id:number)=>void
}) {
  const [query, setQuery] = useState('')
  const baseIds = useMemo(()=>{
    const set = new Set<number>()
    for (const s of secciones) if (baseClaves.includes(s.clave)) set.add(s.id)
    return set
  },[secciones, baseClaves])
  const finalIds = useMemo(()=>{
    const set = new Set<number>(Array.from(baseIds))
    for (const id of pendingIds) set.add(id)
    return set
  },[baseIds, pendingIds])
  const seleccionadas = useMemo(()=>secciones.filter(s=>finalIds.has(s.id)),[secciones, finalIds])
  const disponibles = useMemo(()=>{
    const k = query.trim().toLowerCase()
    const lista = secciones.filter(s=>!finalIds.has(s.id))
    if (!k) return lista
    return lista.filter(s=>s.titulo.toLowerCase().includes(k) || s.clave.toLowerCase().includes(k))
  },[secciones, finalIds, query])
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="rounded-2xl border border-gray-700 bg-[#232323]">
        <div className="px-4 py-3 text-sm font-semibold text-orange-400">Seleccionadas</div>
        <div className="px-4 pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 max-h-72 overflow-auto">
            {seleccionadas.length===0 && <div className="text-sm text-white/80">sin secciones</div>}
            {seleccionadas.map(s=>(
              <label key={'sel-'+s.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-600 bg-[#1f1f1f] text-white">
                <input type="checkbox" checked onChange={()=>onToggle(s.id)} className="accent-gray-500 w-4 h-4"/>
                <span className="truncate">{s.titulo}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-gray-700 bg-[#232323]">
        <div className="px-4 py-3 text-sm font-semibold text-orange-400">Disponibles</div>
        <div className="px-4 pb-4">
          <div className="mb-3">
            <input className="w-full border-2 border-gray-700 bg-[#1a1a1a] text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400" placeholder="buscar seccion" value={query} onChange={e=>setQuery(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 max-h-72 overflow-auto">
            {disponibles.length===0 && <div className="text-sm text-white/80">no hay mas secciones</div>}
            {disponibles.map(s=>(
              <label key={'dis-'+s.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-700 bg-[#1a1a1a] text-white">
                <input type="checkbox" checked={false} onChange={()=>onToggle(s.id)} className="accent-gray-500 w-4 h-4"/>
                <span className="truncate">{s.titulo}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function FilaUsuario(props: FilaUsuarioProps) {
  const { u, roles, secciones, permisosUsuario, onToggleSeccionUsuario, onGuardarPermisosUsuario, onActualizarUsuario, textMain, textSecondary } = props
  const [nombre, setNombre] = useState(u.nombre)
  const [apellido, setApellido] = useState(u.apellido)
  const [email, setEmail] = useState(u.email)
  const [rolId, setRolId] = useState(u.rol_id)
  const [activo, setActivo] = useState(u.activo)
  const [pass, setPass] = useState('')
  const [openModal, setOpenModal] = useState(false)
  const checkedSet = permisosUsuario[u.id] ? permisosUsuario[u.id] : new Set<number>()
  const input = 'border-2 border-gray-700 bg-[#1a1a1a] text-white rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-gray-400'
  const btnPri = 'px-3 py-1 rounded-lg border text-sm font-semibold shadow-sm bg-gray-900 border-gray-700 text-white hover:bg-gray-800'
  const btnSec = 'px-3 py-1 rounded-lg border text-sm font-semibold shadow-sm bg-[#232323] border-gray-700 text-white hover:bg-gray-800'
  return (
    <>
      <tr className="hidden md:table-row border-b border-gray-800 align-top">
        <td className="p-2">
          <div className="flex gap-2">
            <input className={`${input} w-32`} value={nombre} onChange={e=>setNombre(e.target.value)}/>
            <input className={`${input} w-32`} value={apellido} onChange={e=>setApellido(e.target.value)}/>
          </div>
        </td>
        <td className="p-2">
          <input className={`${input} w-64`} value={email} onChange={e=>setEmail(e.target.value)}/>
        </td>
        <td className="p-2">
          <div className="flex items-center gap-2">
            <select className={input} value={rolId} onChange={e=>setRolId(Number(e.target.value))}>
              {roles.map(r=><option key={r.id} value={r.id}>{r.nombre}</option>)}
            </select>
            <BadgeRol nombre={roles.find(r=>r.id===rolId)?.nombre||''}/>
          </div>
        </td>
        <td className="p-2">
          <input className="accent-gray-500 w-4 h-4" type="checkbox" checked={activo} onChange={e=>setActivo(e.target.checked)}/>
        </td>
        <td className="p-2">
          <div className="flex flex-wrap gap-2">
            <button className={btnPri} onClick={()=>onActualizarUsuario(u,{ email, nombre, apellido, rol_id:rolId, activo })}>Guardar</button>
            <button className={btnSec} onClick={()=>setOpenModal(true)}>Permisos</button>
          </div>
        </td>
      </tr>

      <tr className="md:hidden">
        <td className="p-0">
          <div className="mb-3 rounded-2xl border border-gray-700 bg-[#232323] p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className={`text-base font-bold ${textMain}`}>{u.nombre} {u.apellido}</div>
              <BadgeRol nombre={u.rol_nombre}/>
            </div>
            <div className={`text-sm break-all ${textSecondary}`}>{u.email}</div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <input className={`col-span-1 ${input}`} value={nombre} onChange={e=>setNombre(e.target.value)} placeholder="nombre"/>
              <input className={`col-span-1 ${input}`} value={apellido} onChange={e=>setApellido(e.target.value)} placeholder="apellido"/>
              <input className={`col-span-2 ${input}`} value={email} onChange={e=>setEmail(e.target.value)} placeholder="email"/>
              <select className={input} value={rolId} onChange={e=>setRolId(Number(e.target.value))}>
                {roles.map(r=><option key={r.id} value={r.id}>{r.nombre}</option>)}
              </select>
              <label className="inline-flex items-center gap-2 text-white">
                <input className="accent-gray-500 w-4 h-4" type="checkbox" checked={activo} onChange={e=>setActivo(e.target.checked)}/>
                <span>activo</span>
              </label>
            </div>
            <div className="mt-3 flex flex-col sm:flex-row gap-2">
              <button className={btnPri} onClick={()=>onActualizarUsuario(u,{ email, nombre, apellido, rol_id:rolId, activo })}>Guardar</button>
              <button className={btnSec} onClick={()=>setOpenModal(true)}>Permisos</button>
            </div>
          </div>
        </td>
      </tr>

      <Modal open={openModal} title="Permisos por usuario" onClose={()=>setOpenModal(false)}>
        <PermisosGrid
          secciones={secciones}
          baseClaves={u.secciones}
          pendingIds={checkedSet}
          onToggle={(id)=>onToggleSeccionUsuario(u.id, id)}
        />
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button className={btnPri} onClick={()=>{ onGuardarPermisosUsuario(u.id); setOpenModal(false) }}>Guardar permisos</button>
          <input className="border-2 border-gray-700 bg-[#1a1a1a] text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400" placeholder="nueva contrasena" type="password" value={pass} onChange={e=>setPass(e.target.value)}/>
          <button className={btnSec} onClick={()=>onActualizarUsuario(u,{ pass })}>Reset pass</button>
        </div>
      </Modal>
    </>
  )
}

function UsuariosAdmin() {
  const router = useRouter()
  const [roles, setRoles] = useState<Rol[]>([])
  const [secciones, setSecciones] = useState<Seccion[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [filtroRol, setFiltroRol] = useState<number| 'todos'>('todos')
  const [form, setForm] = useState({ email:'', pass:'', nombre:'', apellido:'', rol_id:1, activo:true })
  const [guardando, setGuardando] = useState(false)
  const [tab, setTab] = useState<'usuarios'|'roles'>('usuarios')
  const [permisosRol, setPermisosRol] = useState<Record<number, Set<number>>>({})
  const [permisosUsuario, setPermisosUsuario] = useState<Record<number, Set<number>>>({})
  const [rolModalId, setRolModalId] = useState<number|null>(null)
  const textMain = 'text-orange-400'
  const textSecondary = 'text-white'
  const navTab = (active:boolean)=> active ? 'bg-gray-900 text-orange-400 border border-gray-700' : 'bg-[#232323] border border-gray-700 text-white hover:bg-gray-800'

  const cargar = () => {
    Promise.all([
      fetch('/api/roles/listar').then(r=>r.json()),
      fetch('/api/secciones/listar').then(r=>r.json()),
      fetch('/api/usuarios/listar').then(r=>r.json())
    ]).then(([r1,r2,r3])=>{
      setRoles(r1.roles||[])
      setSecciones(r2.secciones||[])
      setUsuarios(r3.usuarios||[])
    })
  }

  useEffect(()=>{ cargar() },[])

  const usuariosFiltrados = useMemo(()=>{
    const k = busqueda.trim().toLowerCase()
    const base = usuarios.filter(u => {
      if (filtroRol !== 'todos' && u.rol_id !== filtroRol) return false
      if (!k) return true
      return (u.email||'').toLowerCase().includes(k) || (u.nombre||'').toLowerCase().includes(k) || (u.apellido||'').toLowerCase().includes(k) || (u.rol_nombre||'').toLowerCase().includes(k)
    })
    return base
  },[usuarios,busqueda,filtroRol])

  const crearUsuario = () => {
    if (!form.email || !form.pass || !form.nombre) return
    setGuardando(true)
    fetch('/api/usuarios/crear',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) })
    .then(r=>r.json()).then(()=>{ setForm({ email:'', pass:'', nombre:'', apellido:'', rol_id:1, activo:true }); cargar() })
    .finally(()=>setGuardando(false))
  }

  const actualizarUsuario = (u: Usuario, nuevo: Partial<Usuario> & { pass?:string }) => {
    const body = { id: u.id, email: nuevo.email ?? u.email, pass: nuevo.pass ?? '', nombre: nuevo.nombre ?? u.nombre, apellido: nuevo.apellido ?? u.apellido, rol_id: nuevo.rol_id ?? u.rol_id, activo: nuevo.activo ?? u.activo }
    setGuardando(true)
    fetch('/api/usuarios/actualizar',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) })
    .then(()=>cargar())
    .finally(()=>setGuardando(false))
  }

  const toggleSeccionUsuario = (usuarioId:number, seccionId:number) => {
    setPermisosUsuario(p=>{
      const s = new Set(p[usuarioId] ? Array.from(p[usuarioId]) : [])
      if (s.has(seccionId)) s.delete(seccionId); else s.add(seccionId)
      return { ...p, [usuarioId]: s }
    })
  }

  const guardarPermisosUsuario = (usuarioId:number) => {
    const setIds = permisosUsuario[usuarioId] ? Array.from(permisosUsuario[usuarioId]) : []
    setGuardando(true)
    fetch('/api/usuarios/permisos/guardar',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ usuario_id: usuarioId, secciones: setIds }) })
    .then(()=>cargar())
    .finally(()=>setGuardando(false))
  }

  const toggleSeccionRol = (rolId:number, seccionId:number) => {
    setPermisosRol(p=>{
      const s = new Set(p[rolId] ? Array.from(p[rolId]) : [])
      if (s.has(seccionId)) s.delete(seccionId); else s.add(seccionId)
      return { ...p, [rolId]: s }
    })
  }

  const guardarPermisosRol = (rolId:number) => {
    const setIds = permisosRol[rolId] ? Array.from(permisosRol[rolId]) : []
    setGuardando(true)
    fetch('/api/roles/permisos/guardar',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ rol_id: rolId, secciones: setIds }) })
    .then(()=>cargar())
    .finally(()=>setGuardando(false))
  }

  const rolActual = useMemo(()=>roles.find(r=>r.id===rolModalId)||null,[rolModalId, roles])

  return (
    <div className="min-h-screen bg-[#161616]">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <header className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className={`text-3xl font-extrabold tracking-tight ${textMain}`}>Usuarios</h1>
            <p className={`mt-1 ${textSecondary}`}>Administra usuarios, roles y accesos por seccion.</p>
          </div>
          <button
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold transition-colors ${navTab(false)}`}
            onClick={() => router.push('/panel/administrador')}
            title="Ir al menu principal"
          >
            <FiHome className="text-lg" />
            <span className="hidden sm:inline">Menu principal</span>
          </button>
        </header>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div className="flex gap-2">
            <button onClick={()=>setTab('usuarios')} className={`px-4 py-2 rounded-lg border text-sm font-semibold shadow-sm ${navTab(tab==='usuarios')}`}>Usuarios</button>
            <button onClick={()=>setTab('roles')} className={`px-4 py-2 rounded-lg border text-sm font-semibold shadow-sm ${navTab(tab==='roles')}`}>Permisos por rol</button>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input className="border-2 border-gray-700 bg-[#1a1a1a] text-white rounded-lg px-3 py-2 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-gray-400" placeholder="buscar" value={busqueda} onChange={e=>setBusqueda(e.target.value)}/>
            <select className="border-2 border-gray-700 bg-[#1a1a1a] text-white rounded-lg px-3 py-2 w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-gray-400" value={String(filtroRol)} onChange={e=>setFiltroRol(e.target.value==='todos'?'todos':Number(e.target.value))}>
              <option value="todos">todos los roles</option>
              {roles.map(r=><option key={'fr'+r.id} value={r.id}>{r.nombre}</option>)}
            </select>
          </div>
        </div>

        {tab==='usuarios' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 rounded-2xl shadow-lg p-4 border border-gray-700 bg-[#232323]">
              <div className={`text-lg font-bold ${textMain} mb-3`}>Crear usuario</div>
              <div className="flex flex-col gap-3">
                <input className="border-2 border-gray-700 bg-[#1a1a1a] text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400" placeholder="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
                <input className="border-2 border-gray-700 bg-[#1a1a1a] text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400" placeholder="contrasena" type="password" value={form.pass} onChange={e=>setForm({...form,pass:e.target.value})}/>
                <input className="border-2 border-gray-700 bg-[#1a1a1a] text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400" placeholder="nombre" value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})}/>
                <input className="border-2 border-gray-700 bg-[#1a1a1a] text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400" placeholder="apellido" value={form.apellido} onChange={e=>setForm({...form,apellido:e.target.value})}/>
                <select className="border-2 border-gray-700 bg-[#1a1a1a] text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400" value={form.rol_id} onChange={e=>setForm({...form,rol_id:Number(e.target.value)})}>
                  {roles.map(r=><option key={r.id} value={r.id}>{r.nombre}</option>)}
                </select>
                <label className="inline-flex items-center gap-2 text-white">
                  <input className="accent-gray-500 w-4 h-4" type="checkbox" checked={form.activo} onChange={e=>setForm({...form,activo:e.target.checked})}/>
                  <span>activo</span>
                </label>
                <button disabled={guardando} onClick={crearUsuario} className={`px-4 py-2 rounded-lg border text-sm font-semibold shadow-sm ${guardando?'opacity-70':'bg-gray-900'} border-gray-700 text-white hover:bg-gray-800`}>{guardando?'Guardando...':'Crear'}</button>
              </div>
            </div>

            <div className="lg:col-span-2 rounded-2xl shadow-lg p-4 border border-gray-700 bg-[#232323]">
              <div className={`text-lg font-bold ${textMain} mb-3`}>Listado</div>
              <div className="overflow-x-auto">
                <table className="hidden md:table min-w-full text-sm">
                  <thead>
                    <tr className="text-left uppercase text-xs text-orange-400 bg-[#1a1a1a] border-y border-gray-700">
                      <th className="p-2">Nombre</th>
                      <th className="p-2">Email</th>
                      <th className="p-2">Rol</th>
                      <th className="p-2">Activo</th>
                      <th className="p-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuariosFiltrados.map(u=>(
                      <FilaUsuario
                        key={u.id}
                        u={u}
                        roles={roles}
                        secciones={secciones}
                        permisosUsuario={permisosUsuario}
                        onToggleSeccionUsuario={toggleSeccionUsuario}
                        onGuardarPermisosUsuario={guardarPermisosUsuario}
                        onActualizarUsuario={actualizarUsuario}
                        textMain={textMain}
                        textSecondary={textSecondary}
                      />
                    ))}
                  </tbody>
                </table>
                <table className="md:hidden w-full">
                  <tbody>
                    {usuariosFiltrados.map(u=>(
                      <FilaUsuario
                        key={'m-'+u.id}
                        u={u}
                        roles={roles}
                        secciones={secciones}
                        permisosUsuario={permisosUsuario}
                        onToggleSeccionUsuario={toggleSeccionUsuario}
                        onGuardarPermisosUsuario={guardarPermisosUsuario}
                        onActualizarUsuario={actualizarUsuario}
                        textMain={textMain}
                        textSecondary={textSecondary}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab==='roles' && (
          <div className="rounded-2xl shadow-lg p-4 border border-gray-700 bg-[#232323]">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {roles.map(r=>(
                <div key={'rol-'+r.id} className="rounded-2xl p-4 border border-gray-700 bg-[#232323]">
                  <div className="mb-3 flex items-center justify-between">
                    <div className={`font-bold text-base ${textMain}`}>{r.nombre}</div>
                    <BadgeRol nombre={r.nombre}/>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <button className="px-4 py-2 rounded-lg border text-sm font-semibold shadow-sm bg-gray-900 border-gray-700 text-white hover:bg-gray-800" onClick={()=>setRolModalId(r.id)}>Configurar permisos</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal open={rolModalId!==null} title={rolActual ? 'Permisos del rol: '+rolActual.nombre : 'Permisos del rol'} onClose={()=>setRolModalId(null)}>
        {rolActual && (
          <>
            <PermisosGrid
              secciones={secciones}
              baseClaves={[]}
              pendingIds={permisosRol[rolActual.id]||new Set<number>()}
              onToggle={(id)=>toggleSeccionRol(rolActual.id, id)}
            />
            <div className="mt-5">
              <button className="px-4 py-2 rounded-lg border text-sm font-semibold shadow-sm bg-gray-900 border-gray-700 text-white hover:bg-gray-800" onClick={()=>{ if (rolActual) guardarPermisosRol(rolActual.id); setRolModalId(null) }}>Guardar permisos de rol</button>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}

export default withGuard('panel_usuarios')(UsuariosAdmin)
