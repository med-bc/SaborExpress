import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react"

type Role = "client" | "admin" | "ops"

type View = "auth" | "menu" | "cart" | "checkout" | "orders" | "account" | "admin" | "ops" | "manage"

type OrderStatus = "Pendiente" | "Preparando" | "En camino" | "Entregado"

type Product = {
  id: number

  name: string

  description: string

  category: string

  price: number

  image: string

  active: boolean

  popular?: boolean
}

type CartItem = { productId: number; quantity: number; selected?: boolean }

type User = {
  name: string
  email: string
  phone: string
  password: string
  address: string
  addresses?: string[]
  primaryAddressIndex?: number
}

type Order = {
  id: string

  customer: string

  email: string

  address: string

  district?: string

  deliveryFee?: number

  subtotal?: number

  notes: string

  payment: string

  status: OrderStatus

  createdAt: string

  items: { name: string; quantity: number; price: number }[]

  total: number
}

const DISTRICT_FEES: Record<string, number> = {
  Chorrillos: 4,

  Barranco: 5,

  Miraflores: 6,

  Surco: 5.5,

  Lince: 5,

  "San Isidro": 6.5,

  "San Borja": 5.5,

  "La Molina": 7,
}

const STATUSES: OrderStatus[] = [
  "Pendiente",
  "Preparando",
  "En camino",
  "Entregado",
]

const categories = [
  "Todos",
  "Pizzas",
  "Burgers",
  "Peruanos",
  "Entradas",
  "Bebidas",
]

const initialProducts: Product[] = [
  {
    id: 1,

    name: "Pizza Brasa",

    description: "Pollo a la brasa, mozzarella, cebolla morada y ají amarillo.",

    category: "Pizzas",

    price: 36.9,

    image:
      "https://images.unsplash.com/photo-1586511926434-91876a99354f?auto=format&fit=crop&w=900&q=85",

    active: true,

    popular: true,
  },

  {
    id: 2,

    name: "Burger Criolla",

    description: "Carne artesanal, queso, camote crocante y salsa anticuchera.",

    category: "Burgers",

    price: 24.9,

    image:
      "https://images.unsplash.com/photo-1610440042657-612c34d95e9f?auto=format&fit=crop&w=900&q=85",

    active: true,

    popular: true,
  },

  {
    id: 3,

    name: "Lomo Saltado",

    description: "Lomo fino, papas doradas, tomate, cebolla y arroz.",

    category: "Peruanos",

    price: 32.9,

    image:
      "https://images.unsplash.com/photo-1543826173-cfe2ca17577d?auto=format&fit=crop&w=900&q=85",

    active: true,
  },

  {
    id: 4,

    name: "Ceviche Clásico",

    description: "Pesca del día, leche de tigre, choclo y camote glaseado.",

    category: "Peruanos",

    price: 34.9,

    image:
      "https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?auto=format&fit=crop&w=900&q=85",

    active: true,

    popular: true,
  },

  {
    id: 5,

    name: "Papas Nativas",

    description: "Papas crocantes, crema huancaína y queso andino.",

    category: "Entradas",

    price: 14.9,

    image:
      "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=900&q=85",

    active: true,
  },

  {
    id: 6,

    name: "Pizza Pepperoni",

    description: "Salsa de tomate, mozzarella y pepperoni artesanal.",

    category: "Pizzas",

    price: 34.9,

    image:
      "https://images.unsplash.com/photo-1700459776134-eaa9303e6943?auto=format&fit=crop&w=900&q=85",

    active: true,
  },

  {
    id: 7,

    name: "Chicha Morada",

    description: "Maíz morado, piña, canela y limón. Botella de 500 ml.",

    category: "Bebidas",

    price: 7.9,

    image:
      "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=85",

    active: true,
  },

  {
    id: 8,

    name: "Tequeños de Ají",

    description: "Queso derretido y masa crocante con salsa de rocoto.",

    category: "Entradas",

    price: 16.9,

    image:
      "https://images.unsplash.com/photo-1568600916869-2ecedc31f41c?auto=format&fit=crop&w=900&q=85",

    active: true,
  },
]

const initialOrders: Order[] = [
  {
    id: "#ORD-0001",

    customer: "Mariana Flores",

    email: "mariana@example.com",

    address: "Av. Arequipa 1845, Lince",

    district: "Lince",

    deliveryFee: 5,

    subtotal: 57.7,

    notes: "Tocar el timbre 302",

    payment: "Yape",

    status: "Preparando",

    createdAt: new Date(Date.now() - 22 * 60 * 1000).toISOString(),

    items: [
      { name: "Burger Criolla", quantity: 2, price: 24.9 },

      { name: "Chicha Morada", quantity: 1, price: 7.9 },
    ],

    total: 62.7,
  },

  {
    id: "#ORD-0002",

    customer: "Diego Campos",

    email: "diego@example.com",

    address: "Jr. Tarata 240, Miraflores",

    district: "Miraflores",

    deliveryFee: 6,

    subtotal: 36.9,

    notes: "",

    payment: "Tarjeta al recibir",

    status: "Pendiente",

    createdAt: new Date(Date.now() - 7 * 60 * 1000).toISOString(),

    items: [{ name: "Pizza Brasa", quantity: 1, price: 36.9 }],

    total: 42.9,
  },

  {
    id: "#ORD-0003",

    customer: "Lucía Rojas",

    email: "lucia@example.com",

    address: "Calle Las Begonias 516, San Isidro",

    district: "San Isidro",

    deliveryFee: 6.5,

    subtotal: 65.8,

    notes: "Sin cubiertos",

    payment: "Efectivo",

    status: "En camino",

    createdAt: new Date(Date.now() - 48 * 60 * 1000).toISOString(),

    items: [{ name: "Lomo Saltado", quantity: 2, price: 32.9 }],

    total: 72.3,
  },
]

function useStoredState<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key)

      return saved ? JSON.parse(saved) : fallback
    } catch {
      return fallback
    }
  })

  useEffect(
    () => localStorage.setItem(key, JSON.stringify(value)),
    [key, value],
  )

  return [value, setValue] as const
}

const money = (value: number) => `S/ ${value.toFixed(2)}`

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()

const detectDistrict = (address: string) =>
  Object.keys(DISTRICT_FEES).find((district) =>
    normalizeText(address).includes(normalizeText(district)),
  ) || ""

const orderSubtotal = (order: Order) =>
  order.subtotal ??
  order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)

const orderDeliveryFee = (order: Order) =>
  order.deliveryFee ?? Math.max(0, order.total - orderSubtotal(order))

const shortTime = (value: string) =>
  new Intl.DateTimeFormat("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))

const shortDate = (value: string) =>
  new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(
    new Date(value),
  )

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, ReactNode> = {
    menu: (
      <>
        <path d="M4 7h16M4 12h16M4 17h16" />
      </>
    ),

    close: (
      <>
        <path d="m6 6 12 12M18 6 6 18" />
      </>
    ),

    cart: (
      <>
        <circle cx="9" cy="20" r="1" />
        <circle cx="19" cy="20" r="1" />
        <path d="M3 4h2l2.5 11h11l2-7H7" />
      </>
    ),

    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c.7-4.2 3.4-6 8-6s7.3 1.8 8 6" />
      </>
    ),

    orders: (
      <>
        <path d="M6 3h12v18H6zM9 8h6M9 12h6M9 16h4" />
      </>
    ),

    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),

    utensils: (
      <>
        <path d="M7 3v8M4 3v5c0 2 1.3 3 3 3s3-1 3-3V3M7 11v10M17 3v18M17 3c-3 2-3 7 0 9" />
      </>
    ),

    logout: (
      <>
        <path d="M10 5H5v14h5M14 8l4 4-4 4M18 12H9" />
      </>
    ),

    plus: (
      <>
        <path d="M12 5v14M5 12h14" />
      </>
    ),

    minus: (
      <>
        <path d="M5 12h14" />
      </>
    ),

    trash: (
      <>
        <path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6" />
      </>
    ),

    arrow: (
      <>
        <path d="m9 18 6-6-6-6" />
      </>
    ),

    back: (
      <>
        <path d="m15 18-6-6 6-6" />
      </>
    ),

    check: (
      <>
        <path d="m5 12 4 4L19 6" />
      </>
    ),

    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),

    pin: (
      <>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2" />
      </>
    ),

    bike: (
      <>
        <circle cx="6" cy="17" r="3" />
        <circle cx="18" cy="17" r="3" />
        <path d="m6 17 4-8h4l4 8M9 11h6M12 17l-3-6M14 6h3" />
      </>
    ),

    eye: (
      <>
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),

    edit: (
      <>
        <path d="m4 20 4-.8L19 8.3 15.7 5 4.8 15.8 4 20ZM14 6.7l3.3 3.3" />
      </>
    ),

    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m16 16 5 5" />
      </>
    ),

    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v6M12 7h.01" />
      </>
    ),

    flame: (
      <>
        <path d="M12 22c4 0 7-2.8 7-7 0-3-1.6-5.8-4.5-8.5.2 2.3-.7 3.8-2.1 4.9.1-3.5-1.8-6.3-4.5-8.4.2 4.2-3 6.7-3 11.5C5 19 8 22 12 22Z" />
      </>
    ),
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.info}
    </svg>
  )
}

