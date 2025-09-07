export interface CreateTicketDTO {
  title: string;
  description?: string;
  priority: string;
  alert_id: string;
  assigned_to?: string;
}

export interface GetTicketDTO {
  page?: number | null;
  page_size?: number | null;
  status?: string | null;
  assigned_to?: string | null;
  created_by?: string | null;
}
