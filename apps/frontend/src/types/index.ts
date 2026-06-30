export type LeadStatus =
  | "LEAD"
  | "CONTATO_FEITO"
  | "FORMULARIO_ENVIADO"
  | "FORMULARIO_PREENCHIDO"
  | "EM_ANALISE"
  | "ANALISADO"
  | "REUNIAO_AGENDADA"
  | "ESCOPO_DEFINIDO"
  | "PROPOSTA_ENVIADA"
  | "CONTRATO_ASSINADO"
  | "PAGAMENTO_RECEBIDO"
  | "PROJETO_INICIADO";

export interface Lead {
  id: string;
  clientName: string;
  projectName: string;
  email?: string;
  phone?: string;
  projectType?: string;
  estimatedValue?: number;
  status: LeadStatus;
  briefingProgress: number; // 0-12
  kanbanColumn: number;
  briefingToken?: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  notes?: string;
}

export interface LeadEvent {
  id: string;
  leadId: string;
  type: string;
  description: string;
  createdAt: string;
}

export interface LeadNote {
  id: string;
  leadId: string;
  content: string;
  createdAt: string;
}

export interface BriefingData {
  step1?: {
    companyName?: string;
    cnpj?: string;
    contactName?: string;
    email?: string;
    phone?: string;
    website?: string;
  };
  step2?: {
    problem?: string;
    targetAudience?: string;
    valueProposition?: string;
    expectedResults?: string;
  };
  step3?: {
    types?: string[];
    otherType?: string;
  };
  step4?: {
    features?: string[];
    customFeatures?: string[];
  };
  step5?: Record<string, string>;
  step6?: {
    performance?: number;
    security?: string;
    concurrentUsers?: number;
    accessibility?: string[];
  };
  step7?: {
    integrations?: string[];
    customIntegrations?: string[];
  };
  step8?: {
    referenceUrls?: string[];
    primaryColor?: string;
    secondaryColor?: string;
    tertiaryColor?: string;
    visualStyle?: string;
    uploadedFiles?: string[];
  };
  step9?: {
    desiredDeadline?: string;
    criticalDeadline?: string;
    importantDates?: { label: string; date: string }[];
    deadlineFlexibility?: string;
  };
  step10?: {
    budgetRange?: string;
    budgetNotes?: string;
  };
  step11?: {
    additionalNotes?: string;
    uploadedDocs?: string[];
  };
  step12?: {
    signatureType?: "draw" | "text";
    signatureData?: string;
    confirmed?: boolean;
  };
}

export interface Briefing {
  id: string;
  token: string;
  leadId: string;
  lead: Lead;
  data: BriefingData;
  currentStep: number;
  completedSteps: number[];
  submittedAt?: string;
  expiresAt?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthResponse {
  access_token: string;
  user: AuthUser;
}
