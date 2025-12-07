export interface AlertDTO {
  title: string;
  description?: string | null;
  status: "active" | "investigating" | "resolved";
  source: "phone" | "app" | "web";
  latitude: number;
  longitude: number;
  state: string;
  lga: string;
  recipients: string[];
}

export interface GetAlertDTO {
  page: number;
  page_size: number;
  status?: string;
  state?: string;
  lga?: string;
  from?: string;
  to?: string;
}

export interface GetAlerttDTO {
  page?: number | null;
  page_size?: number | null;
  status?: string | null;
  state?: string | null;
  lga?: string | null;
  from?: string | null;
  to?: string | null;
}

export interface UpdateAlertDTO {
  id: string;
  data: Partial<{
    status: "active" | "investigating" | "resolved";
    assigned_unit: string;
  }>;
}
