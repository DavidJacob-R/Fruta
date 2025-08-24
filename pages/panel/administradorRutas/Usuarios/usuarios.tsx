import { useEffect, useMemo, useState } from 'react'
import withGuard from '@/components/withGuard'
import { FiHome, FiX } from 'react-icons/fi'
import { useRouter } from 'next/router'

type Rol = { id:number, nombre:string, descripcion?:string }
type Seccion = { id:number, clave:string, titulo:string }
type Usuario = { id:number, email:string, nombre:string, apellido:string, rol_id:number, rol_nombre:string, activo:boolean, secciones:string[] }

function BadgeRol({ nombre }: { nombre:string }) {
  return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#232323] border border-gray-600 text-orange-400">{nombre||'sin rol'}</span>
}

function Drawer({
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
  return (
    <>
      <div className={`fixed inset-0 z-40 bg-black/60 transition-opacity ${open?'opacity-100 pointer-events-auto':'opacity-0 pointer-events-none'}`} onClick={onClose}></div>
      <aside className={`fixed right-0 top-0 h-full w-full sm:w-[720px] md:w-[860px] xl:w-[980px] bg-[#1a1a1a] border-l border-gray-700 z-50 transform transition-transform ${open?'translate-x-0':'translate-x-full'}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700">
          <div className="text-orange-400 font-semibold truncate">{title}</div>
          <button onClick={onClose} className="p-2 rounded-lg border border-gray-600 text-white bg-[#232323] hover:bg-gray-800">
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
  children
}:{
  open:boolean
  title:string
  onClose:()=>void
  children:React.ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>
      <div className="relative w-full max-w-6xl max-h-[88vh] overflow-hidden rounded-2xl border border-gray-700 bg-[#1a1a1a] shadow-xl">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-700">
          <div className="text-orange-400 font-semibold truncate">{title}</div>
          <button onClick={onClose} className="px-3 py-1 rounded-lg border border-gray-600 text-white bg-[#232323] hover:bg-gray-800">Cerrar</button>
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
  onSelectAll
}:{
  secciones: Seccion[]
  selectedIds: Set<number>
  onToggle: (id:number)=>void
  onClear: ()=>void
  onSelectAll: ()=>void
}) {
  const [query, setQuery] = useState('')
  const seleccionadas = useMemo(()=>secciones.filter(s=>selectedIds.has(s.id)),[secciones, selectedIds])
  const disponibles = useMemo(()=>{
    const k = query.trim().toLowerCase()
    const lista = secciones.filter(s=>!selectedIds.has(s.id))
    if (!k) return lista
    return lista.filter(s=>s.titulo.toLowerCase().includes(k) || s.clave.toLowerCase().includes(k))
  },[secciones, selectedIds, query])
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-gray-700 bg-[#232323] relative">
          <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-[#232323] border-b border-gray-700">
            <div className="text-sm font-semibold text-orange-400">Seleccionadas</div>
            <div className="flex gap-2">
              <button onClick={onClear} className="px-2 py-1 rounded-lg border text-xs font-semibold shadow-sm bg-[#1a1a1a] border-gray-700 text-white hover:bg-gray-800">Quitar todo</button>
              <button onClick={onSelectAll} className="px-2 py-1 rounded-lg border text-xs font-semibold shadow-sm bg-[#1a1a1a] border-gray-700 text-white hover:bg-gray-800">Seleccionar todo</button>
            </div>
          </div>
          <div className="px-4 pb-4">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3 max-h-[60vh] overflow-auto">
              {seleccionadas.length===0 && <div className="text-sm text-white/80">sin secciones</div>}
              {seleccionadas.map(s=>(
                <label key={'sel-'+s.id} className="group rounded-xl border border-gray-600 bg-[#1f1f1f] p-4">
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
        <div className="rounded-2xl border border-gray-700 bg-[#232323] relative">
          <div className="sticky top-0 z-10 px-4 py-3 bg-[#232323] border-b border-gray-700">
            <div className="text-sm font-semibold text-orange-400 mb-2">Disponibles</div>
            <input className="w-full border-2 border-gray-700 bg-[#1a1a1a] text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400" placeholder="buscar seccion" value={query} onChange={e=>setQuery(e.target.value)} />
          </div>
          <div className="px-4 pb-4">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3 max-h-[60vh] overflow-auto">
              {disponibles.length===0 && <div className="text-sm text-white/80">no hay mas secciones</div>}
              {disponibles.map(s=>(
                <label key={'dis-'+s.id} className="group rounded-xl border border-gray-700 bg-[#1a1a1a] p-4">
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
  onOpen
}:{
  u: Usuario
  rolActual: string
  onOpen: ()=>void
}) {
  return (
    <button onClick={onOpen} className="text-left rounded-2xl border border-gray-700 bg-[#232323] p-4 shadow-sm hover:bg-[#262626] focus:outline-none focus:ring-2 focus:ring-gray-500">
      <div className="flex items-center justify-between">
        <div className="text-base font-bold text-orange-400">{u.nombre} {u.apellido}</div>
        <BadgeRol nombre={rolActual}/>
      </div>
      <div className="text-sm text-white break-all">{u.email}</div>
      <div className="mt-3 flex items-center gap-3">
        <span className={`px-2 py-0.5 rounded-full text-xs border ${u.activo?'border-emerald-600 text-emerald-400 bg-[#1c2924]':'border-gray-600 text-gray-300 bg-[#1f1f1f]'}`}>{u.activo?'activo':'inactivo'}</span>
      </div>
    </button>
  )
}

export default withGuard('panel_usuarios')(function UsuariosAdmin() {
  const router = useRouter()
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

  const textMain = 'text-orange-400'
  const textSecondary = 'text-white'
  const input = 'border-2 border-gray-700 bg-[#1a1a1a] text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400'
  const btnPri = 'px-4 py-2 rounded-lg border text-sm font-semibold shadow-sm bg-gray-900 border-gray-700 text-white hover:bg-gray-800'
  const btnSec = 'px-4 py-2 rounded-lg border text-sm font-semibold shadow-sm bg-[#232323] border-gray-700 text-white hover:bg-gray-800'

  const claveToId = useMemo(()=>{
    const m = new Map<string, number>()
    for (const s of secciones) m.set(s.clave, s.id)
    return m
  },[secciones])

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
    return usuarios.filter(u=>{
      if (filtroRol!=='todos' && u.rol_id!==filtroRol) return false
      if (!k) return true
      return (u.email||'').toLowerCase().includes(k) || (u.nombre||'').toLowerCase().includes(k) || (u.apellido||'').toLowerCase().includes(k) || (u.rol_nombre||'').toLowerCase().includes(k)
    })
  },[usuarios,busqueda,filtroRol])

  const crearUsuario = () => {
    if (!crear.email || !crear.pass || !crear.nombre) return
    setGuardando(true)
    fetch('/api/usuarios/crear',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(crear) })
    .then(r=>r.json()).then(()=>{
      setCrear({ email:'', pass:'', nombre:'', apellido:'', rol_id:1, activo:true })
      cargar()
    }).finally(()=>setGuardando(false))
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

  return (
    <div className="min-h-screen bg-[#161616]">
      <div className="sticky top-0 z-30 bg-[#161616] border-b border-gray-800">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className={`text-2xl md:text-3xl font-extrabold tracking-tight ${textMain}`}>Usuarios</h1>
              <p className={`mt-1 ${textSecondary}`}>Gestiona usuarios y accesos.</p>
            </div>
            <button className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold bg-[#232323] border-gray-700 text-white hover:bg-gray-800`} onClick={()=>router.push('/panel/administrador')}>
              <FiHome className="text-lg"/>
              <span className="hidden sm:inline">Menu principal</span>
            </button>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <input className={input} placeholder="buscar" value={busqueda} onChange={e=>setBusqueda(e.target.value)}/>
            <select className={input} value={String(filtroRol)} onChange={e=>setFiltroRol(e.target.value==='todos'?'todos':Number(e.target.value))}>
              <option value="todos">todos los roles</option>
              {roles.map(r=><option key={r.id} value={r.id}>{r.nombre}</option>)}
            </select>
            <div className="hidden md:block"></div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          <div className="lg:sticky lg:top-[96px] h-max rounded-2xl shadow-lg p-4 border border-gray-700 bg-[#232323]">
            <div className={`text-lg font-bold ${textMain} mb-3`}>Crear usuario</div>
            <div className="flex flex-col gap-3">
              <input className={input} placeholder="email" value={crear.email} onChange={e=>setCrear({...crear,email:e.target.value})}/>
              <input className={input} placeholder="contrasena" type="password" value={crear.pass} onChange={e=>setCrear({...crear,pass:e.target.value})}/>
              <input className={input} placeholder="nombre" value={crear.nombre} onChange={e=>setCrear({...crear,nombre:e.target.value})}/>
              <input className={input} placeholder="apellido" value={crear.apellido} onChange={e=>setCrear({...crear,apellido:e.target.value})}/>
              <select className={input} value={crear.rol_id} onChange={e=>setCrear({...crear,rol_id:Number(e.target.value)})}>
                {roles.map(r=><option key={r.id} value={r.id}>{r.nombre}</option>)}
              </select>
              <label className="inline-flex items-center gap-2 text-white">
                <input className="accent-gray-500 w-4 h-4" type="checkbox" checked={crear.activo} onChange={e=>setCrear({...crear,activo:e.target.checked})}/>
                <span>activo</span>
              </label>
              <button disabled={guardando} onClick={crearUsuario} className={`${btnPri} ${guardando?'opacity-70':''}`}>{guardando?'Guardando...':'Crear'}</button>
            </div>
          </div>

          <div className="rounded-2xl">
            {usuariosFiltrados.length===0 && (
              <div className="rounded-2xl border border-dashed border-gray-700 bg-[#1c1c1c] p-8 text-center text-white/80">sin resultados</div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {usuariosFiltrados.map(u=>(
                <UsuarioCard
                  key={u.id}
                  u={u}
                  rolActual={rolNombre(u.rol_id) || u.rol_nombre}
                  onOpen={()=>abrirUsuario(u)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <Drawer open={drawerOpen} title={drawerTitulo} onClose={()=>setDrawerOpen(false)}>
        {usuarioSelId!==null && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-700 bg-[#232323] p-4">
              <div className={`text-base font-bold ${textMain} mb-3`}>Datos del usuario</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input className={input} placeholder="nombre" value={editUsuario.nombre} onChange={e=>setEditUsuario({...editUsuario,nombre:e.target.value})}/>
                <input className={input} placeholder="apellido" value={editUsuario.apellido} onChange={e=>setEditUsuario({...editUsuario,apellido:e.target.value})}/>
                <input className={`${input} md:col-span-2`} placeholder="email" value={editUsuario.email} onChange={e=>setEditUsuario({...editUsuario,email:e.target.value})}/>
                <select className={input} value={editUsuario.rol_id} onChange={e=>setEditUsuario({...editUsuario,rol_id:Number(e.target.value)})}>
                  {roles.map(r=><option key={r.id} value={r.id}>{r.nombre}</option>)}
                </select>
                <label className="inline-flex items-center gap-2 text-white">
                  <input className="accent-gray-500 w-4 h-4" type="checkbox" checked={editUsuario.activo} onChange={e=>setEditUsuario({...editUsuario,activo:e.target.checked})}/>
                  <span>activo</span>
                </label>
                <input className={input} placeholder="nueva contrasena" type="password" value={editUsuario.pass} onChange={e=>setEditUsuario({...editUsuario,pass:e.target.value})}/>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-700 bg-[#232323] p-4">
              <div className={`text-base font-bold ${textMain} mb-3`}>Permisos</div>
              <div className="flex items-center justify-between gap-3">
                <div className="text-white/80 text-sm">permisos asignados: {permsUsuarioSel.size}</div>
                <button className={btnSec} onClick={abrirPermisosModal}>Configurar permisos</button>
              </div>
            </div>

            <div className="h-16"></div>
            <div className="fixed bottom-0 right-0 w-full sm:w-[720px] md:w-[860px] xl:w-[980px] bg-[#1a1a1a] border-t border-gray-700 p-3">
              <div className="flex gap-3">
                <button className={btnPri} disabled={guardando} onClick={guardarUsuario}>{guardando?'Guardando...':'Guardar cambios'}</button>
                <button className={btnSec} onClick={()=>setDrawerOpen(false)}>Cerrar</button>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      <Modal open={permModalOpen} title="Seleccionar permisos" onClose={()=>setPermModalOpen(false)}>
        <PickPermisos
          secciones={secciones}
          selectedIds={permTemp}
          onToggle={togglePermTemp}
          onClear={()=>setPermTemp(new Set())}
          onSelectAll={()=>setPermTemp(new Set(secciones.map(s=>s.id)))}
        />
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button className={btnPri} disabled={guardando} onClick={guardarPermisosModal}>{guardando?'Guardando...':'Guardar permisos'}</button>
          <button className={btnSec} onClick={()=>setPermModalOpen(false)}>Cancelar</button>
        </div>
      </Modal>
    </div>
  )
})
