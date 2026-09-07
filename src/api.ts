  import type { Transaction, Subscriber, Project, Opex, Employee, Budget, Invoice, ProfitShareScheme, Quotation, User, InvestorDisbursement, VenuePartner } from './Types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    let message = `API error: ${response.status} ${response.statusText}`;
    try {
      const errorBody = await response.json();
      if (typeof errorBody?.message === 'string') {
        message = errorBody.message;
      }
    } catch {
      // Keep the generic HTTP message when the server does not return JSON.
    }
    throw new Error(message);
  }

  // Delete requests might return no body or non-JSON
  if (options?.method === 'DELETE') {
    return {} as T;
  }

  return response.json();
}

const normalizeVenuePartner = (venue: any): VenuePartner => {
  const staticRate =
    venue.customSharePercent !== null && venue.customSharePercent !== undefined
      ? Number(venue.customSharePercent)
      : venue.staticSharePercent !== undefined
        ? Number(venue.staticSharePercent)
        : undefined;

  return {
    ...venue,
    pricePerTrx: parseFloat(venue.pricePerTrx || 0),
    monthlyRevenue: parseFloat(venue.monthlyRevenue || 0),
    baseSharePercent: Number(venue.baseSharePercent ?? 15),
    bonusSharePercent: Number(venue.bonusSharePercent ?? 20),
    tierThreshold: Number(venue.tierThreshold ?? 50),
    customSharePercent: staticRate ?? null,
    staticSharePercent: staticRate,
    schemeType: staticRate !== undefined ? 'static' : 'dynamic',
  };
};

const serializeVenuePartner = (venue: Partial<VenuePartner>) => {
  const isStatic = venue.schemeType === 'static';
  return {
    ...venue,
    customSharePercent: isStatic ? Number(venue.staticSharePercent ?? 0) : null,
  };
};

