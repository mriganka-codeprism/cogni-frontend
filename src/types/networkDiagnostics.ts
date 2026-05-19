export type CheckStatus = "pending" | "running" | "pass" | "warn" | "fail";

export interface DiagnosticCheck {
  id: string;
  name: string;
  description: string;
  status: CheckStatus;
  value?: string | number;
  unit?: string;
  details?: string;
  recommendation?: string;
  impactedFeature?: string;
  thresholds?: string;
}

export interface DiagnosticCategory {
  id: string;
  title: string;
  checks: DiagnosticCheck[];
}
