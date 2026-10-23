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
