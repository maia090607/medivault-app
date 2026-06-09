import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useToast } from '../components/Toast';
import AiChat from '../components/AiChat';

// =========================================================
// COMPONENTES GRÁFICOS INTEGRADOS (LOGOS CORPORATIVOS REALES)
// =========================================================

const MediVaultLogo = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="8" fill="#2563eb"/>
    <path d="M16 7L24 11V17C24 21.42 19.58 25 16 25C12.42 25 8 21.42 8 17V11L16 7Z" fill="white"/>
    <path d="M16 12V20" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M12 16H20" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

const MedicalModuleIllo = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="60" cy="60" r="50" fill="#eff6ff"/>
    <rect x="35" y="30" width="50" height="65" rx="4" fill="white" stroke="#2563eb" strokeWidth="2"/>
    <path d="M42 42H55" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round"/>
    <path d="M42 50H70" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="16" cy="16" r="16" transform="translate(75 60)" fill="#10b981"/>
    <path d="M86 71V81" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M81 76H91" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="60" cy="100" r="15" fill="white" stroke="#bfdbfe" strokeWidth="2"/>
  </svg>
);

const PharmacyModuleIllo = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="60" cy="60" r="50" fill="#fef3c7"/>
    <path d="M40 40L60 30L80 40V70L60 80L40 70V40Z" fill="white" stroke="#d97706" strokeWidth="2"/>
    <path d="M40 40L60 50L80 40" stroke="#d97706" strokeWidth="2"/>
    <path d="M60 50V80" stroke="#d97706" strokeWidth="2"/>
    <circle cx="20" cy="20" r="20" transform="translate(10 70)" fill="#d97706"/>
    <path d="M25 85L29 89L35 81" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="75" y="70" width="30" height="20" rx="4" fill="white" stroke="#f59e0b" strokeWidth="2"/>
  </svg>
);

const HeroMockupUI = () => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{ position: 'relative', width: '100%', height: '100%', cursor: 'pointer' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=85&w=800&fm=jpg&crop=entropy&cs=srgb"
        alt="Médico profesional"
        style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', borderRadius: '14px', transition: 'opacity 0.35s ease', opacity: hovered ? 0 : 1 }}
      />
      <img
        src="https://pulseclinicalresearch.com/wp-content/uploads/2023/02/End-to-End-Pharma.jpg"
        alt="Farmacéutico buscando medicamentos"
        style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', borderRadius: '14px', transition: 'opacity 0.35s ease', opacity: hovered ? 1 : 0 }}
      />
    </div>
  );
};

// LOGO REAL CRUZ VERDE
const PharmacyLogoA = () => (
  <svg width="100%" height="100%" viewBox="0 0 150 45" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="22" cy="22" r="21" fill="#00875A"/>
    <path d="M22 9V35M9 22H35" stroke="white" strokeWidth="6.5" strokeLinecap="square"/>
    <text x="54" y="20" fill="#002D1A" fontFamily="'Arial Black', Impact, sans-serif" fontSize="14" fontWeight="900" letterSpacing="-0.3">cruz</text>
    <text x="54" y="35" fill="#00875A" fontFamily="'Arial Black', Impact, sans-serif" fontSize="16" fontWeight="900" letterSpacing="-0.5">verde</text>
  </svg>
);

// LOGO REAL FARMATODO
const PharmacyLogoB = () => (
  <svg width="100%" height="100%" viewBox="0 0 150 45" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 25V13L18 3L32 13V25H4Z" fill="#0D2C74"/>
    <path d="M13 25V17H23V25H13Z" fill="white"/>
    <circle cx="18" cy="10" r="2.5" fill="white"/>
    <path d="M1 28H35" stroke="#0D2C74" strokeWidth="2.5" strokeLinecap="round"/>
    <text x="44" y="21" fill="#0D2C74" fontFamily="'Franklin Gothic Medium', Arial, sans-serif" fontSize="15" fontWeight="bold" letterSpacing="-0.3">FARMATODO</text>
    <rect x="44" y="26" width="95" height="3" fill="#00A3E0"/>
  </svg>
);

