export interface CreateTicketDTO {
  title: string;
  description?: string;
  priority: "low" | "mid" | "high";
  alert_Id: string;
  assigned_to?: string;
  note?: string;
}

export interface GetTicketDTO {
  page?: number;
  page_size?: number;
  status?: string;
  assigned_to?: string;
  created_by?: string;
  alert_Id?: string;
}

// export interface GetTicketDTO {
//   page?: number;
//   page_size?: number;
//   status?: string;
//   assigned_to?: string;
//   created_by?: string;
//   alert_Id?: string;
// }

export interface UpdateTicketDTO {
  data: Partial<{
    status: "open" | "in_progress" | "resolved";
    assigned_to: string;
    note: string;
    priority: "low" | "mid" | "high";
  }>;
}
