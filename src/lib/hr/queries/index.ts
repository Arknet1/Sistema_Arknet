/**
 * Query and mutation abstractions for J.Matos HR
 * Mobile-ready and completely separated from presentation components.
 */

export interface EmployeeListItem {
  id: string;
  employeeNumber: string;
  fullName: string;
  biNumber: string;
  email: string | null;
  phone: string | null;
  status: 'ACTIVO' | 'SUSPENSO' | 'DESLIGADO' | 'FERIAS' | 'LICENCA';
  department: { id: string; name: string } | null;
  position: { id: string; title: string } | null;
  hireDate: string;
  user?: { id: string; email: string; role: string; isActive: boolean } | null;
  baseSalary?: number | string | null;
}

export async function fetchEmployees(search?: string, departmentId?: string, status?: string) {
  const query = new URLSearchParams();
  if (search) query.set('search', search);
  if (departmentId) query.set('departmentId', departmentId);
  if (status) query.set('status', status);

  const res = await fetch(`/api/rh/funcionarios?${query.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao carregar colaboradores');
  }
  return res.json();
}

export async function fetchEmployeeById(id: string) {
  const res = await fetch(`/api/rh/funcionarios/${id}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao carregar detalhes do colaborador');
  }
  return res.json();
}

export async function createEmployee(data: Record<string, unknown>) {
  const res = await fetch('/api/rh/funcionarios', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error || 'Erro ao registar colaborador');
  }
  return json;
}

export async function updateEmployee(id: string, data: Record<string, unknown>) {
  const res = await fetch(`/api/rh/funcionarios/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error || 'Erro ao actualizar colaborador');
  }
  return json;
}

export async function terminateEmployee(id: string, reason: string, notes?: string) {
  const res = await fetch(`/api/rh/funcionarios/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason, notes }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error || 'Erro ao desligar colaborador');
  }
  return json;
}

export async function createEmployeeUserAccount(employeeId: string, email: string, temporaryPassword?: string) {
  const res = await fetch(`/api/rh/funcionarios/${employeeId}/criar-utilizador`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, temporaryPassword }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error || 'Erro ao criar conta de acesso');
  }
  return json;
}

export async function fetchDepartments() {
  const res = await fetch('/api/rh/departamentos');
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao carregar departamentos');
  }
  return res.json();
}

export async function createDepartment(name: string, description?: string) {
  const res = await fetch('/api/rh/departamentos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error || 'Erro ao criar departamento');
  }
  return json;
}

export async function fetchPositions() {
  const res = await fetch('/api/rh/cargos');
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao carregar cargos');
  }
  return res.json();
}

export async function createPosition(title: string, departmentId: string, baseSalary?: number) {
  const res = await fetch('/api/rh/cargos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, departmentId, baseSalary }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error || 'Erro ao criar cargo');
  }
  return json;
}

export async function fetchContracts(employeeId?: string) {
  const query = employeeId ? `?employeeId=${employeeId}` : '';
  const res = await fetch(`/api/rh/contratos${query}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao carregar contratos');
  }
  return res.json();
}

export async function createContract(data: Record<string, unknown>) {
  const res = await fetch('/api/rh/contratos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error || 'Erro ao registar contrato');
  }
  return json;
}

export async function fetchDocuments(employeeId?: string) {
  const query = employeeId ? `?employeeId=${employeeId}` : '';
  const res = await fetch(`/api/rh/documentos${query}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao carregar documentos');
  }
  return res.json();
}

export async function fetchAuditLogs(limit = 50, entityType?: string) {
  const query = new URLSearchParams();
  query.set('limit', String(limit));
  if (entityType) query.set('entityType', entityType);

  const res = await fetch(`/api/rh/auditoria?${query.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao carregar auditoria');
  }
  return res.json();
}

export async function fetchPortalData() {
  const res = await fetch('/api/portal/dados');
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao carregar dados do portal');
  }
  return res.json();
}

// =============================================================
// FASE 2: PONTO E AUSÊNCIAS (QUERIES & MUTATIONS)
// =============================================================

export interface TimePunchPayload {
  type: 'ENTRADA' | 'INICIO_PAUSA' | 'FIM_PAUSA' | 'SAIDA';
  latitude?: number | null;
  longitude?: number | null;
  accuracyMeters?: number | null;
  clientRequestId: string;
}

export async function fetchPortalPontoStatus() {
  const res = await fetch('/api/portal/ponto/hoje');
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao carregar estado do ponto');
  }
  return res.json();
}

export async function submitPortalPunch(payload: TimePunchPayload) {
  const res = await fetch('/api/portal/ponto/marcar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error || 'Erro ao picar ponto');
  }
  return json;
}

export async function fetchPortalPontoHistory(month?: number, year?: number) {
  const query = new URLSearchParams();
  if (month) query.set('month', String(month));
  if (year) query.set('year', String(year));

  const res = await fetch(`/api/portal/ponto/historico?${query.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao carregar histórico do ponto');
  }
  return res.json();
}

export async function submitPortalTimeCorrection(data: {
  date: string;
  targetEntryType: 'ENTRADA' | 'INICIO_PAUSA' | 'FIM_PAUSA' | 'SAIDA';
  requestedTime: string;
  reason: string;
}) {
  const res = await fetch('/api/portal/ponto/corrigir', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error || 'Erro ao submeter pedido de correcção');
  }
  return json;
}