// LOGO REAL MIFARMA
const PharmacyLogoC = () => (
  <svg width="100%" height="100%" viewBox="0 0 150 45" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="4" width="38" height="36" rx="12" fill="#005691"/>
    <path d="M20 13V31M11 22H29" stroke="white" strokeWidth="5" strokeLinecap="round"/>
    <path d="M20 17V27M15 22H25" stroke="#E30613" strokeWidth="2.5" strokeLinecap="round"/>
    <text x="48" y="23" fill="#005691" fontFamily="'Arial Black', sans-serif" fontSize="17" fontWeight="900" letterSpacing="-0.5">mi</text>
    <text x="68" y="23" fill="#E30613" fontFamily="'Arial Black', sans-serif" fontSize="17" fontWeight="900" letterSpacing="-0.5">farma</text>
    <text x="48" y="34" fill="#777777" fontFamily="Arial, sans-serif" fontSize="8" fontWeight="bold">Sabor a bienestar</text>
  </svg>
);

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function Landing({ onNavigateToLogin }) {
  const toast = useToast();
  const [tabActiva, setTabActiva] = useState('medico');
  const [faqActiva, setFaqActiva] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoForm, setDemoForm] = useState({ nombre: '', email: '', telefono: '', mensaje: '' });
  const [enviando, setEnviando] = useState(false);

  const handleDemoSubmit = async (e) => {
    e.preventDefault();
    if (!demoForm.nombre || !demoForm.email) {
      toast.warning('Nombre y correo son obligatorios.');
      return;
    }
    setEnviando(true);
    try {
      await addDoc(collection(db, "solicitudes"), {
        ...demoForm,
        fecha: new Date().toISOString(),
        tipo: 'demo'
      });
      toast.success('Solicitud enviada. Nos pondremos en contacto pronto.');
      setShowDemoModal(false);
      setDemoForm({ nombre: '', email: '', telefono: '', mensaje: '' });
    } catch (err) {
      console.error(err);
      toast.error('Error al enviar la solicitud. Intente nuevamente.');
    }
    setEnviando(false);
  };

  const clientsData = [
    { 
      id: 1, 
      tipo: 'medico', 
      nombre: "Dr. Alejandro Mendoza", 
      cargo: "Cardiología e Investigación", 
      institucion: "Clínica Sanitas Premium", 
      foto: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=256&h=256&q=80",
      detalles: {
        registro: "RM-994812-COL",
        universidad: "Universidad Nacional de Colombia",
        horario: "Lunes a Viernes (08:00 - 16:00)",
        kpis: [
          { label: "Efectividad Recetas", value: "98.4%", color: "#10b981" },
          { label: "Tiempo Consulta", value: "14 min", color: "#2563eb" },
          { label: "Score Nube", value: "4.9/5", color: "#f59e0b" }
        ],
        actividades: [
          { tiempo: "Hace 4 min", evento: "Fórmula #MV-9012 firmada digitalmente." },
          { tiempo: "Hace 18 min", evento: "Validación de DNI de paciente exitosa." },
          { tiempo: "Hace 1 hora", evento: "Sincronización de vademécum completada." }
        ]
      }
    },
    { 
      id: 2, 
      tipo: 'farmacia', 
      nombre: "Droguerías Cruz Verde", 
      cargo: "Suministros y Logística", 
      institucion: "Red Nacional de Despacho",
      logoType: 'A',
      detalles: {
        sucursal: "Central de Distribución Norte",
        horario: "Abierto 24 Horas",
        contacto: "01-8000-CRUZV",
        tokenStatus: "API Supabase Conectada",
        kpis: [
          { label: "Tiempo Despacho", value: "3.5 min", color: "#10b981" },
          { label: "Precisión Stock", value: "99.9%", color: "#2563eb" },
          { label: "Alertas Activas", value: "0", color: "#323232" }
        ],
        actividades: [
          { tiempo: "Hace 2 min", evento: "Token #TK-7741 validado en Firestore." },
          { tiempo: "Hace 12 min", evento: "Inventario de Insulina rebajado en sucursal." },
          { tiempo: "Hace 45 min", evento: "Auditoría de lotes cruzada sin novedades." }
        ]
      }
    },
    { 
      id: 3, 
      tipo: 'medico', 
      nombre: "Dra. Elena Rostova", 
      cargo: "Pediatría y Medicina General", 
      institucion: "Consultorio Independiente", 
      foto: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=256&h=256&q=80",
      detalles: {
        registro: "RM-441209-COL",
        universidad: "Pontificia Universidad Javeriana",
        horario: "Martes y Jueves (09:00 - 18:00)",
        kpis: [
          { label: "Efectividad Recetas", value: "99.1%", color: "#10b981" },
          { label: "Tiempo Consulta", value: "19 min", color: "#2563eb" },
          { label: "Score Nube", value: "5.0/5", color: "#f59e0b" }
        ],
        actividades: [
          { tiempo: "Hace 8 min", evento: "Nueva receta pediátrica tokenizada." },
          { tiempo: "Hace 30 min", evento: "Consulta de historial clínico remoto." },
          { tiempo: "Hace 2 horas", evento: "Actualización de base de datos de pacientes." }
        ]
      }
    },
    { 
      id: 4, 
      tipo: 'farmacia', 
      nombre: "Farmatodo Colombia", 
      cargo: "Inventario y Autoservicio", 
      institucion: "Cadena de Distribución",
      logoType: 'B',
      detalles: {
        sucursal: "Sede Principal Autoservicio",
        horario: "Abierto 24 Horas",
        contacto: "redes@farmatodo.com.co",
        tokenStatus: "API Supabase Conectada",
        kpis: [
          { label: "Tiempo Despacho", value: "4.2 min", color: "#10b981" },
          { label: "Precisión Stock", value: "99.7%", color: "#2563eb" },
          { label: "Alertas Activas", value: "2", color: "#ef4444" }
        ],
        actividades: [
          { tiempo: "Hace 5 min", evento: "Fórmula surtida y marcada como 'Consumida'." },
          { tiempo: "Hace 22 min", evento: "Alerta automática: Stock crítico de Amoxicilina." },
          { tiempo: "Hace 1 hora", evento: "Webhook de conciliación ejecutado correctamente." }
        ]
      }
    },
    { 
      id: 5, 
      tipo: 'medico', 
      nombre: "Dr. Carlos Benítez", 
      cargo: "Endocrinología Clínica", 
      institucion: "Centro Médico Alfa", 
      foto: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=256&h=256&q=80",
      detalles: {
        registro: "RM-775123-COL",
        universidad: "Universidad del Rosario",
        horario: "Lunes a Jueves (07:00 - 15:00)",
        kpis: [
          { label: "Efectividad Recetas", value: "97.8%", color: "#10b981" },
          { label: "Tiempo Consulta", value: "12 min", color: "#2563eb" },
          { label: "Score Nube", value: "4.7/5", color: "#f59e0b" }
        ],
        actividades: [
          { tiempo: "Hace 15 min", evento: "Prescripción de tratamiento crónico subida." },
          { tiempo: "Hace 40 min", evento: "Validación de firma electrónica por la entidad." },
          { tiempo: "Hace 3 horas", evento: "Inicio de sesión seguro desde nodo clínico." }
        ]
      }
    },
    { 
      id: 6, 
      tipo: 'farmacia', 
      nombre: "Mifarma Especializada", 
      cargo: "Administración General", 
      institucion: "Central de Medicamentos",
      logoType: 'C',
      detalles: {
        sucursal: "Distribuidora Metropolitana",
        horario: "Lunes a Sábado (06:00 - 22:00)",
        contacto: "soporte@mifarma.com",
        tokenStatus: "API Supabase Conectada",
        kpis: [
          { label: "Tiempo Despacho", value: "3.9 min", color: "#10b981" },
          { label: "Precisión Stock", value: "99.8%", color: "#2563eb" },
          { label: "Alertas Activas", value: "0", color: "#323232" }
        ],
        actividades: [
          { tiempo: "Hace 10 min", evento: "Escaneo de código QR de receta verificado." },
          { tiempo: "Hace 25 min", evento: "Sincronización de lotes con servidor central." },
          { tiempo: "Hace 1 hora", evento: "Reporte de despacho diario generado en PDF." }
        ]
      }
    }
  ];

  const faqsData = [
    {
      id: 1,
      pregunta: "¿Cómo garantiza MediVault la seguridad de las recetas médicas?",
      respuesta: "MediVault procesa cada fórmula generando un token criptográfico único guardado de forma segura en Firestore. Cuando la farmacia escanea o introduce dicho token, el sistema valida su autenticidad y lo marca inmediatamente como consumido, imposibilitando fraudes por duplicación."
    },
    {
      id: 2,
      pregunta: "¿El inventario de la farmacia se actualiza automáticamente al emitir una fórmula?",
      respuesta: "Sí, la sincronización en la nube es instantánea. En el momento en que la farmacia procesa el despacho de los medicamentos, el stock general disminuye en tiempo real, lo que permite al módulo médico visualizar con precisión predictiva las existencias antes de recetar."
    },
    {
      id: 3,
      pregunta: "¿Qué sucede si una farmacia intenta surtir una receta ya entregada?",
      respuesta: "El software arrojará de forma inmediata una alerta de seguridad denegando la transacción. Cada orden posee un estado único verificado por auditoría cruzada, asegurando que las recetas electrónicas sean de único uso."
    },
    {
      id: 4,
      pregunta: "¿Es compatible con cualquier tipo de clínica o farmacia pequeña?",
      respuesta: "Totalmente. Al ser un software nativo en la nube (SaaS), MediVault está adaptado para optimizar los flujos de trabajo de consultorios independientes, Pymes de salud y cadenas de distribución farmacéutica sin requerir infraestructura local compleja."
    }
  ];

  const toggleFaq = (id) => {
    setFaqActiva(faqActiva === id ? null : id);
  };

  const st = {
    wrapper: {
      background: '#ffffff',
      minHeight: '100vh',
      width: '100%',
      fontFamily: '"Inter", "Segoe UI", sans-serif',
      color: '#1e293b',
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      WebkitFontSmoothing: 'antialiased'
    },
    navbar: {
      width: '100%',
      borderBottom: '1px solid #e2e8f0',
      background: '#ffffff',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    },
    navContainer: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '18px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxSizing: 'border-box'
    },
    logo: {
      fontSize: '1.45rem',
      fontWeight: '800',
      color: '#0f172a',
      letterSpacing: '-0.5px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    navLinks: {
      display: 'flex',
      gap: '32px',
      alignItems: 'center'
    },
    navLink: {
      color: '#475569',
      textDecoration: 'none',
      fontWeight: '600',
      fontSize: '0.9rem',
      transition: 'color 0.15s ease'
    },
    btnNavLogin: {
      background: 'transparent',
      border: '1px solid #2563eb',
      color: '#2563eb',
      padding: '8px 20px',
      borderRadius: '6px',
      fontWeight: '700',
      fontSize: '0.88rem',
      cursor: 'pointer',
      transition: 'all 0.15s ease'
    },
    heroOuter: {
      width: '100%',
      background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
      padding: '100px 24px 80px 24px',
      boxSizing: 'border-box'
    },
    heroContainer: {
      maxWidth: '1050px',
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: '1.1fr 0.9fr',
      alignItems: 'center',
      gap: '50px'
    },
    badgeSiigo: {
      background: '#e6f0ff',
      color: '#2563eb',
      padding: '6px 14px',
      borderRadius: '4px',
      fontSize: '0.78rem',
      fontWeight: '700',
      display: 'inline-block',
      marginBottom: '16px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    heroTitle: {
      fontSize: '3.4rem',
      fontWeight: '900',
      color: '#0f172a',
      lineHeight: '1.1',
      margin: '0 0 24px 0',
      letterSpacing: '-1.8px'
    },
    heroSubtitle: {
      fontSize: '1.2rem',
      color: '#475569',
      lineHeight: '1.6',
      margin: '0 0 40px 0',
      fontWeight: '500'
    },
    ctaGroup: {
      display: 'flex',
      gap: '16px'
    },
    btnPrimary: {
      background: '#2563eb',
      color: '#ffffff',
      border: 'none',
      padding: '16px 36px',
      borderRadius: '6px',
      fontWeight: '700',
      fontSize: '0.98rem',
      cursor: 'pointer',
      transition: 'all 0.15s ease',
      boxShadow: '0 4px 6px rgba(0, 82, 204, 0.15)'
    },
    btnSecondary: {
      background: '#ffffff',
      color: '#334155',
      border: '1px solid #e2e8f0',
      padding: '16px 36px',
      borderRadius: '6px',
      fontWeight: '700',
      fontSize: '0.98rem',
      cursor: 'pointer',
      transition: 'all 0.15s ease'
    },
    heroMockupContainer: {
      position: 'relative',
      width: '100%',
      height: '350px'
    },
    heroMockupBox: {
      width: '100%',
      height: '100%',
      borderRadius: '14px',
      boxShadow: '0 25px 30px -8px rgba(0, 0, 0, 0.12), 0 8px 15px -6px rgba(0, 0, 0, 0.05)',
      overflow: 'hidden'
    },
    metricsBar: {
      background: '#ffffff',
      borderTop: '1px solid #e2e8f0',
      borderBottom: '1px solid #e2e8f0',
      padding: '30px 24px'
    },
    metricsContainer: {
      maxWidth: '1100px',
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '20px'
    },
    metricItem: {
      textAlign: 'center',
      borderRight: '1px solid #e2e8f0',
      padding: '0 10px'
    },
    metricNumber: {
      fontSize: '1.8rem',
      fontWeight: '900',
      color: '#2563eb',
      display: 'block',
      letterSpacing: '-0.5px'
    },
    metricLabel: {
      fontSize: '0.9rem',
      color: '#64748b',
      fontWeight: '600',
      marginTop: '4px'
    },
    sectionTabs: {
      width: '100%',
      maxWidth: '1150px',
      margin: '0 auto',
      padding: '90px 24px',
      boxSizing: 'border-box'
    },
    sectionTitle: {
      fontSize: '2.2rem',
      fontWeight: '800',
      color: '#0f172a',
      textAlign: 'center',
      marginBottom: '16px',
      letterSpacing: '-0.8px'
    },
    sectionSubtitle: {
      fontSize: '1.1rem',
      color: '#64748b',
      textAlign: 'center',
      marginBottom: '50px',
      fontWeight: '500',
      maxWidth: '600px',
      margin: '0 auto 50px auto'
    },
    tabsHeader: {
      display: 'flex',
      justifyContent: 'center',
      gap: '12px',
      marginBottom: '40px',
      borderBottom: '2px solid #f1f5f9',
      paddingBottom: '20px'
    },
    tabBtn: (activo) => ({
      padding: '14px 28px',
      border: 'none',
      background: activo ? '#e6f0ff' : 'transparent',
      color: activo ? '#2563eb' : '#475569',
      fontWeight: '700',
      fontSize: '1rem',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.15s ease'
    }),
    tabContentCard: {
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '16px',
      padding: '50px',
      display: 'grid',
      gridTemplateColumns: '1.2fr 0.8fr',
      gap: '50px',
      alignItems: 'center',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.03)'
    },
    tabIlloContainer: {
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '15px'
    },
    sectionClients: {
      width: '100%',
      maxWidth: '1150px',
      margin: '0 auto',
      padding: '40px 24px 90px 24px',
      boxSizing: 'border-box'
    },
    gridClients: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '24px',
      marginTop: '40px'
    },
    cardClient: {
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '16px',
      padding: '32px 24px',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      minHeight: '340px',
      boxSizing: 'border-box',
      cursor: 'pointer',
      transition: 'all 0.15s ease'
    },
    brandHeader: {
      height: '64px',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '16px'
    },
    imageContainer: {
      width: '64px',
      height: '64px',
      borderRadius: '50%',
      overflow: 'hidden',
      border: '2px solid #2563eb',
      background: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    doctorImg: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },
    logoWrapper: {
      width: '135px',
      height: '42px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    clientBadge: {
      fontSize: '0.72rem',
      fontWeight: '700',
      padding: '4px 10px',
      borderRadius: '4px',
 textTransform: 'uppercase',
      letterSpacing: '0.3px',
      marginBottom: '16px',
      display: 'inline-block'
    },
    clientName: {
      fontSize: '1.1rem',
      fontWeight: '800',
      color: '#0f172a',
      margin: '0 0 6px 0',
      lineHeight: '1.3'
    },
    clientSub: {
      fontSize: '0.88rem',
      color: '#64748b',
      fontWeight: '600',
      margin: '0 0 4px 0'
    },
    clientInst: {
      fontSize: '0.82rem',
      color: '#94a3b8',
      fontWeight: '500',
      marginTop: '4px'
    },
    sectionFaq: {
      width: '100%',
      background: '#f8fafc',
      borderTop: '1px solid #e2e8f0',
      borderBottom: '1px solid #e2e8f0',
      padding: '90px 24px',
      boxSizing: 'border-box'
    },
    faqContainer: {
      maxWidth: '800px',
      margin: '0 auto'
    },
    faqList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      marginTop: '40px'
    },
    faqItem: {
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      overflow: 'hidden',
      transition: 'border-color 0.15s ease'
    },
    faqHeader: {
      width: '100%',
      padding: '20px 24px',
      background: 'transparent',
      border: 'none',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      cursor: 'pointer',
      textAlign: 'left'
    },
    faqQuestion: {
      fontSize: '1.05rem',
      fontWeight: '700',
      color: '#0f172a',
      margin: 0
    },
    faqIcon: (abierto) => ({
      fontSize: '1.2rem',
      color: abierto ? '#2563eb' : '#94a3b8',
      transform: abierto ? 'rotate(45deg)' : 'rotate(0deg)',
      transition: 'transform 0.2s ease, color 0.15s ease',
      fontWeight: '400'
    }),
    faqBody: (abierto) => ({
      maxHeight: abierto ? '300px' : '0px',
      padding: abierto ? '0 24px 20px 24px' : '0 24px',
      opacity: abierto ? 1 : 0,
      overflow: 'hidden',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      boxSizing: 'border-box'
    }),
    faqAnswer: {
      fontSize: '0.98rem',
      color: '#475569',
      lineHeight: '1.6',
      margin: 0,
      fontWeight: '500'
    },
    footer: {
      marginTop: 'auto',
      width: '100%',
      background: '#ffffff',
      borderTop: '1px solid #e2e8f0',
      padding: '40px 24px'
    },
    footerContainer: {
      maxWidth: '1150px',
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '0.9rem',
      color: '#64748b',
      fontWeight: '500'
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    },
    modalContent: {
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      width: '100%',
      maxWidth: '540px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      padding: '32px',
      position: 'relative',
      boxSizing: 'border-box',
      border: '1px solid #e2e8f0',
      maxHeight: '90vh',
      overflowY: 'auto'
    },
    modalCloseBtn: {
      position: 'absolute',
      top: '20px',
      right: '20px',
      background: '#f1f5f9',
      border: 'none',
      color: '#64748b',
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      fontSize: '1rem',
      transition: 'background 0.15s ease'
    }
  };

  

  return (
    <div style={st.wrapper} className="landing-wrapper">
      <style>{`
        .siigo-link:hover { color: #2563eb !important; }
        .btn-nav-login:hover { background: #2563eb !important; color: #ffffff !important; }
        .btn-primary:hover { background: #0043a4 !important; transform: translateY(-1px); }
        .btn-secondary:hover { background: #f8fafc !important; border-color: #cbd5e1 !important; }
        .bullet-list { list-style: none; padding: 0; margin: 25px 0 0 0; }
        .bullet-list li { margin-bottom: 14px; font-size: 1rem; color: #475569; display: flex; align-items: center; gap: 10px; font-weight: 500; }
        .bullet-icon { color: #10b981; font-weight: bold; font-size: 1.1rem; }
        .metric-item-last { border-right: none !important; }
        .faq-item-box:hover { border-color: #bfdbfe !important; }
        .client-card-box:hover { border-color: #2563eb !important; transform: translateY(-3px); box-shadow: 0 12px 20px -5px rgba(0, 82, 204, 0.08); }
        .close-modal-btn:hover { background: #e2e8f0 !important; color: #0f172a !important; }
        @media (max-width: 767px) {
          .landing-wrapper { padding: 0 16px !important; }
          .landing-hero { padding: 40px 0 !important; }
          .landing-hero h1 { font-size: 1.8rem !important; line-height: 1.2 !important; letter-spacing: -1px !important; }
          .landing-hero p { font-size: 0.95rem !important; }
          .landing-grid-2 { grid-template-columns: 1fr !important; }
          .landing-grid-3 { grid-template-columns: 1fr !important; }
          .landing-grid-4 { grid-template-columns: 1fr 1fr !important; }
          .landing-section { padding: 40px 0 !important; }
          .landing-hide-mobile { display: none !important; }
          .landing-section h2 { font-size: 1.6rem !important; }
          .landing-section .landing-subtitle { font-size: 0.95rem !important; margin-bottom: 30px !important; }

          .landing-nav-links { display: none !important; }
          .landing-cta-group { flex-direction: column !important; gap: 12px !important; }
          .landing-cta-group button { width: 100% !important; text-align: center !important; }

          .landing-tabs-header { flex-direction: column !important; gap: 8px !important; padding-bottom: 12px !important; }
          .landing-tabs-header button { width: 100% !important; text-align: center !important; }
          .landing-tab-content { padding: 24px !important; }

          .landing-modal-inner { width: 100% !important; max-width: 100% !important; padding: 20px !important; border-radius: 12px !important; max-height: 85dvh !important; margin: 10px !important; }

          .landing-footer-inner { flex-direction: column !important; gap: 16px !important; text-align: center !important; }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .landing-grid-2 { grid-template-columns: 1fr 1fr !important; }
          .landing-grid-3 { grid-template-columns: 1fr 1fr !important; }
          .landing-grid-4 { grid-template-columns: 1fr 1fr !important; }
          .landing-tab-content { padding: 30px !important; }
        }
        
        /* ANIMACIÓN LIVE DE PULSO */
        @keyframes livePing {
          0% { transform: scale(0.8); opacity: 0.5; }
          50% { opacity: 1; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        .live-pulse-dot {
          position: relative;
          width: 8px;
          height: 8px;
          background-color: #10b981;
          border-radius: 50%;
          display: inline-block;
        }
        .live-pulse-dot::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          background-color: #10b981;
          border-radius: 50%;
          animation: livePing 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>

      {/* NAVBAR */}
      <nav style={st.navbar}>
        <div style={st.navContainer}>
          <div style={st.logo}>
            <MediVaultLogo /> MediVault
          </div>
          <div style={st.navLinks} className="landing-nav-links">
            <a href="#soluciones" className="siigo-link" style={st.navLink}>Soluciones</a>
            <a href="#clientes" className="siigo-link" style={st.navLink}>Nuestros Clientes</a>
            <a href="#faqs" className="siigo-link" style={st.navLink}>Preguntas Frecuentes</a>
            <button className="btn-nav-login" style={st.btnNavLogin} onClick={onNavigateToLogin}>
              Iniciar Sesión
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header style={st.heroOuter} className="landing-hero">
        <div style={st.heroContainer} className="landing-grid-2">
          <div>
            <div style={st.badgeSiigo}>Software Administrativo y Clínico Cloud</div>
            <h1 style={st.heroTitle}>Controla tu farmacia y consultas médicas en un solo lugar</h1>
            <p style={st.heroSubtitle}>
              La plataforma en la nube diseñada para Pymes de salud. Automatiza recetas digitales, asegura despachos con tokens únicos y gestiona inventarios en tiempo real.
            </p>
            <div style={st.ctaGroup} className="landing-cta-group">
              <button className="btn-primary" style={st.btnPrimary} onClick={onNavigateToLogin}>
                Ingresar al Sistema
              </button>
              <button className="btn-secondary" style={st.btnSecondary} onClick={() => setShowDemoModal(true)}>
                Solicitar Demo
              </button>
            </div>
          </div>
          <div style={st.heroMockupContainer}>
            <div style={st.heroMockupBox}>
              <HeroMockupUI />
            </div>
          </div>
        </div>
      </header>

      {/* BARRA DE MÉTRICAS */}
      <section style={st.metricsBar} className="landing-section">
        <div style={st.metricsContainer} className="landing-grid-4">
          <div style={st.metricItem}>
            <span style={st.metricNumber}>+10,000</span>
            <span style={st.metricLabel}>Recetas Procesadas</span>
          </div>
          <div style={st.metricItem}>
            <span style={st.metricNumber}>100%</span>
            <span style={st.metricLabel}>Sincronización Firestore</span>
          </div>
          <div style={st.metricItem}>
            <span style={st.metricNumber}>0.0%</span>
            <span style={st.metricLabel}>Tasa de Fraude</span>
          </div>
          <div className="metric-item-last" style={{...st.metricItem, borderRight: 'none'}}>
            <span style={st.metricNumber}>99.9%</span>
            <span style={st.metricLabel}>Uptime de Plataforma</span>
          </div>
        </div>
      </section>

      {/* SECCIÓN SOLUCIONES */}
      <section id="soluciones" style={st.sectionTabs} className="landing-section">
        <h2 style={st.sectionTitle}>Ecosistema modular integrado</h2>
        <p style={st.sectionSubtitle} className="landing-subtitle">Simplifica la administración de tu práctica médica y farmacéutica con herramientas nativas cloud.</p>
        <div style={st.tabsHeader} className="landing-tabs-header">
          <button style={st.tabBtn(tabActiva === 'medico')} onClick={() => setTabActiva('medico')}>
            📋 Módulo de Prescripción Médica
          </button>
          <button style={st.tabBtn(tabActiva === 'farmacia')} onClick={() => setTabActiva('farmacia')}>
            📦 Módulo de Gestión de Farmacia
          </button>
        </div>

        {tabActiva === 'medico' ? (
          <div style={st.tabContentCard} className="landing-grid-2 landing-tab-content">
            <div>
              <span style={{ ...st.badgeSiigo, background: '#dcfce7', color: '#16a34a' }}>Seguridad y Agilidad</span>
              <h3 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '12px 0', color: '#0f172a' }}>Emisión inteligente de fórmulas</h3>
              <p style={{ color: '#475569', lineHeight: '1.6', fontWeight: '500' }}>
                Reduce tiempos en consulta con un flujo diseñado para la prescripción rápida y segura de medicamentos.
              </p>
              <ul className="bullet-list">
                <li><span className="bullet-icon">✓</span> Validación de DNI de paciente en tiempo real.</li>
                <li><span className="bullet-icon">✓</span> Búsqueda predictiva conectado al stock de farmacia.</li>
                <li><span className="bullet-icon">✓</span> Generación de tokens criptográficos de único uso.</li>
                <li><span className="bullet-icon">✓</span> Archivo histórico digital de recetas emitidas.</li>
              </ul>
            </div>
            <div style={st.tabIlloContainer}>
              <MedicalModuleIllo />
              <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#64748b', background: '#f1f5f9', padding: '8px 16px', borderRadius: '6px' }}>
                Interfaz Médica MediVault Pro
              </div>
            </div>
          </div>
        ) : (
          <div style={st.tabContentCard} className="landing-grid-2 landing-tab-content">
            <div>
              <span style={{ ...st.badgeSiigo, background: '#fef3c7', color: '#d97706' }}>Control de Almacén</span>
              <h3 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '12px 0', color: '#0f172a' }}>Inventario sincronizado y auditable</h3>
              <p style={{ color: '#475569', lineHeight: '1.6', fontWeight: '500' }}>
                Toma el control absoluto de tus existencias, trazabilidad de despachos y auditorías cruzadas automáticas.
              </p>
              <ul className="bullet-list">
                <li><span className="bullet-icon">✓</span> Verificación de recetas mediante Token de seguridad.</li>
                <li><span className="bullet-icon">✓</span> Alertas inteligentes de stock crítico y agotado.</li>
                <li><span className="bullet-icon">✓</span> Reportes dinámicos de consumo global y por médico.</li>
                <li><span className="bullet-icon">✓</span> Flujo de reabastecimiento simplificado en modal.</li>
              </ul>
            </div>
            <div style={st.tabIlloContainer}>
              <PharmacyModuleIllo />
              <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#64748b', background: '#f1f5f9', padding: '8px 16px', borderRadius: '6px' }}>
                Control de Farmacia Sincronizado
              </div>
            </div>
          </div>
        )}
      </section>

      {/* SECCIÓN NUESTROS CLIENTES */}
      <section id="clientes" style={st.sectionClients} className="landing-section">
        <h2 style={st.sectionTitle}>Nuestros clientes</h2>
        <p style={st.sectionSubtitle} className="landing-subtitle">Haz clic en cualquier tarjeta para auditar métricas de rendimiento y estado de conexión en vivo.</p>
        
        <div style={st.gridClients} className="landing-grid-3">
          {clientsData.map((client) => (
            <div key={client.id} className="client-card-box" style={st.cardClient} onClick={() => setSelectedClient(client)}>
              <div style={st.brandHeader}>
                {client.tipo === 'medico' ? (
                  <div style={st.imageContainer}>
                    <img src={client.foto} alt={client.nombre} style={st.doctorImg} />
                  </div>
                ) : (
                  <div style={st.logoWrapper}>
                    {client.logoType === 'A' && <PharmacyLogoA />}
                    {client.logoType === 'B' && <PharmacyLogoB />}
                    {client.logoType === 'C' && <PharmacyLogoC />}
                  </div>
                )}
              </div>
              
              <span style={{
                ...st.clientBadge,
                background: client.tipo === 'medico' ? '#e0f2fe' : '#fef3c7',
                color: client.tipo === 'medico' ? '#0369a1' : '#b45309'
              }}>
                {client.tipo === 'medico' ? 'Especialista Verificado' : 'Farmacia Conectada'}
              </span>
              
              <div>
                <h4 style={st.clientName}>{client.nombre}</h4>
                <p style={st.clientSub}>{client.cargo}</p>
                <div style={st.clientInst}>{client.institucion}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MODAL INTERACTIVO AVANZADO */}
      {selectedClient && (
        <div style={st.modalOverlay} onClick={() => setSelectedClient(null)}>
          <div style={st.modalContent} className="landing-modal-inner" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-btn" style={st.modalCloseBtn} onClick={() => setSelectedClient(null)}>✕</button>
            
            {/* Cabecera del modal */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ ...st.brandHeader, height: '80px', marginBottom: '12px' }}>
                {selectedClient.tipo === 'medico' ? (
                  <div style={{ ...st.imageContainer, width: '80px', height: '80px' }}>
                    <img src={selectedClient.foto} alt={selectedClient.nombre} style={st.doctorImg} />
                  </div>
                ) : (
                  <div style={{ ...st.logoWrapper, width: '160px', height: '50px' }}>
                    {selectedClient.logoType === 'A' && <PharmacyLogoA />}
                    {selectedClient.logoType === 'B' && <PharmacyLogoB />}
                    {selectedClient.logoType === 'C' && <PharmacyLogoC />}
                  </div>
                )}
              </div>

              {/* FASE 1: Indicador en vivo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '4px 10px', borderRadius: '20px', marginBottom: '12px' }}>
                <span className="live-pulse-dot"></span>
                <span style={{ fontSize: '0.74rem', fontWeight: '700', color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Conectado Cloud Live
                </span>
              </div>
              
              <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', margin: '0 0 2px 0' }}>{selectedClient.nombre}</h3>
              <p style={{ fontSize: '0.88rem', color: '#64748b', fontWeight: '600', margin: 0 }}>{selectedClient.cargo}</p>
            </div>

            {/* FASE 2: KPIs de Rendimiento Express */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
              {selectedClient.detalles.kpis.map((kpi, idx) => (
                <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 8px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: '600', display: 'block', lineHeight: '1.2', marginBottom: '4px' }}>
                    {kpi.label}
                  </span>
                  <span style={{ fontSize: '1.05rem', fontWeight: '800', color: kpi.color }}>
                    {kpi.value}
                  </span>
                </div>
              ))}
            </div>

            {/* FASE 3: NUEVA SECCIÓN DE ACTIVIDAD RECIENTE (TIMELINE) */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
              <h4 style={{ fontSize: '0.78rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 14px 0' }}>
                Logs de Operación Reciente
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative', paddingLeft: '8px' }}>
                {selectedClient.detalles.actividades.map((act, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', position: 'relative' }}>
                    {/* Indicador de Línea del Timeline */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '4px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2563eb' }}></div>
                      {idx !== selectedClient.detalles.actividades.length - 1 && (
                        <div style={{ width: '1px', height: '26px', background: '#e2e8f0', marginTop: '4px', marginBottom: '-10px' }}></div>
                      )}
                    </div>
                    {/* Texto del Evento */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#94a3b8' }}>{act.tiempo}</span>
                      <span style={{ fontSize: '0.84rem', color: '#334155', fontWeight: '500', lineHeight: '1.3' }}>{act.evento}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ficha Técnica Base */}
            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '0.78rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 12px 0' }}>
                Ficha de Enlace Técnico
              </h4>
              
              {selectedClient.tipo === 'medico' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b', fontWeight: '500' }}>Registro Médico:</span>
                    <span style={{ color: '#0f172a', fontWeight: '700', fontFamily: 'monospace' }}>{selectedClient.detalles.registro}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
                    <span style={{ color: '#64748b', fontWeight: '500' }}>Institución Formadora:</span>
                    <span style={{ color: '#0f172a', fontWeight: '600' }}>{selectedClient.detalles.universidad}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
                    <span style={{ color: '#64748b', fontWeight: '500' }}>Ventana Operativa:</span>
                    <span style={{ color: '#0f172a', fontWeight: '600' }}>{selectedClient.detalles.horario}</span>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ color: '#64748b', fontWeight: '500' }}>Nodo de Despacho:</span>
                    <span style={{ color: '#0f172a', fontWeight: '600' }}>{selectedClient.detalles.sucursal}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
                    <span style={{ color: '#64748b', fontWeight: '500' }}>Horario Almacén:</span>
                    <span style={{ color: '#10b981', fontWeight: '700' }}>{selectedClient.detalles.horario}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
                    <span style={{ color: '#64748b', fontWeight: '500' }}>Web Service Core:</span>
                    <span style={{ color: '#2563eb', fontWeight: '700', fontSize: '0.8rem', background: '#e6f0ff', padding: '2px 6px', borderRadius: '4px' }}>
                      {selectedClient.detalles.tokenStatus}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <button 
              className="btn-primary" 
              style={{ ...st.btnPrimary, width: '100%', padding: '12px', marginTop: '16px', fontSize: '0.9rem', boxShadow: 'none' }}
              onClick={() => setSelectedClient(null)}
            >
              Cerrar Consola de Auditoría
            </button>
          </div>
        </div>
      )}

      {/* BLOQUE DE PREGUNTAS FRECUENTES */}
      <section id="faqs" style={st.sectionFaq} className="landing-section">
        <div style={st.faqContainer}>
          <h2 style={st.sectionTitle}>Preguntas frecuentes</h2>
          <p style={st.sectionSubtitle} className="landing-subtitle">Resuelve tus dudas operacionales y técnicas sobre el ecosistema cloud de MediVault.</p>
          <div style={st.faqList}>
            {faqsData.map((faq) => {
              const abierto = faqActiva === faq.id;
              return (
                <div key={faq.id} className="faq-item-box" style={st.faqItem}>
                  <button style={st.faqHeader} onClick={() => toggleFaq(faq.id)}>
                    <h4 style={st.faqQuestion}>{faq.pregunta}</h4>
                    <span style={st.faqIcon(abierto)}>+</span>
                  </button>
                  <div style={st.faqBody(abierto)}>
                    <p style={st.faqAnswer}>{faq.respuesta}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={st.footer}>
        <div style={st.footerContainer} className="landing-footer-inner">
          <div>© 2026 MediVault Cloud Solutions. Todos los derechos reservados. Estándar UI SaaS Corporativo.</div>
          <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
            <span style={{ fontWeight: '600' }}>Security Cloud</span>
            <span style={{ color: '#cbd5e1' }}>|</span>
            <span style={{ fontWeight: '600' }}>Soporte Técnico</span>
            <span style={{ color: '#cbd5e1' }}>|</span>
            <span style={{ fontWeight: '600' }}>Términos y Condiciones</span>
          </div>
        </div>
      </footer>

      {/* MODAL SOLICITAR DEMO */}
      {showDemoModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 5000, backdropFilter: 'blur(4px)',
        }}>
          <div className="landing-modal-inner" style={{
            background: '#ffffff', borderRadius: '16px', padding: '40px',
            maxWidth: '440px', width: '90%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
            position: 'relative', animation: 'fadeIn 0.25s ease',
          }}>
            <button
              onClick={() => setShowDemoModal(false)}
              style={{
                position: 'absolute', top: '16px', right: '16px',
                background: '#f1f5f9', border: 'none', borderRadius: '8px',
                width: '32px', height: '32px', cursor: 'pointer',
                fontSize: '1.1rem', color: '#64748b', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontWeight: '700',
              }}
            >✕</button>

            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.4rem', fontWeight: '700', color: '#0f172a' }}>
              Solicitar Demo
            </h3>
            <p style={{ margin: '0 0 24px 0', fontSize: '0.9rem', color: '#64748b' }}>
              Complete el formulario y un asesor se comunicará con usted.
            </p>

            <form onSubmit={handleDemoSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', color: '#334155', marginBottom: '6px' }}>Nombre completo *</label>
                <input
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', background: '#ffffff', color: '#0f172a' }}
                  placeholder="Ej. Carlos López"
                  value={demoForm.nombre}
                  onChange={e => setDemoForm({ ...demoForm, nombre: e.target.value })}
                  required
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', color: '#334155', marginBottom: '6px' }}>Correo electrónico *</label>
                <input
                  type="email"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', background: '#ffffff', color: '#0f172a' }}
                  placeholder="carlos@clinica.com"
                  value={demoForm.email}
                  onChange={e => setDemoForm({ ...demoForm, email: e.target.value })}
                  required
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', color: '#334155', marginBottom: '6px' }}>Teléfono</label>
                <input
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', background: '#ffffff', color: '#0f172a' }}
                  placeholder="+57 300 123 4567"
                  value={demoForm.telefono}
                  onChange={e => setDemoForm({ ...demoForm, telefono: e.target.value })}
                />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', color: '#334155', marginBottom: '6px' }}>Mensaje</label>
                <textarea
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', background: '#ffffff', color: '#0f172a', minHeight: '80px', fontFamily: 'inherit', resize: 'vertical' }}
                  placeholder="Cuéntenos sobre su proyecto o necesidades..."
                  value={demoForm.mensaje}
                  onChange={e => setDemoForm({ ...demoForm, mensaje: e.target.value })}
                />
              </div>
              <button
                type="submit"
                disabled={enviando}
                style={{
                  width: '100%', padding: '14px', background: enviando ? '#94a3b8' : '#2563eb',
                  color: '#ffffff', border: 'none', borderRadius: '10px',
                  fontWeight: '700', fontSize: '1rem', cursor: enviando ? 'not-allowed' : 'pointer',
                }}
              >
                {enviando ? 'Enviando...' : 'Enviar Solicitud'}
              </button>
            </form>
          </div>
        </div>
      )}

      <AiChat
        datos={{
          vistaActual: 'landing',
        }}
        darkMode={false}
      />
    </div>
  );
}

export default Landing;