function Button({
  children,

  variant = "primary",

  className = "",

  icon,

  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger"

  icon?: string
}) {
  return (
    <button className={`btn btn-${variant} ${className}`} {...props}>
      {icon && <Icon name={icon} size={18} />}
      {children}
    </button>
  )
}

function Field({
  label,

  error,

  className = "",

  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
}) {
  return (
    <label className={`field ${className}`}>
      <span>{label}</span>
      <input className={error ? "input input-error" : "input"} {...props} />
      {error && <small>{error}</small>}
    </label>
  )
}

function SelectField({
  label,

  children,

  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  children: ReactNode
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <select className="input" {...props}>
        {children}
      </select>
    </label>
  )
}

function Logo() {
  return (
    <div className="logo">
      <span className="logo-mark">
        <Icon name="flame" size={23} />
      </span>
      <span>
        Sabor<span>Express</span>
      </span>
    </div>
  )
}

function Toast({ message }: { message: string }) {
  return (
    <div className="toast">
      <span>
        <Icon name="check" size={16} />
      </span>
      {message}
    </div>
  )
}

function EmptyState({
  icon,
  title,
  text,
  action,
}: {
  icon: string
  title: string
  text: string
  action?: ReactNode
}) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <Icon name={icon} size={32} />
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  )
}

function AuthScreen({
  onLogin,

  onRegister,
}: {
  onLogin: (email: string, password: string) => string | null

  onRegister: (user: User) => string | null
}) {
  const [tab, setTab] = useState<"login" | "register">("login")

  const [error, setError] = useState("")

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirm: "",
  })

  const submit = (event: FormEvent) => {
    event.preventDefault()

    setError("")

    if (!form.email.includes("@") || form.password.length < 6) {
      setError(
        "Ingresa un correo válido y una contraseña de al menos 6 caracteres.",
      )

      return
    }

    if (tab === "register") {
      if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
        setError("Completa todos los datos para crear tu cuenta.")

        return
      }

      if (form.password !== form.confirm) {
        setError("Las contraseñas no coinciden.")

        return
      }

      const result = onRegister({
        name: form.name.trim(),

        email: form.email.toLowerCase().trim(),

        phone: form.phone.trim(),

        address: form.address.trim(),

        password: form.password,
      })

      if (result) setError(result)
    } else {
      const result = onLogin(form.email.toLowerCase().trim(), form.password)

      if (result) setError(result)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-visual">
        <div className="auth-overlay" />
        <div className="auth-content">
          <Logo />
          <p className="eyebrow">Delivery con sabor peruano</p>
          <h1>Tu antojo favorito, más cerca que nunca.</h1>
          <p>
            Platos hechos al momento, ingredientes frescos y entrega rápida en
            Lima.
          </p>
          <div className="auth-badges">
            <span>30–40 min</span>
            <span>Tarifa según distrito</span>
          </div>
        </div>
      </section>
      <section className="auth-panel">
        <div className="auth-box">
          <div className="mobile-logo">
            <Logo />
          </div>
          <p className="eyebrow">Bienvenido a SaborExpress</p>
          <h2>{tab === "login" ? "Qué gusto verte" : "Crea tu cuenta"}</h2>
          <p className="muted">
            {tab === "login"
              ? "Ingresa para pedir algo delicioso."
              : "Regístrate como cliente y empieza a pedir."}
          </p>
          <div className="tabs">
            <button
              className={tab === "login" ? "active" : ""}
              onClick={() => {
                setTab("login")
                setError("")
              }}
            >
              Iniciar sesión
            </button>
            <button
              className={tab === "register" ? "active" : ""}
              onClick={() => {
                setTab("register")
                setError("")
              }}
            >
              Registrarme
            </button>
          </div>
          <form onSubmit={submit} className="auth-form">
            {tab === "register" && (
              <Field
                label="Nombre completo"
                placeholder="Ej. Valeria Torres"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            )}
            <Field
              label="Correo electrónico"
              type="email"
              placeholder="tu@correo.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {tab === "register" && (
              <div className="form-grid">
                <Field
                  label="Teléfono"
                  placeholder="999 999 999"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
                <Field
                  label="Dirección"
                  placeholder="Calle, número, distrito"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                />
              </div>
            )}
            <Field
              label="Contraseña"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            {tab === "register" && (
              <Field
                label="Confirmar contraseña"
                type="password"
                placeholder="Repite tu contraseña"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              />
            )}
            {error && (
              <div className="alert alert-error">
                <Icon name="info" size={18} />
                <span>{error}</span>
              </div>
            )}
            <Button type="submit" className="btn-full">
              {tab === "login" ? "Ingresar" : "Crear cuenta"}
            </Button>
          </form>
          <div className="demo-note">
            <Icon name="info" size={18} />
            <div>
              <strong>Accesos demo</strong>
              <p>
                Admin: admin@saborexpress.pe / admin123
                <br />
                Operativo: cocina@saborexpress.pe / cocina123
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

