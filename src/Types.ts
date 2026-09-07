export type Transaction = {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  type: 'in' | 'out';
  businessLine?: string;
  receiptImage?: string;
  createdById?: string;
  createdBy?: User;
  updatedById?: string;
  updatedBy?: User;
  createdAt?: string;
  updatedAt?: string;
};

export type Subscriber = {
  id: string;
  name: string;
  productName: string;
  units: number;
  status: 'active' | 'unpaid';
  startDate: string;
  dueDate: string;
  city?: string;
  monthly: number;
  type: 'subscription' | 'quota';
  quotaAmount?: number;
  businessLine?: string;
};

export type Project = {
  id: string;
  name: string;
  client: string;
  type: string;
  status: 'ongoing' | 'done' | 'pending';
  value: number;
  paid: number;
  start: string;
  deadline: string;
  businessLine?: string;
};

export type Opex = {
  id: string;
  name: string;
  cat: string;
  amount: number;
  freq: 'monthly' | 'yearly';
  businessLine?: string;
  receiptImage?: string;
  createdById?: string;
  createdBy?: User;
  updatedById?: string;
  updatedBy?: User;
  createdAt?: string;
  updatedAt?: string;
};

export type Employee = {
  id: string;
  name: string;
  role: string;
  base: number;
  transport: number;
  meal: number;
  bonus: number;
  bpjsk: number;
  bpjstk: number;
  otherCut: number;
  thp: number;
  businessLine?: string;
};

export type Budget = {
  incomeTarget: number;
  gaji: number;
  server: number;
  marketing: number;
  operasional: number;
  event: number;
};

export type InvoiceItem = {
  desc: string;
  qty: number;
  price: number;
};

export type Invoice = {
  id: string;
  num: string;
  client: string;
  clientAddr: string;
  date: string;
  due: string;
  items: InvoiceItem[];
  status: 'paid' | 'unpaid' | 'partial';
  notes: string;
  businessLine?: string;
  receiptImage?: string;
  createdById?: string;
  createdBy?: User;
  updatedById?: string;
  updatedBy?: User;
  createdAt?: string;
  updatedAt?: string;
};

export type ProfitSharePartner = {
  id: string;
  name: string;
  percentage: number;
};

export type DeductionItem = {
  id: string;
  desc: string;
  amount: number;
};

export type ProfitShareScheme = {
  id: string;
  name: string;
  
  // Base source type
  isAuto: boolean; // Uses global net income
  isProductBased?: boolean; // Uses product-based simulation
  
  // Manual Input Lumpsum
  manualBaseAmount: number;
  
  // Product Simulation Inputs
  productPrice?: number;
  productQty?: number;
  hppPerYear?: number;
  deductions?: DeductionItem[];

  companyReservePct: number;
  partners: ProfitSharePartner[];
};

export type QuotationItem = {
  id: string;
  scope: string;
  publishRate: number;
  discount: number; // percentage 0-100
  details: string;
  workDays: number;
};

export type QuotationMilestone = {
  id: string;
  scope: string;
  percentage: number; // 0-100
};

export type Quotation = {
  id: string;
  client: string;
  date: string;
  categoryName: string; // e.g., "1. Development"
  items: QuotationItem[];
  milestones: QuotationMilestone[];
  barterValue: number;
  garansiText: string;
  termsText: string;
  changeRequestText: string;
  authorizedName?: string;
  clientRepresentative?: string;
};

export type VenuePartner = {
  id: string;
  name: string;
  location: string;
  type: 'static' | 'dynamic_event';
  contactPerson: string;
  phone?: string;
  bankAccount?: string;
  bankName?: string;
  schemeType?: 'dynamic' | 'static';
  staticSharePercent?: number;
  baseSharePercent?: number;
  bonusSharePercent?: number;
  tierThreshold?: number;
  customSharePercent?: number | null;
  status: 'active' | 'inactive';
  businessLine?: string;
  lastSettlementPeriod?: string;
};

export type Page = 'dashboard' | 'cashflow' | 'subscribers' | 'projects' | 'venue_partners' | 'hpp' | 'opex' | 'salary' | 'analytics' | 'budget' | 'invoice' | 'reports' | 'profitshare' | 'quotation';

export type User = {
  id: string;
  email: string;
  name: string;
  role: 'CEO' | 'CFO' | 'MANAGER' | 'STAFF';
  createdAt?: string;
  updatedAt?: string;
};

export type Workspace = 'global' | 'niskala' | 'aksalab' | 'snapcala';

export type SukukInvestor = {
  id: string;
  name: string;
  capitalAmount: number;
  ownershipPercent: number; // Computed pro-rata %
  returnedCapital: number; // Cumulative payout reducing initial capital to BEP
  bankName?: string;
  bankAccount?: string;
  phone?: string;
};

export type SukukProject = {
  id: string;
  projectName: string;
  totalRequiredCapital: number;
  tenorMonths: number;
  preBepInvestorShare: number; // e.g. 80
  preBepNiskalaShare: number; // e.g. 20
  postBepInvestorShare: number; // e.g. 20
  postBepNiskalaShare: number; // e.g. 80
  startDate: string;
  status: 'active' | 'completed' | 'draft';
  investors: SukukInvestor[];
  businessLine?: string;
  createdAt?: string;
};

export type SukukSettlementRecord = {
  id: string;
  projectId: string;
  projectName: string;
  periodMonth: string;
  startDateTime: string;
  endDateTime: string;
  monthlyNetProfit: number;
  isBepReached: boolean; // True if cumulative payouts >= totalRequiredCapital before or during this settlement
  appliedInvestorSharePercent: number; // 80% or 20%
  appliedNiskalaSharePercent: number; // 20% or 80%
  totalInvestorPayout: number;
  totalNiskalaNet: number;
  investorPayoutBreakdown: Array<{
    investorId: string;
    investorName: string;
    ownershipPercent: number;
    payoutAmount: number;
  }>;
  notes?: string;
  status: 'paid' | 'pending';
  createdAt: string;
};

export type InvestorDisbursement = {
  id: string;
  investorName: string;
  businessLine: string;
  periodMonth: number;
  periodYear: number;
  netProfit: number;
  sharePercent: number;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  paidAt?: string;
  receiptImage?: string;
  notes?: string;
  createdById?: string;
  createdBy?: User;
  createdAt?: string;
};
