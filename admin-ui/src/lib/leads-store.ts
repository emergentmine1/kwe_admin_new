// Leads captured from the public Instant Quote flow. Browser storage until a leads API exists.
const STORAGE_KEY = 'kwe_leads_v2';
const DAY_MS = 86_400_000;

export const SALES_TEAMS = [
  { id: 'apac', name: 'APAC Sales Team' },
  { id: 'amer', name: 'Americas Sales Team' },
  { id: 'emea', name: 'EMEA Sales Team' },
  { id: 'enterprise', name: 'Enterprise Accounts' },
];

export const LEAD_STATUSES = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export interface Place {
  code: string;
  city: string;
  country: string;
  countryCode: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  jobTitle?: string;
  userType: 'new' | 'existing';
  salesTeamId: string;
  salesTeamName: string;
  status: LeadStatus;
  origin: Place;
  destination: Place;
  cargoMode: 'fcl' | 'lcl' | 'air';
  shippingMode: 'ocean' | 'air';
  containers: { type: string; count: number }[];
  shipmentTotals: { units: number; cft: number; lb: number };
  readyDate: string;
  createdAt: string;
  notes?: string;
  commodity?: string;
  exporter?: {
    exporterName?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    countryCode?: string;
  } | null;
}

const dateIn = (days: number) => new Date(Date.now() + days * DAY_MS).toISOString().split('T')[0];
const ago = (ms: number) => new Date(Date.now() - ms).toISOString();

function seed(): Lead[] {
  return [
    {
      id: 'LEAD-000001', name: 'Priya Sharma', email: 'priya.sharma@acmeimports.com', phone: '+1 415 555 0110',
      company: 'Acme Imports LLC', jobTitle: 'Head of Logistics', userType: 'existing', salesTeamId: 'amer',
      salesTeamName: 'Americas Sales Team', status: 'contacted',
      origin: { code: 'CNSHA', city: 'Shanghai', country: 'China', countryCode: 'CN' },
      destination: { code: 'USLAX', city: 'Los Angeles', country: 'USA', countryCode: 'US' },
      cargoMode: 'fcl', shippingMode: 'ocean', containers: [{ type: '40HQ', count: 2 }],
      shipmentTotals: { units: 2, cft: 0, lb: 0 }, readyDate: dateIn(5), createdAt: ago(3 * DAY_MS),
      notes: 'Repeat customer — quoted 2 × 40HQ CN→US.',
    },
    {
      id: 'LEAD-000002', name: 'Michael Chen', email: 'm.chen@globex-trading.com', phone: '+65 8888 2210',
      company: 'Globex Trading', jobTitle: 'Supply Chain Manager', userType: 'new', salesTeamId: 'apac',
      salesTeamName: 'APAC Sales Team', status: 'new',
      origin: { code: 'SGSIN', city: 'Singapore', country: 'Singapore', countryCode: 'SG' },
      destination: { code: 'NLRTM', city: 'Rotterdam', country: 'Netherlands', countryCode: 'NL' },
      cargoMode: 'lcl', shippingMode: 'ocean', containers: [],
      shipmentTotals: { units: 12, cft: 320, lb: 1400 }, readyDate: dateIn(10), createdAt: ago(6 * 3_600_000),
      notes: 'First-time visitor from LinkedIn campaign.',
    },
    {
      id: 'LEAD-000003', name: 'Sarah Johnson', email: 'sarah@northwind.co', phone: '+44 20 7946 0993',
      company: 'Northwind Co', jobTitle: 'Procurement Lead', userType: 'existing', salesTeamId: 'emea',
      salesTeamName: 'EMEA Sales Team', status: 'qualified',
      origin: { code: 'DEHAM', city: 'Hamburg', country: 'Germany', countryCode: 'DE' },
      destination: { code: 'USNYC', city: 'New York', country: 'USA', countryCode: 'US' },
      cargoMode: 'fcl', shippingMode: 'ocean', containers: [{ type: '20GP', count: 1 }, { type: '40GP', count: 3 }],
      shipmentTotals: { units: 4, cft: 0, lb: 0 }, readyDate: dateIn(21), createdAt: ago(4 * DAY_MS),
      notes: 'Mixed container load — expecting proposal by Friday.',
    },
  ];
}

const writeAll = (list: Lead[]) => localStorage.setItem(STORAGE_KEY, JSON.stringify(list));

export function listLeads(): Lead[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    if (Array.isArray(value) && value.length) return value as Lead[];
  } catch {
    // corrupt storage — reseed below
  }
  const seeded = seed();
  writeAll(seeded);
  return seeded;
}

export const updateLead = (id: string, patch: Partial<Lead>) =>
  writeAll(listLeads().map((l) => (l.id === id ? { ...l, ...patch } : l)));

export const deleteLead = (id: string) => writeAll(listLeads().filter((l) => l.id !== id));

// Follow-up SLA: a lead in `new` or `contacted` becomes overdue after 48h.
const OVERDUE_MS = 48 * 3_600_000;
export const ageHours = (lead: Lead) => Math.round((Date.now() - new Date(lead.createdAt).getTime()) / 3_600_000);
export const isOverdue = (lead: Lead) =>
  ['new', 'contacted'].includes(lead.status) && Date.now() - new Date(lead.createdAt).getTime() > OVERDUE_MS;