function AccountScreen({
  user,
  onSave,
}: {
  user: User
  onSave: (user: User) => string | null
}) {
  const initialAddresses = user.addresses?.length
    ? user.addresses
    : [user.address]

  const [form, setForm] = useState({
    email: user.email,

    phone: user.phone,

    addresses: initialAddresses,

    primaryAddressIndex:
      user.primaryAddressIndex !== undefined &&
      user.primaryAddressIndex < initialAddresses.length
        ? user.primaryAddressIndex
        : 0,

    currentPassword: "",

    newPassword: "",

    confirmPassword: "",
  })

  const [error, setError] = useState("")

  const [saved, setSaved] = useState("")
  const [addressModalOpen, setAddressModalOpen] = useState(false)
  const [newAddress, setNewAddress] = useState("")
  const [addressError, setAddressError] = useState("")
  const [editingAddressIndex, setEditingAddressIndex] = useState<number | null>(null)

  const updateAddress = (index: number, value: string) => {
    setForm((current) => ({
      ...current,
      addresses: current.addresses.map((address, addressIndex) =>
        addressIndex === index ? value : address,
      ),
    }))
  }

  const addAddress = () => {
    const value = newAddress.trim()
    if (value.length < 8) {
      setAddressError("Ingresa una dirección válida.")
      return
    }
    setForm((current) => ({ ...current, addresses: [...current.addresses, value] }))
    setNewAddress("")
    setAddressError("")
    setAddressModalOpen(false)
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()

    setError("")

    setSaved("")

    const addresses = form.addresses
      .map((address) => address.trim())
      .filter(Boolean)

    if (!form.email.includes("@")) {
      setError("Ingresa un correo electrónico válido.")
      return
    }

    if (!form.phone.trim()) {
      setError("Ingresa un número de celular.")
      return
    }

    if (!addresses.length) {
      setError("Conserva al menos una dirección de entrega.")
      return
    }

    if (
      form.newPassword &&
      (form.currentPassword !== user.password ||
        form.newPassword.length < 6 ||
        form.newPassword !== form.confirmPassword)
    ) {
      setError(
        "Verifica tu contraseña actual y confirma una nueva contraseña de al menos 6 caracteres.",
      )

      return
    }

    const primaryAddress =
      form.addresses[form.primaryAddressIndex]?.trim() || addresses[0]

    const primaryAddressIndex = Math.max(0, addresses.indexOf(primaryAddress))

    const result = onSave({
      ...user,
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      address: primaryAddress,
      addresses,
      primaryAddressIndex,
      password: form.newPassword || user.password,
    })

    if (result) {
      setError(result)
      return
    }

    setForm((current) => ({
      ...current,
      addresses,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }))
    setEditingAddressIndex(null)

    setSaved("Tus datos se actualizaron correctamente.")
  }

  return (
    <main className="content narrow">
      <PageHeader
        eyebrow="Perfil de cliente"
        title="Mi cuenta"
        subtitle="Administra tus datos y direcciones de entrega."
      />
      <form className="account-layout" onSubmit={submit}>
        <section className="account-main">
          <div className="form-card">
            <div className="card-heading">
              <span>
                <Icon name="user" />
              </span>
              <div>
                <h2>Datos personales</h2>
                <p>Usa estos datos para identificar tus pedidos.</p>
              </div>
            </div>
            <div className="form-grid">
              <Field
                label="Correo electrónico"
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
              />
              <Field
                label="Celular"
                type="tel"
                inputMode="tel"
                placeholder="999 999 999"
                value={form.phone}
                onChange={(event) =>
                  setForm({ ...form, phone: event.target.value })
                }
              />
            </div>
          </div>
          <div className="form-card">
            <div className="card-heading">
              <span>
                <Icon name="pin" />
              </span>
              <div>
                <h2>Mis direcciones</h2>
                <p>Guarda los lugares donde quieres recibir tus pedidos.</p>
              </div>
            </div>
            <div className="account-addresses">
              {form.addresses.map((address, index) => (
                <div className={form.primaryAddressIndex === index ? "account-address-row primary" : "account-address-row"} key={index}>
                  <div className="primary-address">
                    <Field
                    label={`Dirección ${index + 1}`}
                    value={address}
                      readOnly={editingAddressIndex !== index}
                    placeholder="Av. Arequipa 1845, Lince"
                    onChange={(event) =>
                      updateAddress(index, event.target.value)
                    }
                    />
                    <label className="primary-toggle">
                      <input type="radio" name="primaryAddress" checked={form.primaryAddressIndex === index} onChange={() => setForm({ ...form, primaryAddressIndex: index })} />
                      <span />
                      <em>Principal</em>
                    </label>
                  </div>
                  <button type="button" className="icon-btn address-edit" aria-label={`Editar dirección ${index + 1}`} onClick={() => setEditingAddressIndex(index)}>
                    <Icon name="edit" size={17} />
                  </button>
                  {form.addresses.length > 1 && (
                    <button
                      type="button"
                      className="remove"
                      aria-label={`Eliminar dirección ${index + 1}`}
                      onClick={() =>
                        setForm({
                          ...form,
                          addresses: form.addresses.filter(
                            (_, addressIndex) => addressIndex !== index,
                          ),
                          primaryAddressIndex: form.primaryAddressIndex === index ? 0 : form.primaryAddressIndex > index ? form.primaryAddressIndex - 1 : form.primaryAddressIndex,
                        })
                      }
                    >
                      <Icon name="trash" size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="secondary"
              icon="plus"
              onClick={() => { setAddressModalOpen(true); setAddressError("") }}
            >
              Agregar dirección
            </Button>
          </div>
          <div className="form-card">
            <div className="card-heading">
              <span>
                <Icon name="edit" />
              </span>
              <div>
                <h2>Cambiar contraseña</h2>
                <p>Déjalo vacío si no deseas modificarla.</p>
              </div>
            </div>
            <div className="account-password-grid">
              <Field
                label="Contraseña actual"
                type="password"
                value={form.currentPassword}
                onChange={(event) =>
                  setForm({ ...form, currentPassword: event.target.value })
                }
              />
              <Field
                label="Nueva contraseña"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={form.newPassword}
                onChange={(event) =>
                  setForm({ ...form, newPassword: event.target.value })
                }
              />
              <Field
                label="Confirmar nueva contraseña"
                type="password"
                value={form.confirmPassword}
                onChange={(event) =>
                  setForm({ ...form, confirmPassword: event.target.value })
                }
              />
            </div>
          </div>
        </section>
        <aside className="account-side">
          <div className="summary-card">
            <h2>Guardar cambios</h2>
            <p>
              <Icon name="info" size={16} />
              Tus datos se actualizaran.
            </p>
            {error && (
              <div className="alert alert-error">
                <Icon name="info" size={18} />
                <span>{error}</span>
              </div>
            )}
            {saved && (
              <div className="alert alert-success">
                <Icon name="check" size={18} />
                <span>{saved}</span>
              </div>
            )}
            <Button type="submit" className="btn-full">
              Guardar cambios
            </Button>
          </div>
        </aside>
      </form>
      {addressModalOpen && (
        <div className="modal-backdrop">
          <div className="modal address-modal account-address-modal">
            <div className="modal-head">
              <div>
                <p className="eyebrow">Nueva dirección</p>
                <h2>Registrar dirección</h2>
              </div>
              <button type="button" className="icon-btn" onClick={() => setAddressModalOpen(false)}><Icon name="close" /></button>
            </div>
            <Field label="Dirección completa" value={newAddress} onChange={(event) => { setNewAddress(event.target.value); setAddressError("") }} placeholder="Av. Arequipa 1845, Lince" />
            {addressError && <div className="alert alert-error"><Icon name="info" size={18} /><span>{addressError}</span></div>}
            <div className="modal-actions"><Button type="button" variant="ghost" onClick={() => setAddressModalOpen(false)}>Cancelar</Button><Button type="button" onClick={addAddress}>Guardar dirección</Button></div>
          </div>
        </div>
      )}
    </main>
  )
}

function Shell({
  role,

  userName,

  view,

  cartCount,

  onNavigate,

  onLogout,

  children,
}: {
  role: Role

  userName: string

  view: View

  cartCount: number

  onNavigate: (view: View) => void

  onLogout: () => void

  children: ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const clientLinks = [
    { view: "menu" as View, label: "Menú", icon: "utensils" },

    { view: "orders" as View, label: "Mis pedidos", icon: "orders" },

    { view: "account" as View, label: "Mi cuenta", icon: "user" },
  ]

  const adminLinks = [
    { view: "admin" as View, label: "Resumen", icon: "grid" },

    { view: "manage" as View, label: "Gestión de menú", icon: "utensils" },
  ]

  const links =
    role === "client"
      ? clientLinks
      : role === "admin"
        ? adminLinks
        : [{ view: "ops" as View, label: "Pedidos activos", icon: "orders" }]

  const go = (target: View) => {
    onNavigate(target)
    setMobileOpen(false)
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button
          className="icon-btn menu-toggle"
          aria-label="Abrir menú"
          onClick={() => setMobileOpen(true)}
        >
          <Icon name="menu" />
        </button>
        <button
          className="logo-button"
          onClick={() =>
            go(role === "client" ? "menu" : role === "admin" ? "admin" : "ops")
          }
        >
          <Logo />
        </button>
        <nav className="desktop-nav">
          {links.map((link) => (
            <button
              key={link.view}
              className={view === link.view ? "nav-link active" : "nav-link"}
              onClick={() => go(link.view)}
            >
              {link.label}
            </button>
          ))}
        </nav>
        <div className="top-actions">
          {role === "client" && (
            <button
              className="cart-button"
              onClick={() => go("cart")}
              aria-label="Ver carrito"
            >
              <Icon name="cart" />
              {cartCount > 0 && <span>{cartCount}</span>}
            </button>
          )}
          <div className="user-chip">
            <span>
              <Icon name="user" size={17} />
            </span>
            <div>
              <strong>{userName.split(" ")[0]}</strong>
              <small>
                {role === "client"
                  ? "Cliente"
                  : role === "admin"
                    ? "Administrador"
                    : "Operativo"}
              </small>
            </div>
          </div>
          <button
            className="icon-btn logout-button"
            aria-label="Cerrar sesión"
            onClick={onLogout}
          >
            <Icon name="logout" />
          </button>
        </div>
      </header>
      {mobileOpen && (
        <div className="drawer-backdrop" onClick={() => setMobileOpen(false)} />
      )}
      <aside className={mobileOpen ? "mobile-drawer open" : "mobile-drawer"}>
        <div className="drawer-head">
          <Logo />
          <button className="icon-btn" onClick={() => setMobileOpen(false)}>
            <Icon name="close" />
          </button>
        </div>
        <div className="drawer-user">
          <div>
            <Icon name="user" />
          </div>
          <span>
            <strong>{userName}</strong>
            <small>
              {role === "client"
                ? "Cliente"
                : role === "admin"
                  ? "Administrador"
                  : "Personal operativo"}
            </small>
          </span>
        </div>
        <nav>
          {links.map((link) => (
            <button
              key={link.view}
              className={view === link.view ? "active" : ""}
              onClick={() => go(link.view)}
            >
              <Icon name={link.icon} />
              {link.label}
            </button>
          ))}
          {role === "client" && (
            <button onClick={() => go("cart")}>
              <Icon name="cart" />
              Carrito <span className="nav-count">{cartCount}</span>
            </button>
          )}
        </nav>
        <button className="drawer-logout" onClick={onLogout}>
          <Icon name="logout" />
          Cerrar sesión
        </button>
      </aside>
      <div className="page-body">{children}</div>
    </div>
  )
}

function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string
  title: string
  subtitle: string
  action?: ReactNode
}) {
  return (
    <div className="page-header">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {action}
    </div>
  )
}

function Quantity({
  value,

  onChange,

  compact = false,
}: {
  value: number

  onChange: (value: number) => void

  compact?: boolean
}) {
  return (
    <div className={compact ? "quantity compact" : "quantity"}>
      <button onClick={() => onChange(value - 1)} aria-label="Restar">
        <Icon name="minus" size={15} />
      </button>
      <span>{value}</span>
      <button onClick={() => onChange(value + 1)} aria-label="Sumar">
        <Icon name="plus" size={15} />
      </button>
    </div>
  )
}

function MenuScreen({
  products,

  cart,

  onQuantity,
}: {
  products: Product[]

  cart: CartItem[]

  onQuantity: (id: number, value: number) => void
}) {
  const [category, setCategory] = useState("Todos")

  const [query, setQuery] = useState("")

  const shown = products.filter(
    (product) =>
      product.active &&
      (category === "Todos" || product.category === category) &&
      product.name.toLowerCase().includes(query.toLowerCase()),
  )

  const quantity = (id: number) =>
    cart.find((item) => item.productId === id)?.quantity || 0

  return (
    <main className="content">
      <section className="hero">
        <div>
          <p className="eyebrow">Hecho con cariño, llega calientito</p>
          <h1>¿Qué se te antoja hoy?</h1>
          <p>Sabores peruanos, clásicos y favoritos preparados al momento.</p>
        </div>
        <div className="hero-plate">
          <img
            src={initialProducts[2].image}
            alt="Lomo saltado servido al momento"
          />
        </div>
      </section>
      <div className="menu-toolbar">
        <div className="category-scroll">
          {categories.map((item) => (
            <button
              key={item}
              className={category === item ? "category active" : "category"}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <label className="search">
          <Icon name="search" size={18} />
          <input
            aria-label="Buscar platos"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar platos..."
          />
        </label>
      </div>
      <div className="section-title">
        <div>
          <h2>{category === "Todos" ? "Nuestros favoritos" : category}</h2>
          <p>{shown.length} opciones para disfrutar</p>
        </div>
      </div>
      {shown.length ? (
        <div className="product-grid">
          {shown.map((product) => (
            <article className="product-card" key={product.id}>
              <div className="product-image">
                <img src={product.image} alt={product.name} />
                {product.popular && <span className="popular">Favorito</span>}
              </div>
              <div className="product-info">
                <span className="product-category">{product.category}</span>
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <div className="product-bottom">
                  <strong>{money(product.price)}</strong>
                  {quantity(product.id) ? (
                    <Quantity
                      compact
                      value={quantity(product.id)}
                      onChange={(value) => onQuantity(product.id, value)}
                    />
                  ) : (
                    <Button
                      className="add-button"
                      icon="plus"
                      onClick={() => onQuantity(product.id, 1)}
                    >
                      Agregar
                    </Button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="search"
          title="No encontramos resultados"
          text="Prueba con otra palabra o selecciona una categoría distinta."
        />
      )}
    </main>
  )
}

function CartScreen({
  products,

  cart,

  onQuantity,

  onSelection,

  onNavigate,
}: {
  products: Product[]

  cart: CartItem[]

  onQuantity: (id: number, value: number) => void

  onSelection: (id: number, selected: boolean) => void

  onNavigate: (view: View) => void
}) {
  const items = cart
    .map((item) => ({
      ...item,
      product: products.find((product) => product.id === item.productId)!,
    }))
    .filter((item) => item.product)

  const selectedItems = items.filter((item) => item.selected !== false)

  const subtotal = selectedItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  )

  const allSelected = items.length > 0 && selectedItems.length === items.length

  const selectedCount = selectedItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  )

  return (
    <main className="content narrow">
      <PageHeader
        title="Tu carrito"
        subtitle={
          items.length
            ? `${selectedCount} productos seleccionados para pedir`
            : "Todavía no agregaste productos"
        }
        action={
          <Button
            variant="ghost"
            icon="back"
            onClick={() => onNavigate("menu")}
          >
            Seguir comprando
          </Button>
        }
      />
      {!items.length ? (
        <EmptyState
          icon="cart"
          title="Tu carrito está vacío"
          text="Agrega algo rico del menú para comenzar tu pedido."
          action={
            <Button onClick={() => onNavigate("menu")}>Explorar el menú</Button>
          }
        />
      ) : (
        <div className="cart-layout">
          <section className="cart-list">
            <label className="cart-select-all">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(event) =>
                  items.forEach((item) =>
                    onSelection(item.productId, event.target.checked),
                  )
                }
              />
              <i />
              <span>Seleccionar todo</span>
              <small>
                {selectedItems.length} de {items.length} productos
              </small>
            </label>
            {items.map((item) => (
              <article
                className={
                  item.selected === false ? "cart-item unselected" : "cart-item"
                }
                key={item.productId}
              >
                <label className="cart-checkbox">
                  <input
                    type="checkbox"
                    checked={item.selected !== false}
                    onChange={(event) =>
                      onSelection(item.productId, event.target.checked)
                    }
                    aria-label={`Seleccionar ${item.product.name}`}
                  />
                  <span />
                </label>
                <img src={item.product.image} alt={item.product.name} />
                <div className="cart-item-info">
                  <span>{item.product.category}</span>
                  <h3>{item.product.name}</h3>
                  <strong>{money(item.product.price)}</strong>
                </div>
                <div className="cart-controls">
                  <Quantity
                    value={item.quantity}
                    onChange={(value) => onQuantity(item.productId, value)}
                  />
                  <button
                    className="remove"
                    onClick={() => onQuantity(item.productId, 0)}
                    aria-label={`Eliminar ${item.product.name}`}
                  >
                    <Icon name="trash" size={18} />
                  </button>
                </div>
              </article>
            ))}
          </section>
          <aside className="summary-card">
            <h2>Resumen</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <strong>{money(subtotal)}</strong>
            </div>
            <div className="summary-divider" />
            <div className="summary-total">
              <span>Subtotal</span>
              <strong>{money(subtotal)}</strong>
            </div>
            <p>
              <Icon name="pin" size={16} />
              El envío se calcula según tu distrito en el checkout.
            </p>
            <Button
              className="btn-full"
              disabled={!selectedItems.length}
              onClick={() => onNavigate("checkout")}
            >
              Continuar al checkout <Icon name="arrow" size={18} />
            </Button>
          </aside>
        </div>
      )}
    </main>
  )
}

function CheckoutScreen({
  user,

  products,

  cart,

  onBack,

  onConfirm,

  onSaveAddresses,
}: {
  user: User

  products: Product[]

  cart: CartItem[]

  onBack: () => void

  onConfirm: (
    address: string,
    district: string,
    deliveryFee: number,
    payment: string,
    notes: string,
  ) => void

  onSaveAddresses: (addresses: string[]) => void
}) {
  const [addressOptions, setAddressOptions] = useState(
    user.addresses?.length ? user.addresses : [user.address],
  )

  const [address, setAddress] = useState(user.address)

  const [district, setDistrict] = useState(() => detectDistrict(user.address))

  const [addressModalOpen, setAddressModalOpen] = useState(false)

  const [newAddress, setNewAddress] = useState("")

  const [addressModalError, setAddressModalError] = useState("")

  const [payment, setPayment] = useState("Yape")

  const [paymentData, setPaymentData] = useState({
    phone: "",
    approvalCode: "",
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  })

  const [notes, setNotes] = useState("")

  const [error, setError] = useState("")

  const [paymentError, setPaymentError] = useState("")

  const subtotal = cart.reduce(
    (sum, item) =>
      sum +
      (products.find((p) => p.id === item.productId)?.price || 0) *
        item.quantity,
    0,
  )

  const deliveryFee = district ? DISTRICT_FEES[district] : 0

  const updateAddress = (value: string) => {
    setAddress(value)

    const detected = detectDistrict(value)

    if (detected) setDistrict(detected)

    setError("")
  }

  const chooseAddress = (value: string) => {
    updateAddress(value)

    setAddressModalOpen(false)

    setAddressModalError("")
  }

  const addAddress = () => {
    const value = newAddress.trim()

    if (value.length < 8 || !detectDistrict(value)) {
      setAddressModalError(
        "Ingresa una dirección válida que incluya un distrito disponible.",
      )

      return
    }

    const updatedAddresses = [...addressOptions, value]

    setAddressOptions(updatedAddresses)

    onSaveAddresses(updatedAddresses)

    setNewAddress("")

    chooseAddress(value)
  }

  const submit = () => {
    if (address.trim().length < 8) {
      setError("Ingresa una dirección válida para la entrega.")
      return
    }

    if (!district) {
      setError("Selecciona un distrito para calcular el costo de envío.")
      return
    }

    if (
      payment === "Yape" &&
      (!/^9\d{8}$/.test(paymentData.phone.replace(/\s/g, "")) ||
        !/^\d{6}$/.test(paymentData.approvalCode))
    ) {
      setPaymentError(
        "Ingresa un celular Yape válido y el código de aprobación de 6 dígitos.",
      )

      return
    }

    if (
      payment === "Tarjeta al recibir" &&
      (!paymentData.cardName.trim() ||
        !/^\d{16}$/.test(paymentData.cardNumber.replace(/\s/g, "")) ||
        !/^\d{2}\/\d{2}$/.test(paymentData.expiry) ||
        !/^\d{3,4}$/.test(paymentData.cvv))
    ) {
      setPaymentError("Completa los datos de la tarjeta con un formato válido.")

      return
    }

    setPaymentError("")

    onConfirm(address.trim(), district, deliveryFee, payment, notes.trim())
  }

  return (
    <main className="content narrow">
      <PageHeader
        eyebrow="Último paso"
        title="Confirma tu pedido"
        subtitle="Revisa la entrega y elige cómo pagar."
        action={
          <Button variant="ghost" icon="back" onClick={onBack}>
            Volver al carrito
          </Button>
        }
      />
      <div className="checkout-layout">
        <section className="checkout-form">
          <div className="form-card">
            <div className="card-heading">
              <span>
                <Icon name="pin" />
              </span>
              <div>
                <h2>Dirección de entrega</h2>
                <p>Usaremos tu dirección principal por defecto.</p>
              </div>
            </div>
            <div className="selected-address">
              <div>
                <small>Dirección seleccionada</small>
                <strong>{address}</strong>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setAddressModalOpen(true)
                  setAddressModalError("")
                }}
              >
                Cambiar dirección
              </Button>
            </div>
            {error && (
              <div className="alert alert-error checkout-address-error">
                <Icon name="info" size={18} />
                <span>{error}</span>
              </div>
            )}
            <div className="address-grid">
              <SelectField
                label="Distrito"
                value={district}
                onChange={(e) => {
                  setDistrict(e.target.value)
                  setError("")
                }}
              >
                <option value="">Selecciona un distrito</option>
                {Object.entries(DISTRICT_FEES).map(([name, fee]) => (
                  <option key={name} value={name}>
                    {name} — {money(fee)}
                  </option>
                ))}
              </SelectField>
            </div>
            <div
              className={district ? "delivery-quote ready" : "delivery-quote"}
            >
              <Icon name="bike" />
              <span>
                {district ? (
                  <>
                    Envío a <strong>{district}</strong>
                  </>
                ) : (
                  "Selecciona un distrito para calcular el envío"
                )}
              </span>
              <strong>{district ? money(deliveryFee) : "Por calcular"}</strong>
            </div>
          </div>
          {addressModalOpen && (
            <div className="modal-backdrop">
              <div className="modal address-modal">
                <div className="modal-head">
                  <div>
                    <p className="eyebrow">Entrega</p>
                    <h2>Cambiar dirección</h2>
                  </div>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => setAddressModalOpen(false)}
                  >
                    <Icon name="close" />
                  </button>
                </div>
                <div className="address-options">
                  {addressOptions.map((option) => (
                    <button
                      type="button"
                      className={
                        option === address
                          ? "address-option active"
                          : "address-option"
                      }
                      key={option}
                      onClick={() => chooseAddress(option)}
                    >
                      <Icon name="pin" size={18} />
                      <span>{option}</span>
                      {option === user.address && <small>Principal</small>}
                    </button>
                  ))}
                </div>
                <div className="new-address">
                  <p className="payment-step">Registrar nueva dirección</p>
                  <Field
                    label="Dirección completa"
                    value={newAddress}
                    onChange={(event) => {
                      setNewAddress(event.target.value)
                      setAddressModalError("")
                    }}
                    placeholder="Av. Grau 520, Barranco"
                  />
                  <small className="payment-hint">
                    Incluye uno de los distritos disponibles para calcular el
                    envío.
                  </small>
                  {addressModalError && (
                    <div className="alert alert-error">
                      <Icon name="info" size={18} />
                      <span>{addressModalError}</span>
                    </div>
                  )}
                  <Button
                    type="button"
                    className="btn-full"
                    onClick={addAddress}
                  >
                    Guardar y usar esta dirección
                  </Button>
                </div>
              </div>
            </div>
          )}
          <div className="form-card">
            <div className="card-heading">
              <span>
                <Icon name="cart" />
              </span>
              <div>
                <h2>Método de pago</h2>
                <p>Completa los datos para generar tu orden.</p>
              </div>
            </div>
            <div className="payment-options">
              {["Yape", "Tarjeta al recibir", "Efectivo"].map((method) => (
                <label
                  className={payment === method ? "payment active" : "payment"}
                  key={method}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={payment === method}
                    onChange={() => {
                      setPayment(method)
                      setPaymentError("")
                    }}
                  />
                  <span className="radio" />
                  <span>
                    {method}
                    <small>
                      {method === "Yape"
                        ? "Celular y código de aprobación"
                        : method === "Efectivo"
                          ? "Pago simulado contra entrega"
                          : "Datos de tarjeta simulados"}
                    </small>
                  </span>
                </label>
              ))}
            </div>
            {payment === "Yape" && (
              <div className="payment-details">
                <p className="payment-step">Aprobación Yape</p>
                <div className="form-grid">
                  <Field
                    label="Celular afiliado a Yape"
                    inputMode="numeric"
                    placeholder="999 999 999"
                    value={paymentData.phone}
                    onChange={(e) =>
                      setPaymentData({ ...paymentData, phone: e.target.value })
                    }
                  />
                  <Field
                    label="Código de aprobación"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="123456"
                    value={paymentData.approvalCode}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        approvalCode: e.target.value.replace(/\D/g, ""),
                      })
                    }
                  />
                </div>
                <small className="payment-hint">
                  Ingresa tu numero y tu codigo de aprobacion en yape.
                </small>
              </div>
            )}
            {payment === "Tarjeta al recibir" && (
              <div className="payment-details">
                <p className="payment-step">Datos de tarjeta</p>
                <Field
                  label="Nombre en la tarjeta"
                  autoComplete="cc-name"
                  placeholder="Ej. Valeria Torres"
                  value={paymentData.cardName}
                  onChange={(e) =>
                    setPaymentData({ ...paymentData, cardName: e.target.value })
                  }
                />
                <Field
                  label="Número de tarjeta"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  maxLength={19}
                  placeholder="0000 0000 0000 0000"
                  value={paymentData.cardNumber}
                  onChange={(e) =>
                    setPaymentData({
                      ...paymentData,
                      cardNumber: e.target.value
                        .replace(/[^\d\s]/g, "")
                        .slice(0, 19),
                    })
                  }
                />
                <div className="form-grid">
                  <Field
                    label="Vencimiento"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    maxLength={5}
                    placeholder="MM/AA"
                    value={paymentData.expiry}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        expiry: e.target.value
                          .replace(/[^\d/]/g, "")
                          .slice(0, 5),
                      })
                    }
                  />
                  <Field
                    label="CVV"
                    type="password"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    maxLength={4}
                    placeholder="123"
                    value={paymentData.cvv}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        cvv: e.target.value.replace(/\D/g, "").slice(0, 4),
                      })
                    }
                  />
                </div>
                <small className="payment-hint">
                  Asegura que los datos sean correctos.
                </small>
              </div>
            )}
            {payment === "Efectivo" && (
              <div className="payment-details payment-cash">
                <Icon name="info" size={18} />
                <span>
                  Tu pedido quedará registrado para pagar en efectivo al
                  recibirlo.
                </span>
              </div>
            )}
            {paymentError && (
              <div className="alert alert-error">
                <Icon name="info" size={18} />
                <span>{paymentError}</span>
              </div>
            )}
          </div>
          <div className="form-card">
            <div className="card-heading">
              <span>
                <Icon name="edit" />
              </span>
              <div>
                <h2>Notas para el pedido</h2>
                <p>Opcional</p>
              </div>
            </div>
            <label className="field">
              <span>Indicaciones adicionales</span>
              <textarea
                className="input textarea"
                maxLength={180}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej. Sin cebolla, tocar el timbre 302..."
              />
              <small className="counter">{notes.length}/180</small>
            </label>
          </div>
        </section>
        <aside className="summary-card checkout-summary">
          <h2>Tu pedido</h2>
          {cart.map((item) => {
            const product = products.find((p) => p.id === item.productId)
            return product ? (
              <div className="checkout-item" key={item.productId}>
                <span>{item.quantity}×</span>
                <p>{product.name}</p>
                <strong>{money(product.price * item.quantity)}</strong>
              </div>
            ) : null
          })}
          <div className="summary-divider" />
          <div className="summary-row">
            <span>Subtotal</span>
            <strong>{money(subtotal)}</strong>
          </div>
          <div className="summary-row">
            <span>Envío {district && `· ${district}`}</span>
            <strong>{district ? money(deliveryFee) : "Por calcular"}</strong>
          </div>
          <div className="summary-total">
            <span>Total a pagar</span>
            <strong>{money(subtotal + deliveryFee)}</strong>
          </div>
          <Button className="btn-full" onClick={submit}>
            {payment === "Efectivo" ? "Generar orden" : "Generar orden"}
          </Button>
          <small className="safe-note">
            Al confirmar recibiras tu codigo de pedido.
          </small>
        </aside>
      </div>
    </main>
  )
}