export async function fetchPortalLeaves() {
  const res = await fetch('/api/portal/ausencias');
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao carregar dados de ausências');
  }
  return res.json();
}

export async function submitPortalLeaveRequest(data: {
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason: string;
  attachmentPath?: string | null;
  attachmentName?: string | null;
}) {
  const res = await fetch('/api/portal/ausencias', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error || 'Erro ao submeter pedido de férias/licença');
  }
  return json;
}

export async function cancelPortalLeaveRequest(requestId: string) {
  const res = await fetch(`/api/portal/ausencias/${requestId}/cancelar`, {
    method: 'POST',
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error || 'Erro ao cancelar pedido de ausência');
  }
  return json;
}

export async function fetchNotifications() {
  const res = await fetch('/api/rh/notificacoes');
  if (!res.ok) {
    return { notifications: [], unreadCount: 0 };
  }
  return res.json();
}

export async function markNotificationAsRead(id: string) {
  const res = await fetch(`/api/rh/notificacoes/${id}/ler`, {
    method: 'POST',
  });
  return res.json().catch(() => ({}));
}

// Painel RH: Ponto e Presenças do Dia
export async function fetchRhPontoToday(departmentId?: string, status?: string) {
  const query = new URLSearchParams();
  if (departmentId) query.set('departmentId', departmentId);
  if (status) query.set('status', status);

  const res = await fetch(`/api/rh/ponto/hoje?${query.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao carregar presenças do dia');
  }
  return res.json();
}

export async function submitRhManualPunch(data: {
  employeeId: string;
  type: 'ENTRADA' | 'INICIO_PAUSA' | 'FIM_PAUSA' | 'SAIDA';
  time: string;
  date: string;
  notes: string;
}) {
  const res = await fetch('/api/rh/ponto/manual', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error || 'Erro ao registar marcação manual');
  }
  return json;
}

// Painel RH: Pedidos de Correcção e Horas Extras
export async function fetchRhPendingRequests() {
  const res = await fetch('/api/rh/ponto/pedidos');
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao carregar pedidos pendentes');
  }
  return res.json();
}

export async function reviewRhCorrection(
  correctionId: string,
  decision: 'APROVADO' | 'REJEITADO',
  comment?: string
) {
  const res = await fetch(`/api/rh/ponto/pedidos/correccoes/${correctionId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ decision, comment }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error || 'Erro ao rever pedido de correcção');
  }
  return json;
}

export async function reviewRhOvertime(
  workDayId: string,
  decision: 'APROVADO' | 'REJEITADO',
  approvedMinutes?: number,
  comment?: string
) {
  const res = await fetch(`/api/rh/ponto/pedidos/horas-extras/${workDayId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ decision, approvedMinutes, comment }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error || 'Erro ao rever horas extras');
  }
  return json;
}

// Painel RH: Gestão de Ausências
export async function fetchRhLeaves(departmentId?: string, status?: string) {
  const query = new URLSearchParams();
  if (departmentId) query.set('departmentId', departmentId);
  if (status) query.set('status', status);

  const res = await fetch(`/api/rh/ausencias?${query.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao carregar ausências');
  }
  return res.json();
}

export async function reviewRhLeave(
  requestId: string,
  decision: 'APROVADO' | 'REJEITADO',
  comment?: string
) {
  const res = await fetch(`/api/rh/ausencias/${requestId}/decisao`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ decision, comment }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error || 'Erro ao rever ausência');
  }
  return json;
}

export async function fetchRhTeamCalendar(month?: number, year?: number, departmentId?: string) {
  const query = new URLSearchParams();
  if (month) query.set('month', String(month));
  if (year) query.set('year', String(year));
  if (departmentId) query.set('departmentId', departmentId);

  const res = await fetch(`/api/rh/ausencias/calendario?${query.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao carregar calendário da equipa');
  }
  return res.json();
}

// Painel RH: Configurações Gerais
export async function fetchRhFullConfig() {
  const res = await fetch('/api/rh/configuracao');
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao carregar configurações');
  }
  return res.json();
}

export async function saveRhFullConfig(data: Record<string, unknown>) {
  const res = await fetch('/api/rh/configuracao', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error || 'Erro ao guardar configurações');
  }
  return json;
}

export async function saveWorkLocation(data: Record<string, unknown>) {
  const res = await fetch('/api/rh/configuracao/locais', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error || 'Erro ao gravar local de trabalho');
  }
  return json;
}

export async function saveLeaveType(data: Record<string, unknown>) {
  const res = await fetch('/api/rh/configuracao/tipos-licenca', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error || 'Erro ao gravar tipo de licença');
  }
  return json;
}

export async function saveHoliday(data: Record<string, unknown>) {
  const res = await fetch('/api/rh/configuracao/feriados', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error || 'Erro ao gravar feriado');
  }
  return json;
}

export async function fetchMonthlyAttendanceReport(month: number, year: number, employeeId?: string) {
  const query = new URLSearchParams();
  query.set('month', String(month));
  query.set('year', String(year));
  if (employeeId) query.set('employeeId', employeeId);

  const res = await fetch(`/api/rh/ponto/relatorios?${query.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao gerar relatório de presenças');
  }
  return res.json();
}