export const api = {
  // ===== TRANSACTIONS =====
  async getTransactions(): Promise<Transaction[]> {
    const data = await request<any[]>('/transactions');
    return data.map(t => ({
      ...t,
      amount: parseFloat(t.amount),
    }));
  },

  async createTransaction(t: Omit<Transaction, 'id'>): Promise<Transaction> {
    const data = await request<any>('/transactions', {
      method: 'POST',
      body: JSON.stringify(t),
    });
    return {
      ...data,
      amount: parseFloat(data.amount),
    };
  },

  async deleteTransaction(id: string, userId?: string, reason?: string): Promise<void> {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (reason) params.append('reason', reason);
    const query = params.toString() ? `?${params.toString()}` : '';
    await request<void>(`/transactions/${id}${query}`, { method: 'DELETE' });
  },

  // ===== SUBSCRIBERS =====
  async getSubscribers(): Promise<Subscriber[]> {
    const data = await request<any[]>('/subscribers');
    return data.map(s => ({
      ...s,
      monthly: parseFloat(s.monthly),
    }));
  },

  async createSubscriber(s: Omit<Subscriber, 'id'>): Promise<Subscriber> {
    const data = await request<any>('/subscribers', {
      method: 'POST',
      body: JSON.stringify(s),
    });
    return {
      ...data,
      monthly: parseFloat(data.monthly),
    };
  },

  async deleteSubscriber(id: string): Promise<void> {
    await request<void>(`/subscribers/${id}`, { method: 'DELETE' });
  },

  // ===== PROJECTS =====
  async getProjects(): Promise<Project[]> {
    const data = await request<any[]>('/projects');
    return data.map(p => ({
      ...p,
      value: parseFloat(p.value),
      paid: parseFloat(p.paid),
    }));
  },

  async createProject(p: Omit<Project, 'id'>): Promise<Project> {
    const data = await request<any>('/projects', {
      method: 'POST',
      body: JSON.stringify(p),
    });
    return {
      ...data,
      value: parseFloat(data.value),
      paid: parseFloat(data.paid),
    };
  },

  async deleteProject(id: string): Promise<void> {
    await request<void>(`/projects/${id}`, { method: 'DELETE' });
  },

  // ===== OPEX =====
  async getOpex(): Promise<Opex[]> {
    const data = await request<any[]>('/opex');
    return data.map(o => ({
      ...o,
      amount: parseFloat(o.amount),
    }));
  },

  async createOpex(o: Omit<Opex, 'id'>): Promise<Opex> {
    const data = await request<any>('/opex', {
      method: 'POST',
      body: JSON.stringify(o),
    });
    return {
      ...data,
      amount: parseFloat(data.amount),
    };
  },

  async deleteOpex(id: string, userId?: string, reason?: string): Promise<void> {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (reason) params.append('reason', reason);
    const query = params.toString() ? `?${params.toString()}` : '';
    await request<void>(`/opex/${id}${query}`, { method: 'DELETE' });
  },

  // ===== EMPLOYEES =====
  async getEmployees(): Promise<Employee[]> {
    const data = await request<any[]>('/employees');
    return data.map(e => ({
      ...e,
      base: parseFloat(e.base),
      transport: parseFloat(e.transport),
      meal: parseFloat(e.meal),
      bonus: parseFloat(e.bonus),
      bpjsk: parseFloat(e.bpjsk),
      bpjstk: parseFloat(e.bpjstk),
      otherCut: parseFloat(e.otherCut),
      thp: parseFloat(e.thp),
    }));
  },

  async createEmployee(e: Omit<Employee, 'id' | 'thp'>): Promise<Employee> {
    const data = await request<any>('/employees', {
      method: 'POST',
      body: JSON.stringify(e),
    });
    return {
      ...data,
      base: parseFloat(data.base),
      transport: parseFloat(data.transport),
      meal: parseFloat(data.meal),
      bonus: parseFloat(data.bonus),
      bpjsk: parseFloat(data.bpjsk),
      bpjstk: parseFloat(data.bpjstk),
      otherCut: parseFloat(data.otherCut),
      thp: parseFloat(data.thp),
    };
  },

  async deleteEmployee(id: string): Promise<void> {
    await request<void>(`/employees/${id}`, { method: 'DELETE' });
  },

  // ===== BUDGET =====
  async getBudget(): Promise<Budget> {
    const data = await request<any>('/budget');
    return {
      incomeTarget: parseFloat(data.incomeTarget),
      gaji: parseFloat(data.gaji),
      server: parseFloat(data.server),
      marketing: parseFloat(data.marketing),
      operasional: parseFloat(data.operasional),
      event: parseFloat(data.event),
    };
  },

  async updateBudget(b: Budget): Promise<Budget> {
    const data = await request<any>('/budget', {
      method: 'PATCH',
      body: JSON.stringify(b),
    });
    return {
      incomeTarget: parseFloat(data.incomeTarget),
      gaji: parseFloat(data.gaji),
      server: parseFloat(data.server),
      marketing: parseFloat(data.marketing),
      operasional: parseFloat(data.operasional),
      event: parseFloat(data.event),
    };
  },

  // ===== INVOICES =====
  async getInvoices(): Promise<Invoice[]> {
    const data = await request<any[]>('/invoices');
    return data.map(inv => ({
      ...inv,
      items: inv.items.map((item: any) => ({
        ...item,
        price: parseFloat(item.price),
      })),
    }));
  },

  async createInvoice(inv: Omit<Invoice, 'id'>): Promise<Invoice> {
    const data = await request<any>('/invoices', {
      method: 'POST',
      body: JSON.stringify(inv),
    });
    return {
      ...data,
      items: data.items.map((item: any) => ({
        ...item,
        price: parseFloat(item.price),
      })),
    };
  },

  // ===== PROFIT SHARE =====
  async getProfitShareSchemes(): Promise<ProfitShareScheme[]> {
    const data = await request<any[]>('/profit-share');
    return data.map(sc => ({
      ...sc,
      manualBaseAmount: parseFloat(sc.manualBaseAmount),
      productPrice: sc.productPrice ? parseFloat(sc.productPrice) : undefined,
      hppPerYear: sc.hppPerYear ? parseFloat(sc.hppPerYear) : undefined,
      deductions: sc.deductions?.map((d: any) => ({
        ...d,
        amount: parseFloat(d.amount),
      })),
    }));
  },

  async createProfitShareScheme(sc: Omit<ProfitShareScheme, 'id'>): Promise<ProfitShareScheme> {
    const data = await request<any>('/profit-share', {
      method: 'POST',
      body: JSON.stringify(sc),
    });
    return {
      ...data,
      manualBaseAmount: parseFloat(data.manualBaseAmount),
      productPrice: data.productPrice ? parseFloat(data.productPrice) : undefined,
      hppPerYear: data.hppPerYear ? parseFloat(data.hppPerYear) : undefined,
      deductions: data.deductions?.map((d: any) => ({
        ...d,
        amount: parseFloat(d.amount),
      })),
    };
  },

  async updateProfitShareSchemes(schemes: ProfitShareScheme[]): Promise<ProfitShareScheme[]> {
    // In local storage, schemes were updated as a whole.
    // For backend, since we are doing simple integration, we can send each to backend or synchronize.
    // Let's create helper to sync: if scheme has no ID, create it; else update it.
    const result: ProfitShareScheme[] = [];
    for (const sc of schemes) {
      if (!sc.id || sc.id.length < 10) { // Math.random id is short
        const { id, ...rest } = sc;
        const saved = await this.createProfitShareScheme(rest);
        result.push(saved);
      } else {
        const { id, ...rest } = sc;
        const data = await request<any>(`/profit-share/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(rest),
        });
        result.push({
          ...data,
          manualBaseAmount: parseFloat(data.manualBaseAmount),
          productPrice: data.productPrice ? parseFloat(data.productPrice) : undefined,
          hppPerYear: data.hppPerYear ? parseFloat(data.hppPerYear) : undefined,
          deductions: data.deductions?.map((d: any) => ({
            ...d,
            amount: parseFloat(d.amount),
          })),
        });
      }
    }
    return result;
  },

  // ===== QUOTATIONS =====
  async getQuotations(): Promise<Quotation[]> {
    const data = await request<any[]>('/quotations');
    return data.map(q => ({
      ...q,
      barterValue: parseFloat(q.barterValue),
      items: q.items.map((item: any) => ({
        ...item,
        publishRate: parseFloat(item.publishRate),
      })),
    }));
  },

  async createQuotation(q: Omit<Quotation, 'id'>): Promise<Quotation> {
    const data = await request<any>('/quotations', {
      method: 'POST',
      body: JSON.stringify(q),
    });
    return {
      ...data,
      barterValue: parseFloat(data.barterValue),
      items: data.items.map((item: any) => ({
        ...item,
        publishRate: parseFloat(item.publishRate),
      })),
    };
  },

  // ===== USERS & AUTH =====
  async getUsers(): Promise<User[]> {
    return request<User[]>('/users');
  },

  async login(email: string, password: string): Promise<User> {
    return request<User>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  // ===== DISBURSEMENTS (BAGI HASIL) =====
  async getDisbursements(): Promise<InvestorDisbursement[]> {
    const data = await request<any[]>('/disbursements');
    return data.map(d => ({
      ...d,
      netProfit: parseFloat(d.netProfit),
      amount: parseFloat(d.amount),
    }));
  },

  async createDisbursement(d: Omit<InvestorDisbursement, 'id' | 'createdAt' | 'createdBy'>): Promise<InvestorDisbursement> {
    const data = await request<any>('/disbursements', {
      method: 'POST',
      body: JSON.stringify(d),
    });
    return {
      ...data,
      netProfit: parseFloat(data.netProfit),
      amount: parseFloat(data.amount),
    };
  },

  async markDisbursementPaid(id: string): Promise<InvestorDisbursement> {
    const data = await request<any>(`/disbursements/${id}/pay`, {
      method: 'PATCH',
    });
    return {
      ...data,
      netProfit: parseFloat(data.netProfit),
      amount: parseFloat(data.amount),
    };
  },

  async deleteDisbursement(id: string): Promise<void> {
    await request<void>(`/disbursements/${id}`, { method: 'DELETE' });
  },

  // ===== SUKUK INVESTOR PROJECTS =====
  async getSukukProjects(): Promise<any[]> {
    try {
      return await request<any[]>('/disbursements/sukuk-projects');
    } catch {
      return [];
    }
  },

  async createSukukProject(p: any): Promise<any> {
    try {
      return await request<any>('/disbursements/sukuk-projects', {
        method: 'POST',
        body: JSON.stringify(p),
      });
    } catch {
      return { id: `sukuk-proj-${Date.now()}`, ...p };
    }
  },

  async getSukukSettlements(): Promise<any[]> {
    try {
      return await request<any[]>('/disbursements/sukuk-settlements');
    } catch {
      return [];
    }
  },

  async createSukukSettlement(s: any): Promise<any> {
    try {
      return await request<any>('/disbursements/sukuk-settlements', {
        method: 'POST',
        body: JSON.stringify(s),
      });
    } catch {
      return { id: `sukuk-set-${Date.now()}`, ...s };
    }
  },

  // ===== VENUE PARTNERS =====
  async getVenuePartners(): Promise<VenuePartner[]> {
    const data = await request<any[]>('/venue-partners');
    return data.map(normalizeVenuePartner);
  },

  async createVenuePartner(v: Omit<VenuePartner, 'id'>): Promise<VenuePartner> {
    const data = await request<any>('/venue-partners', {
      method: 'POST',
      body: JSON.stringify(serializeVenuePartner(v)),
    });
    return normalizeVenuePartner(data);
  },

  async updateVenuePartner(id: string, v: Partial<VenuePartner>): Promise<VenuePartner> {
    const data = await request<any>(`/venue-partners/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(serializeVenuePartner(v)),
    });
    return normalizeVenuePartner(data);
  },

  async deleteVenuePartner(id: string): Promise<void> {
    await request<void>(`/venue-partners/${id}`, { method: 'DELETE' });
  },

  async getVenueSettlements(): Promise<any[]> {
    const data = await request<any[]>('/venue-partners/settlements');
    return data.map(s => ({
      ...s,
      pricePerTrx: parseFloat(s.pricePerTrx || 0),
      grossRevenue: parseFloat(s.grossRevenue || 0),
      partnerPayout: parseFloat(s.partnerPayout || 0),
      snapcalaNet: parseFloat(s.snapcalaNet || 0),
    }));
  },

  async createVenueSettlement(s: any): Promise<any> {
    const data = await request<any>('/venue-partners/settlements', {
      method: 'POST',
      body: JSON.stringify(s),
    });
    return {
      ...data,
      pricePerTrx: parseFloat(data.pricePerTrx || 0),
      grossRevenue: parseFloat(data.grossRevenue || 0),
      partnerPayout: parseFloat(data.partnerPayout || 0),
      snapcalaNet: parseFloat(data.snapcalaNet || 0),
    };
  },
};