function SuccessModal({
  order,
  onOrders,
  onMenu,
}: {
  order: Order
  onOrders: () => void
  onMenu: () => void
}) {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="success-mark">
          <Icon name="check" size={36} />
        </div>
        <p className="eyebrow">Pedido confirmado</p>
        <h2>¡Ya estamos cocinando!</h2>
        <p>
          Recibimos tu pedido <strong>{order.id}</strong>. Podrás seguir su
          avance en tiempo real.
        </p>
        <div className="modal-detail">
          <span>
            <Icon name="clock" />
            Tiempo estimado
          </span>
          <strong>30–40 min</strong>
        </div>
        <Button className="btn-full" onClick={onOrders}>
          Seguir mi pedido
        </Button>
        <Button className="btn-full" variant="ghost" onClick={onMenu}>
          Volver al menú
        </Button>
      </div>
    </div>
  )
}

function Tracker({ status }: { status: OrderStatus }) {
  const active = STATUSES.indexOf(status)

  return (
    <div className="tracker">
      {STATUSES.map((item, index) => (
        <div
          className={index <= active ? "track-step active" : "track-step"}
          key={item}
        >
          <div className="track-line" />
          <span>
            {index < active ? <Icon name="check" size={16} /> : index + 1}
          </span>
          <small>{item}</small>
        </div>
      ))}
    </div>
  )
}

