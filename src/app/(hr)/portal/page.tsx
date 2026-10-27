'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  FileText,
  Briefcase,
  Lock,
  Download,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Shield,
  KeyRound,
  Calendar,
  CalendarDays,
  Building2,
  Clock,
  MapPin,
  Coffee,
  Check,
  X,
  Plus,
  Palmtree,
  Timer,
  ClipboardList,
  Printer,
  Send,
  Sun,
  QrCode,
  Fingerprint,
  BadgeCheck,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import {
  HrAppBar,
  HrBottomNav,
  HrTabs,
  HrButton,
  HrBadge,
  HrDataList,
  HrTable,
  HrCardList,
  HrDialog,
  HrInput,
  HrField,
  HrSelect,
  HrSkeleton,
} from '@/components/hr';
import { useHrToast } from '@/components/hr/hr-toast';

export default function PortalColaboradorPage() {
  const router = useRouter();
  const toast = useHrToast();

  const [user, setUser] = useState<any | null>(null);
  const [employee, setEmployee] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ponto');

  // Live Clock state (Luanda Time UTC+1)
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  // Time / Ponto State
  const [todayPonto, setTodayPonto] = useState<any | null>(null);
  const [isClocking, setIsClocking] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<string>('Obtendo sinal GPS...');
  const [lastCoords, setLastCoords] = useState<{ lat: number; lng: number; acc?: number } | null>(null);

  // Correction Request Modal
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [correctionForm, setCorrectionForm] = useState({
    targetEntryType: 'ENTRADA',
    date: new Date().toISOString().split('T')[0],
    time: '08:00',
    reason: '',
  });

  // Leave / Ausências State
  const [leaveBalance, setLeaveBalance] = useState<any | null>(null);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);

  // Timesheet / Folha de Ponto State
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [timesheetData, setTimesheetData] = useState<any | null>(null);
  const [isLoadingTimesheet, setIsLoadingTimesheet] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmittingTimesheet, setIsSubmittingTimesheet] = useState(false);

  // Payslips / Recibos de Vencimento State
  const [payslips, setPayslips] = useState<any[]>([]);
  const [selectedPayslip, setSelectedPayslip] = useState<any | null>(null);
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
  const [isLoadingPayslip, setIsLoadingPayslip] = useState(false);

  // Password Change state
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passError, setPassError] = useState<string | null>(null);
  const [isSubmittingPass, setIsSubmittingPass] = useState(false);

  // Crachá Virtual / Design
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [sunlightMode, setSunlightMode] = useState(false);

  // Clock ticker
  useEffect(() => {
    setCurrentTime(new Date());
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('tab') === 'perfil') {
      setActiveTab('perfil');
    }
  }, []);

  // Geolocation detector
  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLastCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            acc: pos.coords.accuracy,
          });
          setGpsStatus(`GPS Activo (±${Math.round(pos.coords.accuracy)}m de precisão)`);
        },
        () => {
          setGpsStatus('GPS não disponível ou permissão recusada');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      setGpsStatus('Geolocalização não suportada');
    }
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Check session
      const sessionRes = await fetch('/api/auth/session');
      if (!sessionRes.ok) {
        router.push('/rh/entrar?redirect=/portal');
        return;
      }
      const sessionData = await sessionRes.json().catch(() => ({}));
      if (!sessionData?.user) {
        router.push('/rh/entrar?redirect=/portal');
        return;
      }
      setUser(sessionData.user);

      if (sessionData.user.mustChangePassword) {
        setIsChangingPass(true);
      }

      // 2. Fetch employee portal data, ponto hoje, ausências, and recibos
      const [portalRes, pontoRes, ausenciasRes, typesRes, recibosRes] = await Promise.all([
        fetch('/api/portal/dados'),
        fetch('/api/portal/ponto/hoje'),
        fetch('/api/portal/ausencias'),
        fetch('/api/rh/configuracao/tipos-licenca'),
        fetch('/api/portal/recibos'),
      ]);

      const [portalData, pontoData, ausenciasData, typesData, recibosData] = await Promise.all([
        portalRes.json().catch(() => ({})),
        pontoRes.json().catch(() => ({})),
        ausenciasRes.json().catch(() => ({})),
        typesRes.json().catch(() => ({})),
        recibosRes.json().catch(() => ({})),
      ]);

      if (portalRes.ok && portalData.success) {
        setEmployee(portalData.employee);
      } else if (portalRes.status === 401) {
        router.push('/rh/entrar?redirect=/portal');
      }

      if (pontoData.success) {
        setTodayPonto(pontoData);
      }

      if (ausenciasData.success) {
        setLeaveBalance(ausenciasData.balance || null);
        setLeaveRequests(ausenciasData.requests || []);
      }

      if (typesData.success) {
        setLeaveTypes(typesData.leaveTypes || []);
        if (typesData.leaveTypes?.length > 0 && !leaveForm.leaveTypeId) {
          setLeaveForm((prev) => ({ ...prev, leaveTypeId: typesData.leaveTypes[0].id }));
        }
      }

      if (recibosData.success) {
        setPayslips(recibosData.payslips || []);
      }
    } catch {
      toast.error('Erro de ligação ao carregar dados do portal.');
    } finally {
      setIsLoading(false);
    }
  }, [router, toast, leaveForm.leaveTypeId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/session', { method: 'DELETE' });
    } catch {
      // ignore
    }
    window.location.href = '/rh/entrar';
  };

  // Clock In/Out Action
  const handleClockAction = async (type: 'ENTRADA' | 'INICIO_PAUSA' | 'FIM_PAUSA' | 'SAIDA') => {
    if (isClocking) return;
    setIsClocking(true);

    // Get current position or use cached
    let latitude = lastCoords?.lat;
    let longitude = lastCoords?.lng;
    let accuracyMeters = lastCoords?.acc;

    if (navigator.geolocation) {
      try {
        const pos: GeolocationPosition = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
          });
        });
        latitude = pos.coords.latitude;
        longitude = pos.coords.longitude;
        accuracyMeters = pos.coords.accuracy;
      } catch {
        // Continue with cached or null
      }
    }

    try {
      const clientRequestId = `clk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const res = await fetch('/api/portal/ponto/marcar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          latitude,
          longitude,
          accuracyMeters,
          clientRequestId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(
          type === 'ENTRADA'
            ? 'Entrada registada com sucesso!'
            : type === 'INICIO_PAUSA'
            ? 'Início de pausa registado.'
            : type === 'FIM_PAUSA'
            ? 'Pausa terminada. Bom trabalho!'
            : 'Saída registada. Até amanhã!'
        );
        loadData();
      } else {
        toast.error(data.error || 'Erro ao registar ponto.');
      }
    } catch {
      toast.error('Erro de ligação ao registar ponto.');
    } finally {
      setIsClocking(false);
    }
  };

  // Load Monthly Timesheet
  const loadTimesheet = useCallback(async (period: string) => {
    setIsLoadingTimesheet(true);
    try {
      const res = await fetch(`/api/portal/folha-ponto?periodo=${period}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setTimesheetData(data.timesheet);
      } else {
        setTimesheetData(null);
      }
    } catch {
      toast.error('Erro de ligação ao carregar folha de ponto.');
      setTimesheetData(null);
    } finally {
      setIsLoadingTimesheet(false);
    }
  }, [toast]);

  useEffect(() => {
    if (activeTab === 'folha') {
      loadTimesheet(selectedPeriod);
    }
  }, [activeTab, selectedPeriod, loadTimesheet]);

  const handleSubmitTimesheet = async () => {
    if (!timesheetData?.id) return;
    setIsSubmittingTimesheet(true);
    try {
      const res = await fetch('/api/portal/folha-ponto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timesheetId: timesheetData.id }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Folha de ponto submetida com sucesso ao RH!');
        setIsSubmitModalOpen(false);
        loadTimesheet(selectedPeriod);
      } else {
        toast.error(data.error || 'Erro ao submeter folha de ponto.');
      }
    } catch {
      toast.error('Erro de ligação ao submeter folha.');
    } finally {
      setIsSubmittingTimesheet(false);
    }
  };

  // View Payslip Detail
  const handleViewPayslip = async (payslipId: string) => {
    setIsLoadingPayslip(true);
    try {
      const res = await fetch(`/api/portal/recibos/${payslipId}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setSelectedPayslip(data.payslip);
        setIsPayslipModalOpen(true);
      } else {
        toast.error(data.error || 'Erro ao carregar recibo de vencimento.');
      }
    } catch {
      toast.error('Erro de ligação ao carregar recibo.');
    } finally {
      setIsLoadingPayslip(false);
    }
  };

  // Submit Correction Request
  const handleCorrectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctionForm.reason.trim()) {
      toast.error('O motivo é obrigatório para pedir correcção.');
      return;
    }

    setIsClocking(true);
    try {
      const requestedTime = new Date(`${correctionForm.date}T${correctionForm.time}:00`).toISOString();
      const res = await fetch('/api/portal/ponto/corrigir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetEntryType: correctionForm.targetEntryType,
          date: correctionForm.date,
          requestedTime,
          reason: correctionForm.reason.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Pedido de correcção submetido aos Recursos Humanos.');
        setIsCorrectionModalOpen(false);
        setCorrectionForm({
          targetEntryType: 'ENTRADA',
          date: new Date().toISOString().split('T')[0],
          time: '08:00',
          reason: '',
        });
        loadData();
      } else {
        toast.error(data.error || 'Erro ao submeter pedido.');
      }
    } catch {
      toast.error('Erro de ligação ao submeter pedido.');
    } finally {
      setIsClocking(false);
    }
  };

  // Submit Leave Request
  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveForm.leaveTypeId || !leaveForm.startDate || !leaveForm.endDate) {
      toast.error('Preencha as datas e o tipo de licença.');
      return;
    }

    setIsSubmittingLeave(true);
    try {
      const res = await fetch('/api/portal/ausencias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leaveTypeId: leaveForm.leaveTypeId,
          startDate: leaveForm.startDate,
          endDate: leaveForm.endDate,
          reason: leaveForm.reason.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Pedido de ausência submetido (${data.workingDaysCount} dias úteis).`);
        setIsLeaveModalOpen(false);
        setLeaveForm({
          leaveTypeId: leaveTypes[0]?.id || '',
          startDate: '',
          endDate: '',
          reason: '',
        });
        loadData();
      } else {
        toast.error(data.error || 'Erro ao solicitar ausência.');
      }
    } catch {
      toast.error('Erro de ligação ao solicitar ausência.');
    } finally {
      setIsSubmittingLeave(false);
    }
  };

  // Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);

    if (newPass.length < 8) {
      setPassError('A nova palavra-passe deve ter pelo menos 8 caracteres.');
      return;
    }
    if (newPass !== confirmPass) {
      setPassError('A confirmação da palavra-passe não coincide.');
      return;
    }

    setIsSubmittingPass(true);
    try {
      const res = await fetch('/api/auth/session', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: currentPass, newPassword: newPass }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        toast.success('Palavra-passe alterada com sucesso!');
        setIsChangingPass(false);
        setCurrentPass('');
        setNewPass('');
        setConfirmPass('');
        if (user) {
          setUser({ ...user, mustChangePassword: false });
        }
      } else {
        setPassError(data.error || 'Erro ao alterar a palavra-passe.');
      }
    } catch {
      setPassError('Erro de ligação ao actualizar palavra-passe.');
    } finally {
      setIsSubmittingPass(false);
    }
  };

  const navItems = [
    { id: 'ponto', label: 'Ponto', icon: <Clock className="w-5 h-5" /> },
    { id: 'folha', label: 'Folha', icon: <ClipboardList className="w-5 h-5" /> },
    { id: 'recibos', label: 'Recibos', icon: <FileText className="w-5 h-5" /> },
    { id: 'ausencias', label: 'Ausências', icon: <CalendarDays className="w-5 h-5" /> },
    { id: 'perfil', label: 'Meu Perfil', icon: <User className="w-5 h-5" /> },
    { id: 'documentos', label: 'Documentos', icon: <FileText className="w-5 h-5" /> },
    { id: 'contrato', label: 'Carreira', icon: <Briefcase className="w-5 h-5" /> },
    { id: 'seguranca', label: 'Segurança', icon: <Lock className="w-5 h-5" /> },
  ];

  const profileName = employee?.fullName || user?.name || 'Utilizador ARKNET';
  const profileRole = user?.role?.toUpperCase();
  const profileRoleLabel = profileRole === 'ADMINISTRADOR' || profileRole === 'ADMIN'
    ? 'Administrador de Recursos Humanos'
    : profileRole === 'TECNICO_RH'
      ? 'Técnico de Recursos Humanos'
      : profileRole === 'FUNCIONARIO'
        ? 'Colaborador'
        : user?.role || 'Conta ARKNET';
  const profileInitials = profileName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part: string) => part[0])
    .join('')
    .toUpperCase();

  // Helper calculation for today's state
  const entries = todayPonto?.entries || [];
  const workDay = todayPonto?.workDay || null;
  const hasCheckedIn = entries.some((e: any) => e.type === 'ENTRADA');
  const hasCheckedOut = entries.some((e: any) => e.type === 'SAIDA');
  const lastEntry = entries[entries.length - 1];
  const isOnBreak = lastEntry?.type === 'INICIO_PAUSA';

  // QR code hash for employee verification
  const qrVerificationHash = employee
    ? btoa(`ARKNET:${employee.employeeNumber}:${employee.id?.slice(0, 8)}:${new Date().toISOString().slice(0, 10)}`)
    : '';

  return (
    <div className={`min-h-dvh flex flex-col bg-[var(--hr-bg)] ${sunlightMode ? 'hr-sunlight-mode' : ''}`}>
      {/* Top App Bar */}
      <HrAppBar
        title="Portal do Colaborador"
        showLogo
        logoHref="/portal"
        userName={employee?.fullName || user?.name || user?.email?.split('@')[0]}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
        {/* First Access Warning Banner */}
        {user?.mustChangePassword && (
          <div className="mb-5 p-4 bg-[var(--hr-status-warning-bg)] border border-[var(--hr-border)] border-l-4 border-l-[var(--hr-status-warning)] rounded-[var(--hr-radius)] flex items-start justify-between gap-3 shadow-[var(--hr-shadow-sm)]">
            <div className="flex items-start gap-2.5">
              <KeyRound className="w-5 h-5 text-[var(--hr-status-warning)] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-[var(--hr-text)] uppercase tracking-wide">
                  Primeiro Acesso Detectado
                </h4>
                <p className="text-xs text-[var(--hr-text)] mt-0.5 leading-relaxed">
                  Para sua segurança, é obrigatório alterar a palavra-passe provisória atribuída pelos Recursos Humanos da J.Matos.
                </p>
              </div>
            </div>
            <HrButton variant="primary" size="sm" onClick={() => setIsChangingPass(true)}>
              Alterar Agora
            </HrButton>
          </div>
        )}

        {/* Desktop Tabs Header */}
        <div className="hidden md:block mb-6">
          <HrTabs tabs={navItems} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <HrSkeleton className="h-28 w-full" />
            <HrSkeleton className="h-60 w-full" />
          </div>
        ) : !employee ? (
          <div className="p-8 text-center bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] shadow-[var(--hr-shadow-sm)]">
            <Shield className="w-8 h-8 text-[var(--hr-text-muted)] mx-auto mb-2" />
            <h3 className="text-base font-bold text-[var(--hr-text)]">
              Ficha de Colaborador Não Vinculada
            </h3>
            <p className="text-xs text-[var(--hr-text-muted)] mt-1 max-w-md mx-auto">
              A sua conta de utilizador ainda não tem uma ficha cadastral de colaborador ligada no sistema de RH da J.Matos.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* ═══ CRACHÁ VIRTUAL ARKNET ═══ */}
            <div className="relative overflow-hidden rounded-[var(--hr-radius-lg)] shadow-[var(--hr-shadow-lg)] hr-circuit-texture" style={{ background: 'linear-gradient(135deg, #0868B0 0%, #003B73 100%)' }}>
              <div className="relative z-10 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* Left: Avatar + Info */}
                <div className="flex items-center gap-4 min-w-0">
                  {/* Avatar with gold rim */}
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center font-extrabold text-xl sm:text-2xl text-white" style={{ background: 'rgba(255,255,255,0.15)', border: '2.5px solid rgba(240,144,0,0.7)', boxShadow: '0 0 16px rgba(240,144,0,0.2)' }}>
                      {employee.fullName.charAt(0).toUpperCase()}
                    </div>
                    {/* Pulsating live LED */}
                    <div className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center">
                      <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 hr-led-pulse" style={{ border: '2px solid #003B73' }} />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-base sm:text-lg font-extrabold text-white truncate tracking-tight">
                      {employee.fullName}
                    </h2>
                    <p className="text-xs text-white/70 flex items-center gap-2 mt-0.5 truncate">
                      <span className="font-mono font-bold text-amber-300">{employee.employeeNumber}</span>
                      <span className="text-white/40">·</span>
                      <span>{employee.position?.title || 'Sem cargo'}</span>
                    </p>
                    <p className="text-[11px] text-white/50 mt-0.5 flex items-center gap-1.5">
                      <Building2 className="w-3 h-3" />
                      <span>{employee.department?.name || 'J.Matos Tecnologia'}</span>
                    </p>
                  </div>
                </div>

                {/* Right: Actions + Status */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Sunlight Mode Toggle */}
                  <button
                    type="button"
                    onClick={() => setSunlightMode(!sunlightMode)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all"
                    style={{
                      background: sunlightMode ? 'rgba(240,144,0,0.9)' : 'rgba(255,255,255,0.12)',
                      color: sunlightMode ? '#003B73' : 'rgba(255,255,255,0.8)',
                      border: sunlightMode ? '1px solid rgba(240,144,0,1)' : '1px solid rgba(255,255,255,0.2)',
                    }}
                    title="Modo Solar — Alto contraste para trabalho de campo ao ar livre"
                  >
                    <Sun className="w-3.5 h-3.5" />
                    {sunlightMode ? 'Solar ON' : 'Solar'}
                  </button>

                  {/* QR Badge Button */}
                  <button
                    type="button"
                    onClick={() => setIsQrModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all"
                    style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.2)' }}
                    title="Ver QR de validação do crachá digital"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    QR
                  </button>

                  {/* Status Badge */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold" style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)' }}>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 hr-led-pulse" />
                    {employee.status || 'Activo'}
                  </span>
                </div>
              </div>

              {/* Bottom glassmorphism bar */}
              <div className="relative z-10 px-5 sm:px-6 py-2.5 hr-glass" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="flex items-center justify-between text-[11px] text-white/60">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Fingerprint className="w-3 h-3 text-white/40" />
                      <span className="font-mono">{employee.biNumber || employee.employeeNumber}</span>
                    </span>
                    <span className="hidden sm:flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-white/40" />
                      <span>{employee.contractType || 'Sem Termo'}</span>
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-white/30">ARKNET ID</span>
                </div>
              </div>
            </div>

            {/* TAB: Ponto & Assiduidade */}
            {activeTab === 'ponto' && (
              <div className="space-y-5">
                {/* Live Clock Card */}
                <div className="bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] p-5 sm:p-6 shadow-[var(--hr-shadow-sm)] text-center relative overflow-hidden">
                  <div className="absolute top-3 left-4 flex items-center gap-1.5 text-[11px] text-[var(--hr-text-muted)] font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[var(--hr-primary)]" />
                    <span>{gpsStatus}</span>
                  </div>

                  <div className="pt-4 pb-2">
                    <div className="text-4xl sm:text-5xl font-mono font-extrabold tracking-tight text-[var(--hr-text)]">
                      {currentTime
                        ? currentTime.toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                        : '--:--:--'}
                    </div>
                    <p className="text-xs text-[var(--hr-text-muted)] mt-1.5 capitalize">
                      {currentTime
                        ? currentTime.toLocaleDateString('pt-AO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
                        : '—'}
                    </p>
                  </div>

                  {/* Primary Touch Punch Buttons */}
                  <div className="mt-4 max-w-sm mx-auto flex flex-col sm:flex-row gap-3">
                    {!hasCheckedIn ? (
                      <button
                        type="button"
                        onClick={() => handleClockAction('ENTRADA')}
                        disabled={isClocking}
                        className="w-full py-3.5 px-6 rounded-[var(--hr-radius)] bg-[var(--hr-status-success)] text-white font-bold text-sm tracking-wide shadow-md hover:opacity-95 active:scale-[0.98] transition flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        <span>REGISTAR ENTRADA</span>
                      </button>
                    ) : !hasCheckedOut ? (
                      <>
                        {!isOnBreak ? (
                          <button
                            type="button"
                            onClick={() => handleClockAction('INICIO_PAUSA')}
                            disabled={isClocking}
                            className="flex-1 py-3 px-4 rounded-[var(--hr-radius)] bg-[var(--hr-accent)] text-white font-bold text-xs tracking-wide shadow hover:opacity-95 active:scale-[0.98] transition flex items-center justify-center gap-2"
                          >
                            <Coffee className="w-4 h-4" />
                            <span>INICIAR PAUSA</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleClockAction('FIM_PAUSA')}
                            disabled={isClocking}
                            className="flex-1 py-3 px-4 rounded-[var(--hr-radius)] bg-[var(--hr-status-success)] text-white font-bold text-xs tracking-wide shadow hover:opacity-95 active:scale-[0.98] transition flex items-center justify-center gap-2"
                          >
                            <Check className="w-4 h-4" />
                            <span>RETOMAR TRABALHO</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleClockAction('SAIDA')}
                          disabled={isClocking}
                          className="flex-1 py-3 px-4 rounded-[var(--hr-radius)] bg-[var(--hr-primary)] text-white font-bold text-xs tracking-wide shadow hover:opacity-95 active:scale-[0.98] transition flex items-center justify-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>REGISTAR SAÍDA</span>
                        </button>
                      </>
                    ) : (
                      <div className="w-full py-3 px-4 rounded-[var(--hr-radius)] bg-[var(--hr-surface-muted)] text-[var(--hr-status-success)] font-semibold text-xs flex items-center justify-center gap-2 border border-[var(--hr-border)]">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Dia de trabalho concluído com sucesso.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Day Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)]">
                    <span className="text-[11px] text-[var(--hr-text-muted)] font-medium">Trabalhado Hoje</span>
                    <div className="text-lg font-bold text-[var(--hr-text)] mt-1">
                      {workDay
                        ? `${Math.floor((workDay.totalMinutesWorked || 0) / 60)}h ${(workDay.totalMinutesWorked || 0) % 60}m`
                        : '0h 0m'}
                    </div>
                  </div>

                  <div className="p-3 bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)]">
                    <span className="text-[11px] text-[var(--hr-text-muted)] font-medium">Horário Previsto</span>
                    <div className="text-lg font-bold text-[var(--hr-text)] mt-1">
                      {employee.contracts?.[0]?.dailyHours ? `${employee.contracts[0].dailyHours}h` : '8h'}
                    </div>
                  </div>

                  <div className="p-3 bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)]">
                    <span className="text-[11px] text-[var(--hr-text-muted)] font-medium">Atraso de Entrada</span>
                    <div className="text-lg font-bold mt-1">
                      {(workDay?.delayMinutes || 0) > 0 ? (
                        <span className="text-[var(--hr-status-danger)]">+{workDay.delayMinutes} min</span>
                      ) : (
                        <span className="text-[var(--hr-status-success)]">Pontual</span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)]">
                    <span className="text-[11px] text-[var(--hr-text-muted)] font-medium">Horas Extras</span>
                    <div className="text-lg font-bold text-[var(--hr-primary)] mt-1">
                      {(workDay?.overtimeMinutes || 0) > 0 ? `+${workDay.overtimeMinutes} min` : '0 min'}
                    </div>
                  </div>
                </div>

                {/* Today's Log & Correction Request */}
                <div className="bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] p-4 sm:p-5 shadow-[var(--hr-shadow-sm)] space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[var(--hr-border-subtle)]">
                    <h3 className="text-xs font-bold text-[var(--hr-text)] uppercase tracking-wider">
                      Picagens Realizadas Hoje
                    </h3>
                    <HrButton
                      size="sm"
                      variant="outline"
                      onClick={() => setIsCorrectionModalOpen(true)}
                    >
                      Pedir Correcção de Ponto
                    </HrButton>
                  </div>

                  {entries.length === 0 ? (
                    <p className="text-xs text-[var(--hr-text-muted)] text-center py-4">
                      Ainda não efetuou nenhuma picagem no dia de hoje.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {entries.map((entry: any) => (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between p-2.5 bg-[var(--hr-bg)] border border-[var(--hr-border)] rounded-[var(--hr-radius-sm)] text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <HrBadge
                              variant={
                                entry.type === 'ENTRADA'
                                  ? 'success'
                                  : entry.type === 'SAIDA'
                                  ? 'info'
                                  : 'warning'
                              }
                            >
                              {entry.type}
                            </HrBadge>
                            <span className="font-mono font-bold text-[var(--hr-text)]">
                              {new Date(entry.serverTime).toLocaleTimeString('pt-AO', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              })}
                            </span>
                          </div>
                          <div className="text-[11px] text-[var(--hr-text-muted)] flex items-center gap-1">
                            {entry.location?.name ? (
                              <span>{entry.location.name}</span>
                            ) : entry.isWithinRadius ? (
                              <span className="text-[var(--hr-status-success)]">Local Válido</span>
                            ) : (
                              <span>Registo Móvel</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: Folha de Ponto Mensal */}
            {activeTab === 'folha' && (
              <div className="space-y-5">
                {/* Top Control Bar */}
                <div className="bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] p-4 sm:p-5 shadow-[var(--hr-shadow-sm)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <span className="text-[11px] text-[var(--hr-text-muted)] font-medium block">
                        Mês de Referência
                      </span>
                      <input
                        type="month"
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="mt-0.5 px-3 py-1.5 text-xs font-bold bg-[var(--hr-bg)] border border-[var(--hr-border)] rounded-[var(--hr-radius-sm)] text-[var(--hr-text)] focus:outline-none focus:border-[var(--hr-primary)]"
                      />
                    </div>
                    {timesheetData && (
                      <div className="mt-4 sm:mt-0 sm:ml-2">
                        <HrBadge
                          variant={
                            timesheetData.status === 'APROVADA'
                              ? 'success'
                              : timesheetData.status === 'SUBMETIDA'
                              ? 'warning'
                              : timesheetData.status === 'BLOQUEADA'
                              ? 'neutral'
                              : 'info'
                          }
                          size="md"
                        >
                          {timesheetData.status === 'APROVADA'
                            ? 'Aprovada pelo RH'
                            : timesheetData.status === 'SUBMETIDA'
                            ? 'Submetida (Aguarda RH)'
                            : timesheetData.status === 'BLOQUEADA'
                            ? 'Fechada e Bloqueada'
                            : 'Aberta / Em Curso'}
                        </HrBadge>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <HrButton
                      type="button"
                      variant="outline"
                      size="sm"
                      leftIcon={<Printer className="w-4 h-4" />}
                      onClick={() => window.print()}
                    >
                      Imprimir / PDF
                    </HrButton>

                    {timesheetData && timesheetData.status === 'ABERTA' && (
                      <HrButton
                        type="button"
                        variant="primary"
                        size="sm"
                        leftIcon={<Send className="w-4 h-4" />}
                        onClick={() => setIsSubmitModalOpen(true)}
                      >
                        Submeter Folha ao RH
                      </HrButton>
                    )}
                  </div>
                </div>

                {isLoadingTimesheet ? (
                  <div className="space-y-4">
                    <HrSkeleton className="h-24 w-full" />
                    <HrSkeleton className="h-60 w-full" />
                  </div>
                ) : !timesheetData ? (
                  <div className="p-8 text-center bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] shadow-[var(--hr-shadow-sm)]">
                    <ClipboardList className="w-8 h-8 text-[var(--hr-text-muted)] mx-auto mb-2" />
                    <h3 className="text-base font-bold text-[var(--hr-text)]">
                      Sem Folha Gerada para {selectedPeriod}
                    </h3>
                    <p className="text-xs text-[var(--hr-text-muted)] mt-1 max-w-md mx-auto">
                      O departamento de Recursos Humanos ainda não gerou as folhas de ponto para este período mensal.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Status Info Notice */}
                    {timesheetData.status === 'ABERTA' && (
                      <div className="p-3 bg-[var(--hr-primary-soft)] border border-[var(--hr-primary)]/20 rounded-[var(--hr-radius-sm)] flex items-start gap-2 text-xs text-[var(--hr-text)]">
                        <AlertCircle className="w-4 h-4 text-[var(--hr-primary)] flex-shrink-0 mt-0.5" />
                        <div>
                          <strong>Folha em Aberto:</strong> Verifique as suas marcações diárias. Se detectar alguma omissão, utilize a opção de pedir correcção no separador de Ponto antes de submeter ao RH.
                        </div>
                      </div>
                    )}
                    {timesheetData.status === 'SUBMETIDA' && (
                      <div className="p-3 bg-[var(--hr-status-warning-bg)] border border-[var(--hr-status-warning)]/30 rounded-[var(--hr-radius-sm)] flex items-start gap-2 text-xs text-[var(--hr-text)]">
                        <CheckCircle2 className="w-4 h-4 text-[var(--hr-status-warning)] flex-shrink-0 mt-0.5" />
                        <div>
                          <strong>Folha Submetida:</strong> A sua folha foi entregue aos Recursos Humanos e aguarda validação final para fecho mensal e processamento de salários.
                        </div>
                      </div>
                    )}
                    {timesheetData.status === 'APROVADA' && (
                      <div className="p-3 bg-[var(--hr-status-success-bg)] border border-[var(--hr-status-success)]/30 rounded-[var(--hr-radius-sm)] flex items-start gap-2 text-xs text-[var(--hr-text)]">
                        <CheckCircle2 className="w-4 h-4 text-[var(--hr-status-success)] flex-shrink-0 mt-0.5" />
                        <div>
                          <strong>Folha Aprovada:</strong> A sua folha foi conferida e aprovada pelo RH. Os totais apurados estão validados para o cálculo salarial.
                        </div>
                      </div>
                    )}

                    {/* KPI Statistics */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      <div className="p-3 bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)]">
                        <span className="text-[11px] text-[var(--hr-text-muted)] block">Dias Trabalhados</span>
                        <div className="text-lg font-bold text-[var(--hr-text)] mt-1">
                          {timesheetData.workedDays}{' '}
                          <span className="text-xs font-normal text-[var(--hr-text-muted)]">
                            / {timesheetData.expectedWorkDays} previstos
                          </span>
                        </div>
                      </div>

                      <div className="p-3 bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)]">
                        <span className="text-[11px] text-[var(--hr-text-muted)] block">Tempo Trabalhado</span>
                        <div className="text-lg font-bold text-[var(--hr-text)] mt-1">
                          {Math.floor(timesheetData.totalMinutesWorked / 60)}h{' '}
                          {String(timesheetData.totalMinutesWorked % 60).padStart(2, '0')}m
                        </div>
                      </div>

                      <div className="p-3 bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)]">
                        <span className="text-[11px] text-[var(--hr-text-muted)] block">Atrasos</span>
                        <div className={`text-lg font-bold mt-1 ${timesheetData.delayMinutes > 0 ? 'text-[var(--hr-status-warning)]' : 'text-[var(--hr-text)]'}`}>
                          {timesheetData.delayCount}×{' '}
                          <span className="text-xs font-normal">
                            ({Math.floor(timesheetData.delayMinutes / 60)}h {String(timesheetData.delayMinutes % 60).padStart(2, '0')}m)
                          </span>
                        </div>
                      </div>

                      <div className="p-3 bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)]">
                        <span className="text-[11px] text-[var(--hr-text-muted)] block">Faltas</span>
                        <div className={`text-lg font-bold mt-1 ${timesheetData.unjustifiedAbsenceDays > 0 ? 'text-[var(--hr-status-error)]' : 'text-[var(--hr-text)]'}`}>
                          {timesheetData.unjustifiedAbsenceDays}{' '}
                          <span className="text-xs font-normal text-[var(--hr-text-muted)]">
                            injust. / {timesheetData.justifiedAbsenceDays} just.
                          </span>
                        </div>
                      </div>

                      <div className="p-3 bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)]">
                        <span className="text-[11px] text-[var(--hr-text-muted)] block">Horas Extra Aprov.</span>
                        <div className={`text-lg font-bold mt-1 ${timesheetData.approvedOvertimeMinutes > 0 ? 'text-[var(--hr-status-success)]' : 'text-[var(--hr-text)]'}`}>
                          {Math.floor(timesheetData.approvedOvertimeMinutes / 60)}h{' '}
                          {String(timesheetData.approvedOvertimeMinutes % 60).padStart(2, '0')}m
                        </div>
                      </div>
                    </div>

                    {/* Day-by-Day Details */}
                    <div className="bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] p-4 sm:p-5 shadow-[var(--hr-shadow-sm)]">
                      <h3 className="text-xs font-bold text-[var(--hr-text)] uppercase tracking-wider pb-3 mb-3 border-b border-[var(--hr-border-subtle)] flex items-center justify-between">
                        <span>Registo Diário Detalhado</span>
                        <span className="text-[11px] font-normal text-[var(--hr-text-muted)] lowercase">
                          {timesheetData.days?.length || 0} dias no período
                        </span>
                      </h3>

                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-[var(--hr-bg)] border-b border-[var(--hr-border)] text-left text-[var(--hr-text-muted)] font-semibold">
                              <th className="p-2.5">Data / Dia</th>
                              <th className="p-2.5">Horário Previsto</th>
                              <th className="p-2.5">Entrada / Saída</th>
                              <th className="p-2.5 text-right">Efectivo</th>
                              <th className="p-2.5 text-right">Atraso</th>
                              <th className="p-2.5 text-right">Extra</th>
                              <th className="p-2.5">Estado</th>
                              <th className="p-2.5">Observação</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--hr-border-subtle)]">
                            {timesheetData.days?.map((d: any) => {
                              const [y, m, day] = d.date.split('-');
                              const formattedDate = `${day}/${m}/${y}`;
                              const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
                              const weekName = weekDays[d.dayOfWeek] || '';

                              let statusBadge = (
                                <HrBadge variant="neutral" size="sm">
                                  {d.status}
                                </HrBadge>
                              );
                              if (d.status === 'PRESENTE') {
                                statusBadge = <HrBadge variant="success" size="sm">Presente</HrBadge>;
                              } else if (d.status === 'ATRASO') {
                                statusBadge = <HrBadge variant="warning" size="sm">Atraso</HrBadge>;
                              } else if (d.status === 'FALTA_INJUSTIFICADA') {
                                statusBadge = <HrBadge variant="error" size="sm">Falta Injust.</HrBadge>;
                              } else if (d.status === 'FALTA_JUSTIFICADA') {
                                statusBadge = <HrBadge variant="info" size="sm">Falta Just.</HrBadge>;
                              } else if (d.status === 'FERIAS') {
                                statusBadge = <HrBadge variant="info" size="sm">Férias</HrBadge>;
                              } else if (d.status === 'DOENCA') {
                                statusBadge = <HrBadge variant="warning" size="sm">Baixa Médica</HrBadge>;
                              } else if (d.status === 'LICENCA') {
                                statusBadge = <HrBadge variant="info" size="sm">Licença</HrBadge>;
                              } else if (d.status === 'FERIADO') {
                                statusBadge = <HrBadge variant="neutral" size="sm">Feriado</HrBadge>;
                              } else if (d.status === 'FOLGA') {
                                statusBadge = <HrBadge variant="neutral" size="sm">Folga</HrBadge>;
                              } else if (d.status === 'SAIDA_EM_FALTA') {
                                statusBadge = <HrBadge variant="error" size="sm">Sem Saída</HrBadge>;
                              }

                              return (
                                <tr
                                  key={d.id || d.date}
                                  className={`hover:bg-[var(--hr-bg)]/50 transition-colors ${
                                    !d.isWorkDay ? 'opacity-70 bg-[var(--hr-bg)]/30' : ''
                                  }`}
                                >
                                  <td className="p-2.5 font-medium whitespace-nowrap">
                                    <span className="font-mono">{formattedDate}</span>{' '}
                                    <span className="text-[var(--hr-text-muted)] text-[10px]">({weekName})</span>
                                  </td>
                                  <td className="p-2.5 font-mono text-[var(--hr-text-muted)] whitespace-nowrap">
                                    {d.scheduledIn && d.scheduledOut ? `${d.scheduledIn} - ${d.scheduledOut}` : '—'}
                                  </td>
                                  <td className="p-2.5 font-mono whitespace-nowrap">
                                    {d.actualIn ? (
                                      <span>
                                        {d.actualIn} <span className="text-[var(--hr-text-muted)]">até</span> {d.actualOut || <span className="text-[var(--hr-status-error)] font-bold">??</span>}
                                      </span>
                                    ) : (
                                      <span className="text-[var(--hr-text-muted)]">—</span>
                                    )}
                                  </td>
                                  <td className="p-2.5 text-right font-mono font-medium">
                                    {d.minutesWorked > 0 ? (
                                      `${Math.floor(d.minutesWorked / 60)}h ${String(d.minutesWorked % 60).padStart(2, '0')}m`
                                    ) : (
                                      <span className="text-[var(--hr-text-muted)]">—</span>
                                    )}
                                  </td>
                                  <td className="p-2.5 text-right font-mono">
                                    {d.delayMinutes > 0 ? (
                                      <span className="text-[var(--hr-status-warning)] font-bold">{d.delayMinutes}m</span>
                                    ) : (
                                      <span className="text-[var(--hr-text-muted)]">—</span>
                                    )}
                                  </td>
                                  <td className="p-2.5 text-right font-mono">
                                    {d.overtimeMinutes > 0 ? (
                                      <span className="text-[var(--hr-status-success)] font-medium">+{d.overtimeMinutes}m</span>
                                    ) : (
                                      <span className="text-[var(--hr-text-muted)]">—</span>
                                    )}
                                  </td>
                                  <td className="p-2.5 whitespace-nowrap">{statusBadge}</td>
                                  <td className="p-2.5 text-[var(--hr-text-muted)] truncate max-w-[160px]" title={d.justificationReason || d.absenceReason || d.holidayName || ''}>
                                    {d.justificationReason || d.absenceReason || d.holidayName || '—'}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* TAB: Recibos de Vencimento (Fase 4) */}
            {activeTab === 'recibos' && (
              <div className="space-y-5">
                <div className="bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] p-4 sm:p-5 shadow-[var(--hr-shadow-sm)]">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--hr-border-subtle)]">
                    <div>
                      <h3 className="text-xs font-bold text-[var(--hr-text)] uppercase tracking-wider">
                        Histórico de Recibos de Vencimento
                      </h3>
                      <p className="text-xs text-[var(--hr-text-muted)] mt-0.5">
                        Consulte e descarregue os seus recibos salariais mensais com detalhe de proventos e descontos legais.
                      </p>
                    </div>
                    <HrBadge variant="info" size="sm">
                      {payslips.length} Recibo(s)
                    </HrBadge>
                  </div>

                  {payslips.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[var(--hr-text-muted)]">
                      Nenhum recibo de vencimento emitido até ao momento.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-[var(--hr-border)] text-[var(--hr-text-muted)] font-semibold">
                            <th className="py-2.5 px-3">Período</th>
                            <th className="py-2.5 px-3">N.º Recibo</th>
                            <th className="py-2.5 px-3 text-right">Salário Ilíquido</th>
                            <th className="py-2.5 px-3 text-right">Descontos Legais</th>
                            <th className="py-2.5 px-3 text-right">Salário Líquido</th>
                            <th className="py-2.5 px-3">Estado</th>
                            <th className="py-2.5 px-3 text-right">Acção</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--hr-border)]">
                          {payslips.map((ps) => (
                            <tr key={ps.id} className="hover:bg-[var(--hr-hover)] transition">
                              <td className="py-3 px-3 font-semibold text-[var(--hr-text)]">
                                {ps.payrollPeriod?.code || '—'}
                              </td>
                              <td className="py-3 px-3 font-mono text-[var(--hr-text-muted)]">
                                {ps.payslipNumber}
                              </td>
                              <td className="py-3 px-3 text-right font-mono">
                                {Number(ps.grossSalary).toLocaleString('pt-AO')} Kz
                              </td>
                              <td className="py-3 px-3 text-right font-mono text-[var(--hr-status-error)]">
                                -{Number(ps.totalDeductions).toLocaleString('pt-AO')} Kz
                              </td>
                              <td className="py-3 px-3 text-right font-mono font-bold text-[var(--hr-status-success)]">
                                {Number(ps.netSalary).toLocaleString('pt-AO')} Kz
                              </td>
                              <td className="py-3 px-3">
                                <HrBadge
                                  variant={ps.status === 'PAGO' ? 'success' : 'info'}
                                  size="sm"
                                >
                                  {ps.status === 'PAGO' ? 'Liquidado' : ps.status}
                                </HrBadge>
                              </td>
                              <td className="py-3 px-3 text-right">
                                <HrButton
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewPayslip(ps.id)}
                                  isLoading={isLoadingPayslip && selectedPayslip?.id === ps.id}
                                >
                                  <FileText className="w-3.5 h-3.5 mr-1" />
                                  Ver Recibo
                                </HrButton>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: Ausências & Férias */}
            {activeTab === 'ausencias' && (
              <div className="space-y-5">
                {/* Leave Balance Banner */}
                <div className="bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] p-5 shadow-[var(--hr-shadow-sm)]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--hr-border-subtle)]">
                    <div>
                      <h3 className="text-sm font-bold text-[var(--hr-text)] flex items-center gap-2">
                        <Palmtree className="w-4 h-4 text-[var(--hr-primary)]" />
                        Direito e Saldos de Férias (2026)
                      </h3>
                      <p className="text-xs text-[var(--hr-text-muted)] mt-0.5">
                        Conforme a Lei Geral do Trabalho de Angola (Artigo 132.º — 22 dias úteis de férias).
                      </p>
                    </div>
                    <HrButton
                      size="sm"
                      variant="primary"
                      leftIcon={<Plus className="w-4 h-4" />}
                      onClick={() => setIsLeaveModalOpen(true)}
                    >
                      Solicitar Ausência / Férias
                    </HrButton>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                    <div className="p-3 bg-[var(--hr-bg)] border border-[var(--hr-border)] rounded-[var(--hr-radius-sm)]">
                      <span className="text-[11px] text-[var(--hr-text-muted)]">Direito Anual</span>
                      <div className="text-xl font-bold text-[var(--hr-text)] mt-1">
                        {leaveBalance?.entitledDays ?? 22} Dias
                      </div>
                    </div>

                    <div className="p-3 bg-[var(--hr-bg)] border border-[var(--hr-border)] rounded-[var(--hr-radius-sm)]">
                      <span className="text-[11px] text-[var(--hr-text-muted)]">Dias Gozados</span>
                      <div className="text-xl font-bold text-[var(--hr-status-warning)] mt-1">
                        {leaveBalance?.usedDays ?? 0} Dias
                      </div>
                    </div>

                    <div className="p-3 bg-[var(--hr-bg)] border border-[var(--hr-border)] rounded-[var(--hr-radius-sm)]">
                      <span className="text-[11px] text-[var(--hr-text-muted)]">Dias Pendentes</span>
                      <div className="text-xl font-bold text-[var(--hr-primary)] mt-1">
                        {leaveBalance?.pendingDays ?? 0} Dias
                      </div>
                    </div>

                    <div className="p-3 bg-[var(--hr-bg)] border border-[var(--hr-border)] rounded-[var(--hr-radius-sm)]">
                      <span className="text-[11px] text-[var(--hr-text-muted)]">Saldo Disponível</span>
                      <div className="text-xl font-bold text-[var(--hr-status-success)] mt-1">
                        {(leaveBalance?.entitledDays ?? 22) -
                          (leaveBalance?.usedDays ?? 0) -
                          (leaveBalance?.pendingDays ?? 0)}{' '}
                        Dias
                      </div>
                    </div>
                  </div>
                </div>

                {/* My Requests List */}
                <div className="bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] p-4 sm:p-5 shadow-[var(--hr-shadow-sm)]">
                  <h3 className="text-xs font-bold text-[var(--hr-text)] uppercase tracking-wider pb-3 mb-3 border-b border-[var(--hr-border-subtle)]">
                    Meus Pedidos de Ausência
                  </h3>

                  {leaveRequests.length === 0 ? (
                    <p className="text-xs text-[var(--hr-text-muted)] text-center py-6">
                      Ainda não submeteu nenhum pedido de ausência ou férias.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {leaveRequests.map((req) => (
                        <div
                          key={req.id}
                          className="p-3.5 bg-[var(--hr-bg)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[var(--hr-text)]">
                                {req.leaveType?.name || 'Ausência'}
                              </span>
                              <HrBadge
                                variant={
                                  req.status === 'APROVADO'
                                    ? 'success'
                                    : req.status === 'REJEITADO'
                                    ? 'error'
                                    : 'warning'
                                }
                              >
                                {req.status}
                              </HrBadge>
                            </div>
                            <p className="text-xs text-[var(--hr-text-muted)] mt-1">
                              {new Date(req.startDate).toLocaleDateString('pt-AO')} até{' '}
                              {new Date(req.endDate).toLocaleDateString('pt-AO')} (
                              {req.workingDaysCount} dias úteis)
                            </p>
                            {req.reason && (
                              <p className="text-[11px] text-[var(--hr-text-muted)] italic mt-0.5">
                                Motivo: {req.reason}
                              </p>
                            )}
                          </div>
                          <div className="text-[11px] text-[var(--hr-text-muted)] sm:text-right">
                            {req.reviewedByName && (
                              <div>Revisto por: {req.reviewedByName}</div>
                            )}
                            {req.reviewComment && (
                              <div className="text-[var(--hr-text)] font-medium">
                                Nota: {req.reviewComment}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: Perfil */}
            {activeTab === 'perfil' && (
              <div className="space-y-5 hr-animate-in">
                <section className="relative isolate overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-white shadow-[var(--hr-shadow-lg)]">
                  <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(8,104,176,0.55),transparent_58%)]" />
                  <div className="absolute -right-14 -top-20 -z-10 h-64 w-64 rounded-full border border-white/10" />
                  <div className="absolute -right-5 -top-11 -z-10 h-44 w-44 rounded-full border border-white/10" />
                  <div className="h-1 w-full bg-[var(--hr-brand-orange)]" />
                  <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
                    <div className="flex min-w-0 items-center gap-4 sm:gap-5">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-xl font-extrabold tracking-wide text-white shadow-inner sm:h-20 sm:w-20 sm:text-2xl">
                        {profileInitials}
                      </div>
                      <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-300/25 bg-sky-300/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-sky-100">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            {profileRoleLabel}
                          </span>
                          {employee?.status && (
                            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${
                              employee.status === 'ACTIVO'
                                ? 'border-emerald-300/25 bg-emerald-300/10 text-emerald-100'
                                : employee.status === 'DESLIGADO'
                                  ? 'border-rose-300/25 bg-rose-300/10 text-rose-100'
                                  : 'border-amber-300/25 bg-amber-300/10 text-amber-100'
                            }`}>
                              <span className="h-1.5 w-1.5 rounded-full bg-current" />
                              {employee.status === 'ACTIVO' ? 'Activo' : employee.status === 'DESLIGADO' ? 'Desligado' : employee.status}
                            </span>
                          )}
                        </div>
                        <h2 className="truncate text-xl font-extrabold tracking-tight sm:text-2xl">{profileName}</h2>
                        <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-slate-300">
                          <Mail className="h-3.5 w-3.5 shrink-0 text-sky-300" />
                          {employee?.email || user?.email || 'Sem e-mail associado'}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:justify-end">
                      {employee?.employeeNumber && (
                        <div className="min-w-32 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">N.º de pessoal</p>
                          <p className="mt-0.5 font-mono text-sm font-bold text-white">{employee.employeeNumber}</p>
                        </div>
                      )}
                      {employee?.department?.name && (
                        <div className="min-w-32 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Departamento</p>
                          <p className="mt-0.5 flex items-center gap-1.5 text-sm font-bold text-white">
                            <Building2 className="h-3.5 w-3.5 text-sky-300" />
                            <span className="truncate">{employee.department.name}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  {employee?.position?.title && (
                    <div className="flex items-center gap-2 border-t border-white/10 bg-black/10 px-5 py-3 text-sm text-slate-300 sm:px-7">
                      <Briefcase className="h-4 w-4 text-orange-300" />
                      <span className="font-semibold text-white">{employee.position.title}</span>
                      {employee.directSupervisor?.fullName && (
                        <span className="hidden text-slate-400 sm:inline">· Responsável: {employee.directSupervisor.fullName}</span>
                      )}
                    </div>
                  )}
                </section>

                {employee ? (
                  <>
                    <div className="grid gap-5 lg:grid-cols-2">
                      <section className="rounded-2xl border border-[var(--hr-border)] bg-[var(--hr-surface)] p-5 shadow-[var(--hr-shadow-sm)] sm:p-6">
                        <div className="mb-4 flex items-center gap-3 border-b border-[var(--hr-border-subtle)] pb-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--hr-primary-soft)] text-[var(--hr-primary)]">
                            <User className="h-4 w-4" />
                          </span>
                          <div>
                            <h3 className="text-sm font-extrabold text-[var(--hr-text)]">Dados pessoais</h3>
                            <p className="text-xs text-[var(--hr-text-light)]">Identificação e contactos</p>
                          </div>
                        </div>
                        <HrDataList
                          columns={2}
                          items={[
                            { label: 'Nome completo', value: employee.fullName },
                            { label: 'Bilhete de Identidade', value: employee.biNumber, masked: true, rawUnmaskedValue: employee.biNumber },
                            { label: 'Telefone', value: employee.phone || '—' },
                            { label: 'E-mail', value: employee.email || user?.email || '—' },
                            { label: 'Data de nascimento', value: employee.birthDate ? new Date(employee.birthDate).toLocaleDateString('pt-AO') : '—' },
                            { label: 'Género', value: employee.gender === 'M' ? 'Masculino' : employee.gender === 'F' ? 'Feminino' : '—' },
                            { label: 'Endereço', value: [employee.address, employee.city, employee.province].filter(Boolean).join(', ') || '—' },
                            { label: 'Nacionalidade', value: employee.nationality || 'Angolana' },
                          ]}
                        />
                      </section>

                      <section className="rounded-2xl border border-[var(--hr-border)] bg-[var(--hr-surface)] p-5 shadow-[var(--hr-shadow-sm)] sm:p-6">
                        <div className="mb-4 flex items-center gap-3 border-b border-[var(--hr-border-subtle)] pb-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                            <Briefcase className="h-4 w-4" />
                          </span>
                          <div>
                            <h3 className="text-sm font-extrabold text-[var(--hr-text)]">Vínculo profissional</h3>
                            <p className="text-xs text-[var(--hr-text-light)]">Enquadramento na organização</p>
                          </div>
                        </div>
                        <HrDataList
                          columns={2}
                          items={[
                            { label: 'Cargo', value: employee.position?.title || '—' },
                            { label: 'Departamento', value: employee.department?.name || '—' },
                            { label: 'Data de admissão', value: employee.admissionDate ? new Date(employee.admissionDate).toLocaleDateString('pt-AO') : '—' },
                            { label: 'Responsável directo', value: employee.directSupervisor?.fullName || '—' },
                            { label: 'Estado', value: employee.status || '—' },
                            { label: 'N.º de pessoal', value: employee.employeeNumber || '—' },
                          ]}
                        />
                      </section>
                    </div>

                    <section className="rounded-2xl border border-[var(--hr-border)] bg-[var(--hr-surface)] p-5 shadow-[var(--hr-shadow-sm)] sm:p-6">
                      <div className="mb-4 flex items-center gap-3 border-b border-[var(--hr-border-subtle)] pb-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                          <BadgeCheck className="h-4 w-4" />
                        </span>
                        <div>
                          <h3 className="text-sm font-extrabold text-[var(--hr-text)]">Dados bancários</h3>
                          <p className="text-xs text-[var(--hr-text-light)]">Informação confidencial da sua ficha</p>
                        </div>
                      </div>
                      <HrDataList
                        columns={2}
                        items={[
                          { label: 'Banco', value: employee.bankName || '—' },
                          { label: 'IBAN Angolano', value: employee.bankIban || '—', masked: !!employee.bankIban, rawUnmaskedValue: employee.bankIban },
                          { label: 'N.º da Conta', value: employee.bankAccountNumber || '—' },
                          {
                            label: 'Vencimento Base Mensal',
                            value: employee.baseSalary ? `${Number(employee.baseSalary).toLocaleString('pt-AO')} Kz` : 'Confidencial',
                            masked: !!employee.baseSalary,
                            rawUnmaskedValue: employee.baseSalary ? `${Number(employee.baseSalary).toLocaleString('pt-AO')} Kz` : undefined,
                          },
                        ]}
                      />
                    </section>
                  </>
                ) : (
                  <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <section className="overflow-hidden rounded-2xl border border-[var(--hr-border)] bg-[var(--hr-surface)] shadow-[var(--hr-shadow-sm)]">
                      <div className="flex items-center gap-3 border-b border-[var(--hr-border-subtle)] bg-[var(--hr-surface-muted)] px-5 py-4 sm:px-6">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--hr-primary-soft)] text-[var(--hr-primary)]">
                          <User className="h-5 w-5" />
                        </span>
                        <div>
                          <h3 className="font-extrabold text-[var(--hr-text)]">Dados da conta</h3>
                          <p className="text-xs text-[var(--hr-text-light)]">Identificação e acesso à plataforma</p>
                        </div>
                      </div>
                      <div className="p-5 sm:p-6">
                        <HrDataList
                          columns={2}
                          items={[
                            { label: 'Nome completo', value: user?.name || '—' },
                            { label: 'E-mail de acesso', value: user?.email || '—' },
                            { label: 'Perfil de acesso', value: profileRoleLabel },
                            {
                              label: 'Estado da conta',
                              value: user?.status === 'active' ? 'Activa' : user?.status || '—',
                            },
                            {
                              label: 'Conta criada em',
                              value: user?.createdAt
                                ? new Date(user.createdAt).toLocaleDateString('pt-AO', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric',
                                  })
                                : '—',
                            },
                            {
                              label: 'Último acesso',
                              value: user?.lastLogin
                                ? new Date(user.lastLogin).toLocaleString('pt-AO', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : 'Sem registo',
                            },
                          ]}
                        />
                      </div>
                    </section>

                    <aside className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-5 text-white shadow-[var(--hr-shadow-md)] sm:p-6">
                      <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full border border-white/10" />
                      <div className="absolute -right-2 -top-2 h-20 w-20 rounded-full border border-white/10" />
                      <div className="relative">
                        <div className="mb-5 flex items-center justify-between">
                          <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-sky-300/20 bg-sky-300/10 text-sky-200">
                            <ShieldCheck className="h-5 w-5" />
                          </span>
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                            user?.status === 'active'
                              ? 'bg-emerald-300/10 text-emerald-200'
                              : 'bg-amber-300/10 text-amber-200'
                          }`}>
                            {user?.status === 'active' ? 'Acesso activo' : 'Estado da conta'}
                          </span>
                        </div>
                        <h3 className="text-lg font-extrabold">Segurança da conta</h3>
                        <p className="mt-2 text-sm leading-relaxed text-slate-300">
                          Mantenha as suas credenciais actualizadas para proteger o acesso à área de Recursos Humanos.
                        </p>
                        {user?.mustChangePassword && (
                          <p className="mt-4 rounded-lg border border-amber-300/20 bg-amber-300/10 p-3 text-xs font-medium leading-relaxed text-amber-100">
                            A sua palavra-passe provisória ainda precisa de ser alterada.
                          </p>
                        )}
                        <HrButton
                          variant="primary"
                          size="md"
                          className="mt-5 w-full"
                          leftIcon={<KeyRound className="h-4 w-4" />}
                          onClick={() => setIsChangingPass(true)}
                        >
                          Alterar palavra-passe
                        </HrButton>
                      </div>
                    </aside>
                  </div>
                )}
              </div>
            )}

            {/* TAB: Documentos */}
            {activeTab === 'documentos' && (
              <div className="bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] p-4 sm:p-5 shadow-[var(--hr-shadow-sm)]">
                <div className="pb-3 mb-3 border-b border-[var(--hr-border-subtle)]">
                  <h3 className="text-sm font-bold text-[var(--hr-text)]">
                    Meus Documentos Oficiais
                  </h3>
                  <p className="text-xs text-[var(--hr-text-muted)] mt-0.5">
                    Ficheiros e certidões arquivados no seu processo de colaborador
                  </p>
                </div>

                <div className="hidden sm:block">
                  <HrTable<any>
                    columns={[
                      {
                        key: 'title',
                        header: 'Documento',
                        render: (r: any) => (
                          <div>
                            <div className="font-bold text-[var(--hr-text)]">{r.title}</div>
                            <div className="text-xs text-[var(--hr-text-muted)] font-mono">{r.type} · {(r.fileSize / 1024).toFixed(0)} KB</div>
                          </div>
                        ),
                      },
                      {
                        key: 'expiresAt',
                        header: 'Validade',
                        render: (r: any) => (
                          r.expiresAt ? (
                            <span className="text-xs tabular-nums text-[var(--hr-text)]">
                              {new Date(r.expiresAt).toLocaleDateString('pt-AO')}
                            </span>
                          ) : (
                            <span className="text-xs text-[var(--hr-text-muted)]">Vitalício / S/ Prazo</span>
                          )
                        ),
                      },
                      {
                        key: 'download',
                        header: 'Acção',
                        align: 'right',
                        render: (r: any) => (
                          <a
                            href={`/api/rh/documentos/${r.id}/download`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[var(--hr-primary)] hover:bg-[var(--hr-primary-soft)] rounded transition"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </a>
                        ),
                      },
                    ]}
                    data={employee.documents || []}
                    keyExtractor={(r: any) => r.id}
                    emptyMessage="Nenhum documento disponível no seu arquivo."
                  />
                </div>

                <div className="sm:hidden">
                  <HrCardList<any>
                    items={employee.documents || []}
                    emptyMessage="Nenhum documento disponível."
                    renderItem={(r: any) => ({
                      item: r,
                      key: r.id,
                      title: r.title,
                      subtitle: `${r.type} · ${(r.fileSize / 1024).toFixed(0)} KB`,
                      actions: (
                        <a
                          href={`/api/rh/documentos/${r.id}/download`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[var(--hr-primary)] border border-[var(--hr-border)] rounded hover:bg-[var(--hr-surface-muted)]"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Descarregar</span>
                        </a>
                      ),
                    })}
                  />
                </div>
              </div>
            )}

            {/* TAB: Carreira & Contratos */}
            {activeTab === 'contrato' && (
              <div className="space-y-5">
                <div className="bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] p-4 sm:p-5 shadow-[var(--hr-shadow-sm)]">
                  <h3 className="text-xs font-bold text-[var(--hr-text)] uppercase tracking-wider pb-2 mb-3 border-b border-[var(--hr-border-subtle)]">
                    Vínculo Contratual Actual
                  </h3>
                  <HrTable<any>
                    columns={[
                      { key: 'type', header: 'Modalidade' },
                      {
                        key: 'startDate',
                        header: 'Data de Início',
                        render: (r: any) => new Date(r.startDate).toLocaleDateString('pt-AO'),
                      },
                      {
                        key: 'endDate',
                        header: 'Data de Fim',
                        render: (r: any) => (r.endDate ? new Date(r.endDate).toLocaleDateString('pt-AO') : 'Sem termo certo'),
                      },
                      {
                        key: 'status',
                        header: 'Estado',
                        align: 'center',
                        render: (r: any) => <HrBadge variant="success" size="sm">{r.status}</HrBadge>,
                      },
                    ]}
                    data={employee.contracts || []}
                    keyExtractor={(r: any) => r.id}
                    emptyMessage="Nenhum contrato registado."
                  />
                </div>

                <div className="bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] p-4 sm:p-5 shadow-[var(--hr-shadow-sm)]">
                  <h3 className="text-xs font-bold text-[var(--hr-text)] uppercase tracking-wider pb-2 mb-3 border-b border-[var(--hr-border-subtle)]">
                    Histórico de Funções na J.Matos
                  </h3>
                  <HrTable<any>
                    columns={[
                      { key: 'position', header: 'Cargo', render: (r: any) => r.position?.title || 'Cargo inicial' },
                      { key: 'department', header: 'Departamento', render: (r: any) => r.department?.name || '—' },
                      {
                        key: 'startDate',
                        header: 'Período',
                        render: (r: any) => `${new Date(r.startDate).toLocaleDateString('pt-AO')} — ${r.endDate ? new Date(r.endDate).toLocaleDateString('pt-AO') : 'Presente'}`,
                      },
                    ]}
                    data={employee.careerHistory || []}
                    keyExtractor={(r: any) => r.id}
                    emptyMessage="Sem histórico de progressão anterior."
                  />
                </div>
              </div>
            )}

            {/* TAB: Segurança */}
            {activeTab === 'seguranca' && (
              <div className="bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] p-4 sm:p-5 shadow-[var(--hr-shadow-sm)] max-w-lg">
                <h3 className="text-sm font-bold text-[var(--hr-text)] mb-1">
                  Segurança da Conta
                </h3>
                <p className="text-xs text-[var(--hr-text-muted)] mb-4">
                  Actualize a sua palavra-passe de acesso ao Portal do Colaborador.
                </p>

                <form onSubmit={handleChangePassword} className="space-y-4">
                  {passError && (
                    <div className="p-3 bg-[var(--hr-status-error-bg)] border border-[var(--hr-status-error)] rounded-[var(--hr-radius-sm)] text-xs text-[var(--hr-status-error)] font-medium">
                      {passError}
                    </div>
                  )}

                  <HrField label="Palavra-passe Actual" required>
                    <HrInput
                      type="password"
                      required
                      value={currentPass}
                      onChange={(e) => setCurrentPass(e.target.value)}
                      placeholder="Senha em uso"
                    />
                  </HrField>

                  <HrField label="Nova Palavra-passe" required hint="Mínimo 8 caracteres">
                    <HrInput
                      type="password"
                      required
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      placeholder="••••••••••••"
                    />
                  </HrField>

                  <HrField label="Confirmar Nova Palavra-passe" required>
                    <HrInput
                      type="password"
                      required
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      placeholder="••••••••••••"
                    />
                  </HrField>

                  <div className="pt-2 flex justify-end">
                    <HrButton type="submit" variant="primary" size="sm" isLoading={isSubmittingPass}>
                      Guardar Alterações
                    </HrButton>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <HrBottomNav
        items={navItems}
        activeId={activeTab}
        onChange={setActiveTab}
      />

      {/* Modal: Submeter Folha de Ponto ao RH */}
      <HrDialog
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Submeter Folha de Ponto ao RH"
        description="Confirme o envio da sua folha de ponto para validação e aprovação pelos Recursos Humanos."
        maxWidth="sm"
      >
        <div className="space-y-4 pt-2 text-xs text-[var(--hr-text)]">
          <p>
            Ao submeter a folha referente ao período <strong>{selectedPeriod}</strong>, confirma a exactidão dos registos diários de assiduidade apurados pelo sistema.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-[var(--hr-text-muted)]">
            <li>As horas de entrada, saída e pausas conferem com os dias trabalhados.</li>
            <li>Eventuais justificações de ausência ou correcções pendentes foram solicitadas.</li>
            <li>Após submissão, a folha ficará sob validação dos Recursos Humanos da J.Matos.</li>
          </ul>
          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--hr-border)]">
            <HrButton
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsSubmitModalOpen(false)}
              disabled={isSubmittingTimesheet}
            >
              Cancelar
            </HrButton>
            <HrButton
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSubmitTimesheet}
              isLoading={isSubmittingTimesheet}
            >
              Confirmar e Submeter
            </HrButton>
          </div>
        </div>
      </HrDialog>

      {/* Modal: Solicitar Ausência / Férias */}
      <HrDialog
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title="Solicitar Ausência / Férias"
        description="Submeta o seu pedido com antecedência. Férias e dispensas serão calculadas em dias úteis."
      >
        <form onSubmit={handleLeaveSubmit} className="space-y-4 pt-2">
          <HrField label="Tipo de Ausência" required>
            <HrSelect
              value={leaveForm.leaveTypeId}
              onChange={(e) => setLeaveForm({ ...leaveForm, leaveTypeId: e.target.value })}
              options={leaveTypes.map((t) => ({
                value: t.id,
                label: `${t.name} ${t.deductsFromBalance ? '(Deduz Saldo de Férias)' : ''}`,
              }))}
            />
          </HrField>

          <div className="grid grid-cols-2 gap-3">
            <HrField label="Data de Início" required>
              <HrInput
                type="date"
                value={leaveForm.startDate}
                onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
              />
            </HrField>

            <HrField label="Data de Fim" required>
              <HrInput
                type="date"
                value={leaveForm.endDate}
                onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
              />
            </HrField>
          </div>

          <HrField label="Justificação / Motivo" required>
            <textarea
              value={leaveForm.reason}
              onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
              rows={3}
              placeholder="Descreva a razão do pedido de ausência..."
              className="w-full px-3 py-2 text-xs bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] text-[var(--hr-text)] focus:outline-none focus:border-[var(--hr-primary)]"
            />
          </HrField>

          <div className="flex justify-end gap-2 pt-2">
            <HrButton
              type="button"
              variant="outline"
              onClick={() => setIsLeaveModalOpen(false)}
              disabled={isSubmittingLeave}
            >
              Cancelar
            </HrButton>
            <HrButton type="submit" variant="primary" disabled={isSubmittingLeave}>
              {isSubmittingLeave ? 'Submetendo...' : 'Submeter Pedido'}
            </HrButton>
          </div>
        </form>
      </HrDialog>

      {/* Modal: Pedir Correcção de Ponto */}
      <HrDialog
        isOpen={isCorrectionModalOpen}
        onClose={() => setIsCorrectionModalOpen(false)}
        title="Pedir Correcção de Ponto"
        description="Solicite a inclusão ou ajuste de uma picagem esquecida ou com erro ao RH."
      >
        <form onSubmit={handleCorrectionSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <HrField label="Tipo de Ponto" required>
              <HrSelect
                value={correctionForm.targetEntryType}
                onChange={(e) =>
                  setCorrectionForm({ ...correctionForm, targetEntryType: e.target.value })
                }
                options={[
                  { value: 'ENTRADA', label: 'Entrada' },
                  { value: 'INICIO_PAUSA', label: 'Início Pausa' },
                  { value: 'FIM_PAUSA', label: 'Fim Pausa' },
                  { value: 'SAIDA', label: 'Saída' },
                ]}
              />
            </HrField>

            <HrField label="Data" required>
              <HrInput
                type="date"
                value={correctionForm.date}
                onChange={(e) => setCorrectionForm({ ...correctionForm, date: e.target.value })}
              />
            </HrField>

            <HrField label="Hora Solicitada" required>
              <HrInput
                type="time"
                value={correctionForm.time}
                onChange={(e) => setCorrectionForm({ ...correctionForm, time: e.target.value })}
              />
            </HrField>
          </div>

          <HrField label="Justificação Obrigatória" required>
            <textarea
              value={correctionForm.reason}
              onChange={(e) => setCorrectionForm({ ...correctionForm, reason: e.target.value })}
              rows={3}
              placeholder="Explique o motivo do esquecimento ou impossibilidade de marcação..."
              className="w-full px-3 py-2 text-xs bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] text-[var(--hr-text)] focus:outline-none focus:border-[var(--hr-primary)]"
            />
          </HrField>

          <div className="flex justify-end gap-2 pt-2">
            <HrButton
              type="button"
              variant="outline"
              onClick={() => setIsCorrectionModalOpen(false)}
            >
              Cancelar
            </HrButton>
            <HrButton type="submit" variant="primary">
              Enviar Pedido
            </HrButton>
          </div>
        </form>
      </HrDialog>

      {/* First-access Change Password Modal */}
      <HrDialog
        isOpen={isChangingPass}
        onClose={() => {
          if (!user?.mustChangePassword) setIsChangingPass(false);
        }}
        title="Definir Nova Palavra-passe"
        description="Por favor, defina a sua nova palavra-passe pessoal e segura."
        maxWidth="sm"
      >
        <form onSubmit={handleChangePassword} className="space-y-4 py-1">
          {passError && (
            <div className="p-3 bg-[var(--hr-status-error-bg)] border border-[var(--hr-status-error)] rounded-[var(--hr-radius-sm)] text-xs text-[var(--hr-status-error)] font-medium">
              {passError}
            </div>
          )}

          <HrField label="Palavra-passe Actual / Temporária" required>
            <HrInput
              type="password"
              required
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
              placeholder="Senha atribuída"
            />
          </HrField>

          <HrField label="Nova Palavra-passe Pessoal" required hint="Mínimo 8 caracteres">
            <HrInput
              type="password"
              required
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="••••••••••••"
            />
          </HrField>

          <HrField label="Confirmar Nova Palavra-passe" required>
            <HrInput
              type="password"
              required
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              placeholder="••••••••••••"
            />
          </HrField>

          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--hr-border)]">
            {!user?.mustChangePassword && (
              <HrButton variant="outline" size="sm" onClick={() => setIsChangingPass(false)}>
                Cancelar
              </HrButton>
            )}
            <HrButton type="submit" variant="primary" size="sm" isLoading={isSubmittingPass}>
              Guardar Senha
            </HrButton>
          </div>
        </form>
      </HrDialog>

      {/* Modal: QR de Validação do Crachá Digital */}
      <HrDialog
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        title="Crachá Digital ARKNET — QR de Validação"
        description="Apresente este código QR a um supervisor ou terminal de validação para confirmar a sua identidade."
        maxWidth="sm"
      >
        {employee && (
          <div className="flex flex-col items-center gap-5 py-4">
            {/* QR Code SVG (visual representation) */}
            <div className="relative p-4 bg-white rounded-xl shadow-[var(--hr-shadow-md)] hr-qr-shimmer">
              <svg width="160" height="160" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" aria-label="QR Code de Validação">
                {/* QR-like pattern (decorative) */}
                <rect width="160" height="160" fill="white" />
                {/* Corner markers */}
                <rect x="8" y="8" width="40" height="40" rx="4" fill="#003B73" />
                <rect x="14" y="14" width="28" height="28" rx="2" fill="white" />
                <rect x="20" y="20" width="16" height="16" rx="1" fill="#003B73" />
                <rect x="112" y="8" width="40" height="40" rx="4" fill="#003B73" />
                <rect x="118" y="14" width="28" height="28" rx="2" fill="white" />
                <rect x="124" y="20" width="16" height="16" rx="1" fill="#003B73" />
                <rect x="8" y="112" width="40" height="40" rx="4" fill="#003B73" />
                <rect x="14" y="118" width="28" height="28" rx="2" fill="white" />
                <rect x="20" y="124" width="16" height="16" rx="1" fill="#003B73" />
                {/* Data modules (representative pattern) */}
                {[56,64,72,80,88,96,104].map(x => [56,64,72,80,88,96,104].map(y => (
                  <rect key={`${x}-${y}`} x={x} y={y} width="6" height="6" rx="1" fill={((x+y) % 16 === 0 || (x*y) % 7 < 3) ? '#0868B0' : '#e2e8f0'} />
                ))).flat()}
                {/* Center ARKNET logo area */}
                <rect x="60" y="60" width="40" height="40" rx="6" fill="white" stroke="#0868B0" strokeWidth="2" />
                <text x="80" y="84" textAnchor="middle" fontSize="11" fontWeight="900" fill="#003B73" letterSpacing="0.5">ARK</text>
              </svg>
            </div>

            <div className="text-center space-y-2">
              <div className="text-sm font-extrabold text-[var(--hr-text)] tracking-tight">{employee.fullName}</div>
              <div className="text-xs text-[var(--hr-text-muted)] font-mono">{employee.employeeNumber}</div>
              <div className="text-[10px] text-[var(--hr-text-light)] font-mono break-all max-w-[240px]">
                Hash: {qrVerificationHash.slice(0, 32)}...
              </div>
            </div>

            <div className="text-[10px] text-[var(--hr-text-light)] text-center max-w-xs leading-relaxed">
              Este código é válido para a data de hoje e muda diariamente. Não partilhe capturas de ecrã.
            </div>

            <HrButton variant="outline" size="sm" onClick={() => setIsQrModalOpen(false)}>
              Fechar
            </HrButton>
          </div>
        )}
      </HrDialog>

      {/* Modal: Recibo de Vencimento Oficial — Papel Timbrado */}
      <HrDialog
        isOpen={isPayslipModalOpen}
        onClose={() => setIsPayslipModalOpen(false)}
        title="Recibo de Vencimento Oficial"
        description="Emissão individual em conformidade com a legislação laboral e fiscal de Angola."
        maxWidth="lg"
      >
        {selectedPayslip && (
          <div className="space-y-0 pt-2 text-xs text-[var(--hr-text)] print:m-0 print:p-0 hr-payslip-watermark">
            {/* Header Documento Oficial — Papel Timbrado */}
            <div className="relative z-10 border border-[var(--hr-border)] rounded-t-[var(--hr-radius)] p-5 space-y-3" style={{ background: 'linear-gradient(180deg, var(--hr-surface) 0%, var(--hr-bg) 100%)' }}>
              <div className="flex items-start justify-between border-b border-[var(--hr-border-subtle)] pb-3">
                <div>
                  <div className="text-base font-extrabold tracking-tight" style={{ color: '#003B73' }}>
                    J.MATOS TECNOLOGIA / ARKNET
                  </div>
                  <div className="text-[11px] text-[var(--hr-text-muted)] mt-0.5">
                    NIF: 5417281903 · Luanda, Angola · Recursos Humanos
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-[var(--hr-text)]">
                    {selectedPayslip.payslipNumber}
                  </div>
                  <div className="text-[11px] text-[var(--hr-text-muted)]">
                    Período: {selectedPayslip.payrollPeriod?.code}
                  </div>
                </div>
              </div>

              {/* Dados do Colaborador */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div>
                  <span className="text-[var(--hr-text-muted)] block">Colaborador:</span>
                  <span className="font-bold">{selectedPayslip.employee?.fullName}</span>
                </div>
                <div>
                  <span className="text-[var(--hr-text-muted)] block">N.º Mecanográfico:</span>
                  <span className="font-mono font-bold">{selectedPayslip.employee?.employeeNumber}</span>
                </div>
                <div>
                  <span className="text-[var(--hr-text-muted)] block">Cargo:</span>
                  <span>{selectedPayslip.employee?.position?.title || '—'}</span>
                </div>
                <div>
                  <span className="text-[var(--hr-text-muted)] block">Departamento:</span>
                  <span>{selectedPayslip.employee?.department?.name || '—'}</span>
                </div>
                <div>
                  <span className="text-[var(--hr-text-muted)] block">BI / NIF:</span>
                  <span className="font-mono">{selectedPayslip.employee?.biNumber || '—'}</span>
                </div>
                <div>
                  <span className="text-[var(--hr-text-muted)] block">Método / Banco:</span>
                  <span>{selectedPayslip.bankName || 'BFA'}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-[var(--hr-text-muted)] block">IBAN:</span>
                  <span className="font-mono text-[10px]">{selectedPayslip.bankIban || '—'}</span>
                </div>
              </div>
            </div>

            {/* Linhas Discriminadas com cores por tipo */}
            <div className="relative z-10 border-x border-[var(--hr-border)] overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[var(--hr-bg)] border-b border-[var(--hr-border)] text-left text-[var(--hr-text-muted)] font-semibold">
                    <th className="py-2 px-3">Código</th>
                    <th className="py-2 px-3">Descrição da Remuneração / Desconto</th>
                    <th className="py-2 px-3 text-right">Rendimento (Kz)</th>
                    <th className="py-2 px-3 text-right">Retenção (Kz)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--hr-border-subtle)]">
                  {selectedPayslip.items?.map((item: any) => (
                    <tr key={item.id} className={item.type === 'VENCIMENTO' ? 'hr-payslip-earning' : item.type === 'DESCONTO' ? 'hr-payslip-deduction' : ''}>
                      <td className="py-2 px-3 font-mono text-[11px] text-[var(--hr-text-muted)]">
                        {item.code}
                      </td>
                      <td className="py-2 px-3">{item.description}</td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums">
                        {item.type === 'VENCIMENTO'
                          ? <span className="text-[var(--hr-status-success)] font-semibold">{Number(item.amount).toLocaleString('pt-AO')} Kz</span>
                          : '—'}
                      </td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums">
                        {item.type === 'DESCONTO'
                          ? <span className="text-[var(--hr-status-error)] font-semibold">-{Number(item.amount).toLocaleString('pt-AO')} Kz</span>
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Perforated Cut Line */}
            <div className="hr-payslip-cut-line relative z-10" />

            {/* Totais — Voucher Stub */}
            <div className="relative z-10 grid grid-cols-3 gap-3 px-4 pt-3">
              <div>
                <span className="text-[11px] text-[var(--hr-text-muted)] block">Total Ilíquido (Bruto)</span>
                <span className="text-sm font-bold font-mono tabular-nums">
                  {Number(selectedPayslip.grossSalary).toLocaleString('pt-AO')} Kz
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[var(--hr-text-muted)] block">Total Descontos (INSS + IRT)</span>
                <span className="text-sm font-bold font-mono tabular-nums text-[var(--hr-status-error)]">
                  -{Number(selectedPayslip.totalDeductions).toLocaleString('pt-AO')} Kz
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-[var(--hr-text-muted)] block">Salário Líquido a Receber</span>
              </div>
            </div>

            {/* Net Salary Deep Navy Card */}
            <div className="relative z-10 mx-4 mt-2 p-4 rounded-[var(--hr-radius)] hr-payslip-net flex items-center justify-between">
              <div>
                <div className="text-[11px] text-white/60 uppercase tracking-wider font-bold">Valor Líquido</div>
                <div className="text-xl sm:text-2xl font-extrabold font-mono tabular-nums tracking-tight">
                  {Number(selectedPayslip.netSalary).toLocaleString('pt-AO')} Kz
                </div>
              </div>
              <div className="hr-payslip-stamp" style={{ borderColor: 'rgba(255,255,255,0.4)', color: 'rgba(255,255,255,0.6)' }}>
                ✓ Processado por Computador
              </div>
            </div>

            {/* Authenticity Stamp + Legal Footer */}
            <div className="relative z-10 px-4 pt-4 pb-2 flex flex-col items-center gap-3">
              <div className="hr-payslip-stamp">
                <Shield className="w-3 h-3" />
                Processado por Computador · ARKNET / J.Matos · Lei 12/23 &amp; 28/20
              </div>
              <p className="text-[10px] text-[var(--hr-text-muted)] leading-relaxed italic text-center max-w-md">
                Processado ao abrigo da Lei n.º 12/23 (Lei Geral do Trabalho), Lei n.º 28/20 (Código do IRT) e Decreto Presidencial n.º 227/18 (INSS de Angola).
              </p>
            </div>

            {/* Acções do Modal */}
            <div className="relative z-10 flex justify-between items-center pt-3 mx-4 pb-2 border-t border-[var(--hr-border)]">
              <HrButton
                type="button"
                variant="outline"
                size="sm"
                onClick={() => window.print()}
              >
                <Printer className="w-3.5 h-3.5 mr-1" />
                Imprimir Recibo (PDF)
              </HrButton>
              <HrButton
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setIsPayslipModalOpen(false)}
              >
                Fechar
              </HrButton>
            </div>
          </div>
        )}
      </HrDialog>
    </div>
  );
}