function OrdersScreen({
  orders,
  email,
  onMenu,
}: {
  orders: Order[]
  email: string
  onMenu: () => void
}) {
  const mine = orders.filter((order) => order.email === email)

  const active = mine.filter((order) => order.status !== "Entregado")

  const history = mine.filter((order) => order.status === "Entregado")

  return (
    <main className="content narrow">
      <PageHeader
        eyebrow="Seguimiento en vivo"
        title="Mis pedidos"
        subtitle="Revisa el estado y el historial de tus pedidos."
        action={
          <Button variant="secondary" icon="utensils" onClick={onMenu}>
            Ver menú
          </Button>
        }
      />
      {!mine.length ? (
        <EmptyState
          icon="orders"
          title="Aún no tienes pedidos"
          text="Cuando confirmes tu primer pedido, podrás seguirlo desde aquí."
          action={<Button onClick={onMenu}>Hacer mi primer pedido</Button>}
        />
      ) : (
        <>
          <section className="orders-section">
            <div className="section-title">
              <div>
                <h2>En curso</h2>
                <p>
                  {active.length}{" "}
                  {active.length === 1 ? "pedido activo" : "pedidos activos"}
                </p>
              </div>
            </div>
            {active.length ? (
              active.map((order) => (
                <article className="order-card" key={order.id}>
                  <div className="order-top">
                    <div>
                      <span className="status status-active">
                        <i />
                        {order.status}
                      </span>
                      <h3>{order.id}</h3>
                      <p>
                        Hoy, {shortTime(order.createdAt)} ·{" "}
                        {order.items.reduce(
                          (sum, item) => sum + item.quantity,
                          0,
                        )}{" "}
                        productos
                      </p>
                    </div>
                    <div className="order-price">
                      <strong>{money(order.total)}</strong>
                      <small>
                        Incluye envío {money(orderDeliveryFee(order))}
                      </small>
                    </div>
                  </div>
                  <Tracker status={order.status} />
                  <div className="order-address">
                    <Icon name="pin" size={18} />
                    <span>
                      <small>
                        Entrega en{" "}
                        {order.district || detectDistrict(order.address)}
                      </small>
                      {order.address}
                    </span>
                  </div>
                  <div className="order-items">
                    {order.items.map((item) => (
                      <span key={item.name}>
                        {item.quantity}× {item.name}
                      </span>
                    ))}
                  </div>
                </article>
              ))
            ) : (
              <div className="inline-empty">No tienes pedidos en curso.</div>
            )}
          </section>
          {history.length > 0 && (
            <section className="orders-section">
              <div className="section-title">
                <div>
                  <h2>Historial</h2>
                  <p>Tus pedidos anteriores</p>
                </div>
              </div>
              {history.map((order) => (
                <article className="history-row" key={order.id}>
                  <div>
                    <span className="status status-done">
                      <Icon name="check" size={13} />
                      Entregado
                    </span>
                    <h3>{order.id}</h3>
                    <p>
                      {shortDate(order.createdAt)} · Envío{" "}
                      {money(orderDeliveryFee(order))} ·{" "}
                      {order.items.map((item) => item.name).join(", ")}
                    </p>
                  </div>
                  <strong>{money(order.total)}</strong>
                </article>
              ))}
            </section>
          )}
        </>
      )}
    </main>
  )
}

function StatCard({
  icon,
  label,
  value,
  note,
  tone = "",
}: {
  icon: string
  label: string
  value: string
  note: string
  tone?: string
}) {
  return (
    <article className={`stat-card ${tone}`}>
      <div className="stat-icon">
        <Icon name={icon} />
      </div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
    </article>
  )
}

function AdminScreen({
  orders,
  products,
  onManage,
}: {
  orders: Order[]
  products: Product[]
  onManage: () => void
}) {
  const sales = orders.reduce((sum, order) => sum + order.total, 0)

  return (
    <main className="content">
      <PageHeader
        eyebrow="Panel administrativo"
        title="Buenas tardes, Administrador"
        subtitle="Así se mueve SaborExpress hoy."
        action={
          <Button icon="utensils" onClick={onManage}>
            Gestionar menú
          </Button>
        }
      />
      <div className="stats-grid">
        <StatCard
          icon="orders"
          label="Pedidos de hoy"
          value={String(orders.length)}
          note={`${orders.filter((o) => o.status !== "Entregado").length} aún en curso`}
        />
        <StatCard
          icon="grid"
          label="Ventas registradas"
          value={money(sales)}
          note="Total"
          tone="peach"
        />
        <StatCard
          icon="clock"
          label="Tiempo promedio"
          value="34 min"
          note="Dentro del objetivo"
          tone="green"
        />
        <StatCard
          icon="utensils"
          label="Productos activos"
          value={String(products.filter((p) => p.active).length)}
          note={`${products.filter((p) => !p.active).length} ocultos`}
          tone="gold"
        />
      </div>
      <section className="table-card">
        <div className="table-heading">
          <div>
            <h2>Pedidos recientes</h2>
            <p>
              Vista de solo lectura · los estados los actualiza el personal
              operativo.
            </p>
          </div>
          <span className="live">
            <i />
            En vivo
          </span>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Hora</th>
                <th>Envío</th>
                <th>Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <strong>{order.id}</strong>
                    <small>
                      {order.items.reduce(
                        (sum, item) => sum + item.quantity,
                        0,
                      )}{" "}
                      productos
                    </small>
                  </td>
                  <td>
                    {order.customer}
                    <small>
                      {order.district || order.address.split(",").pop()}
                    </small>
                  </td>
                  <td>{shortTime(order.createdAt)}</td>
                  <td>
                    <strong>{money(orderDeliveryFee(order))}</strong>
                  </td>
                  <td>
                    <strong>{money(order.total)}</strong>
                  </td>
                  <td>
                    <span
                      className={`status status-${STATUSES.indexOf(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <div className="admin-note">
        <Icon name="info" />
        <span>
          <strong>Control de roles</strong> Como administrador puedes consultar
          pedidos y gestionar el menú. Solo el personal operativo puede cambiar
          el estado de un pedido.
        </span>
      </div>
    </main>
  )
}

function OpsScreen({
  orders,
  onAdvance,
}: {
  orders: Order[]
  onAdvance: (id: string) => void
}) {
  const active = orders.filter((order) => order.status !== "Entregado")

  return (
    <main className="content">
      <PageHeader
        eyebrow="Cocina & delivery"
        title="Pedidos activos"
        subtitle="Avanza cada pedido cuando complete la etapa actual."
      />
      <div className="ops-summary">
        {STATUSES.slice(0, 3).map((status) => (
          <span key={status}>
            <i className={`dot dot-${STATUSES.indexOf(status)}`} />
            {orders.filter((o) => o.status === status).length} {status}
          </span>
        ))}
      </div>
      {active.length ? (
        <div className="ops-grid">
          {active.map((order) => {
            const index = STATUSES.indexOf(order.status)
            return (
              <article className="ops-card" key={order.id}>
                <div className="ops-card-top">
                  <div>
                    <span className={`status status-${index}`}>
                      {order.status}
                    </span>
                    <h2>{order.id}</h2>
                    <p>
                      <Icon name="clock" size={15} />
                      Hace{" "}
                      {Math.max(
                        1,
                        Math.round(
                          (Date.now() - new Date(order.createdAt).getTime()) /
                            60000,
                        ),
                      )}{" "}
                      min
                    </p>
                  </div>
                  <strong>{money(order.total)}</strong>
                </div>
                <div className="ops-customer">
                  <strong>{order.customer}</strong>
                  <span>
                    <Icon name="pin" size={16} />
                    {order.address}
                  </span>
                  <small>
                    {order.district || detectDistrict(order.address)} · Envío{" "}
                    {money(orderDeliveryFee(order))}
                  </small>
                </div>
                <div className="ops-items">
                  {order.items.map((item) => (
                    <div key={item.name}>
                      <b>{item.quantity}×</b>
                      <span>{item.name}</span>
                    </div>
                  ))}
                </div>
                {order.notes && (
                  <div className="order-note">
                    <Icon name="info" size={16} />
                    {order.notes}
                  </div>
                )}
                <div className="ops-progress">
                  <div>
                    <span style={{ width: `${((index + 1) / 4) * 100}%` }} />
                  </div>
                  <small>Paso {index + 1} de 4</small>
                </div>
                <Button
                  className="btn-full"
                  onClick={() => onAdvance(order.id)}
                >
                  {index === 0
                    ? "Aceptar y preparar"
                    : index === 1
                      ? "Marcar en camino"
                      : "Confirmar entrega"}{" "}
                  <Icon name="arrow" size={17} />
                </Button>
              </article>
            )
          })}
        </div>
      ) : (
        <EmptyState
          icon="check"
          title="Todo al día"
          text="No hay pedidos pendientes por atender. Los nuevos pedidos aparecerán aquí."
        />
      )}
    </main>
  )
}

function ManageScreen({
  products,

  onSave,

  onToggle,
}: {
  products: Product[]

  onSave: (product: Product) => void

  onToggle: (id: number) => void
}) {
  const blank = {
    id: 0,
    name: "",
    description: "",
    category: "Pizzas",
    price: 0,
    image: initialProducts[0].image,
    active: true,
  }

  const [editing, setEditing] = useState<Product | null>(null)

  const [form, setForm] = useState<Product>(blank)

  const [error, setError] = useState("")

  const [query, setQuery] = useState("")

  const open = (product?: Product) => {
    setEditing(product || blank)
    setForm(product ? { ...product } : { ...blank })
    setError("")
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()

    if (!form.name.trim() || !form.description.trim() || form.price <= 0) {
      setError("Completa el nombre, la descripción y un precio mayor a 0.")
      return
    }

    onSave({
      ...form,
      id: form.id || Date.now(),
      name: form.name.trim(),
      description: form.description.trim(),
    })

    setEditing(null)
  }

  const shown = products.filter((product) =>
    product.name.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <main className="content">
      <PageHeader
        eyebrow="Administración"
        title="Gestión de menú"
        subtitle="Agrega, edita u oculta productos del menú digital."
        action={
          <Button icon="plus" onClick={() => open()}>
            Agregar producto
          </Button>
        }
      />
      <div className="manage-toolbar">
        <label className="search">
          <Icon name="search" size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar producto..."
          />
        </label>
        <span>
          {products.filter((p) => p.active).length} activos ·{" "}
          {products.filter((p) => !p.active).length} ocultos
        </span>
      </div>
      <div className="manage-list">
        {shown.map((product) => (
          <article
            className={product.active ? "manage-item" : "manage-item inactive"}
            key={product.id}
          >
            <img src={product.image} alt={product.name} />
            <div className="manage-info">
              <span>{product.category}</span>
              <h3>{product.name}</h3>
              <p>{product.description}</p>
            </div>
            <strong>{money(product.price)}</strong>
            <span
              className={product.active ? "visibility active" : "visibility"}
            >
              {product.active ? "Visible" : "Oculto"}
            </span>
            <div className="manage-actions">
              <Button
                variant="secondary"
                icon="edit"
                onClick={() => open(product)}
              >
                Editar
              </Button>
              <Button
                variant="ghost"
                icon="eye"
                onClick={() => onToggle(product.id)}
              >
                {product.active ? "Ocultar" : "Mostrar"}
              </Button>
            </div>
          </article>
        ))}
      </div>
      {editing && (
        <div className="modal-backdrop">
          <form className="modal product-modal" onSubmit={submit}>
            <div className="modal-head">
              <div>
                <p className="eyebrow">
                  {form.id ? "Editar producto" : "Nuevo producto"}
                </p>
                <h2>{form.id ? form.name : "Agrega algo delicioso"}</h2>
              </div>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setEditing(null)}
              >
                <Icon name="close" />
              </button>
            </div>
            <Field
              label="Nombre"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej. Chaufa de la casa"
            />
            <div className="form-grid">
              <SelectField
                label="Categoría"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {categories.slice(1).map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </SelectField>
              <Field
                label="Precio (S/)"
                type="number"
                min="0.01"
                step="0.10"
                value={form.price || ""}
                onChange={(e) =>
                  setForm({ ...form, price: Number(e.target.value) })
                }
              />
            </div>
            <label className="field">
              <span>Descripción</span>
              <textarea
                className="input textarea"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Ingredientes y detalles..."
              />
            </label>
            <Field
              label="URL de imagen"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
            />
            {error && (
              <div className="alert alert-error">
                <Icon name="info" size={18} />
                {error}
              </div>
            )}
            <div className="modal-actions">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setEditing(null)}
              >
                Cancelar
              </Button>
              <Button type="submit">Guardar producto</Button>
            </div>
          </form>
        </div>
      )}
    </main>
  )
}

export default function App() {
  const [users, setUsers] = useStoredState<User[]>("sabor-users", [])

  const [products, setProducts] = useStoredState<Product[]>(
    "sabor-products",
    initialProducts,
  )

  const [orders, setOrders] = useStoredState<Order[]>(
    "sabor-orders",
    initialOrders,
  )

  const [cart, setCart] = useStoredState<CartItem[]>("sabor-cart", [])

  const [session, setSession] = useStoredState<{
    role: Role
    email: string
    name: string
  } | null>("sabor-session", null)

  const [view, setView] = useState<View>(() =>
    session
      ? session.role === "admin"
        ? "admin"
        : session.role === "ops"
          ? "ops"
          : "menu"
      : "auth",
  )

  const [confirmed, setConfirmed] = useState<Order | null>(null)

  const [toast, setToast] = useState("")

  useEffect(() => {
    if (!toast) return

    const timer = window.setTimeout(() => setToast(""), 2600)

    return () => window.clearTimeout(timer)
  }, [toast])

  const currentUser = useMemo(
    () =>
      users.find((user) => user.email === session?.email) || {
        name: session?.name || "",

        email: session?.email || "",

        phone: "",

        password: "",

        address: "",

        addresses: [],
      },
    [session, users],
  )

  const login = (email: string, password: string) => {
    if (email === "admin@saborexpress.pe" && password === "admin123") {
      setSession({ role: "admin", email, name: "Administrador" })
      setView("admin")
      return null
    }

    if (email === "cocina@saborexpress.pe" && password === "cocina123") {
      setSession({ role: "ops", email, name: "Equipo de cocina" })
      setView("ops")
      return null
    }

    const user = users.find(
      (item) => item.email === email && item.password === password,
    )

    if (!user) return "Correo o contraseña incorrectos. Verifica tus datos."

    setSession({ role: "client", email: user.email, name: user.name })
    setView("menu")
    return null
  }

  const register = (user: User) => {
    if (users.some((item) => item.email === user.email))
      return "Ya existe una cuenta con este correo."

    setUsers([...users, { ...user, addresses: [user.address] }])
    setSession({ role: "client", email: user.email, name: user.name })
    setView("menu")
    return null
  }

  const saveAccount = (user: User) => {
    if (
      users.some(
        (item) => item.email === user.email && item.email !== currentUser.email,
      )
    )
      return "Ya existe una cuenta con este correo."

    setUsers(
      users.map((item) => (item.email === currentUser.email ? user : item)),
    )

    setSession((current) =>
      current ? { ...current, email: user.email, name: user.name } : current,
    )

    return null
  }

  const saveAddresses = (addresses: string[]) => {
    setUsers(
      users.map((item) =>
        item.email === currentUser.email ? { ...item, addresses } : item,
      ),
    )
  }

  const quantity = (productId: number, value: number) => {
    setCart((current) =>
      value <= 0
        ? current.filter((item) => item.productId !== productId)
        : current.some((item) => item.productId === productId)
          ? current.map((item) =>
              item.productId === productId
                ? { ...item, quantity: value }
                : item,
            )
          : [...current, { productId, quantity: value, selected: true }],
    )
  }

  const selection = (productId: number, selected: boolean) => {
    setCart((current) =>
      current.map((item) =>
        item.productId === productId ? { ...item, selected } : item,
      ),
    )
  }

  const confirmOrder = (
    address: string,
    district: string,
    deliveryFee: number,
    payment: string,
    notes: string,
  ) => {
    const number =
      Math.max(
        0,
        ...orders.map((order) => Number(order.id.replace(/\D/g, ""))),
      ) + 1

    const subtotal = cart.reduce(
      (sum, item) =>
        sum +
        (products.find((p) => p.id === item.productId)?.price || 0) *
          item.quantity,
      0,
    )

    const order: Order = {
      id: `#ORD-${String(number).padStart(4, "0")}`,

      customer: currentUser.name,

      email: currentUser.email,

      address,

      district,

      deliveryFee,

      subtotal,

      notes,

      payment,

      status: "Pendiente",

      createdAt: new Date().toISOString(),

      items: cart.map((item) => {
        const product = products.find((p) => p.id === item.productId)!
        return {
          name: product.name,
          quantity: item.quantity,
          price: product.price,
        }
      }),

      total: subtotal + deliveryFee,
    }

    setOrders([order, ...orders])
    setCart([])
    setConfirmed(order)
  }

  const advance = (id: string) => {
    setOrders(
      orders.map((order) => {
        if (order.id !== id) return order

        const index = STATUSES.indexOf(order.status)

        return {
          ...order,
          status: STATUSES[Math.min(index + 1, STATUSES.length - 1)],
        }
      }),
    )

    setToast("Estado actualizado correctamente")
  }

  const saveProduct = (product: Product) => {
    setProducts(
      products.some((item) => item.id === product.id)
        ? products.map((item) => (item.id === product.id ? product : item))
        : [product, ...products],
    )

    setToast(
      product.id
        ? "Producto guardado correctamente"
        : "Producto agregado correctamente",
    )
  }

  const logout = () => {
    setSession(null)
    setView("auth")
    setConfirmed(null)
  }

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  if (!session) return <AuthScreen onLogin={login} onRegister={register} />

  return (
    <Shell
      role={session.role}
      userName={session.name}
      view={view}
      cartCount={cartCount}
      onNavigate={setView}
      onLogout={logout}
    >
      {view === "menu" && (
        <MenuScreen products={products} cart={cart} onQuantity={quantity} />
      )}
      {view === "cart" && (
        <CartScreen
          products={products}
          cart={cart}
          onQuantity={quantity}
          onSelection={selection}
          onNavigate={setView}
        />
      )}
      {view === "checkout" && (
        <CheckoutScreen
          user={currentUser}
          products={products}
          cart={cart.filter((item) => item.selected !== false)}
          onBack={() => setView("cart")}
          onConfirm={confirmOrder}
          onSaveAddresses={saveAddresses}
        />
      )}
      {view === "orders" && (
        <OrdersScreen
          orders={orders}
          email={session.email}
          onMenu={() => setView("menu")}
        />
      )}
      {view === "account" && session.role === "client" && (
        <AccountScreen user={currentUser} onSave={saveAccount} />
      )}
      {view === "admin" && (
        <AdminScreen
          orders={orders}
          products={products}
          onManage={() => setView("manage")}
        />
      )}
      {view === "ops" && <OpsScreen orders={orders} onAdvance={advance} />}
      {view === "manage" && (
        <ManageScreen
          products={products}
          onSave={saveProduct}
          onToggle={(id) => {
            setProducts(
              products.map((product) =>
                product.id === id
                  ? { ...product, active: !product.active }
                  : product,
              ),
            )
            setToast("Visibilidad actualizada")
          }}
        />
      )}
      {confirmed && (
        <SuccessModal
          order={confirmed}
          onOrders={() => {
            setConfirmed(null)
            setView("orders")
          }}
          onMenu={() => {
            setConfirmed(null)
            setView("menu")
          }}
        />
      )}
      {toast && <Toast message={toast} />}
    </Shell>
  )
}
