export interface GetUserDTO {
  page?: number;
  page_size?: number;
  role?: string;
  q?: string;
  location?: string;
}

export interface UserResponse {
  id: string;
  username: string;
  name: string;
  role: string;
  location: string;
  device: string;
  ticketIds: string[];
  created_at: string;
}

export interface GetUsersResponse {
  data: UserResponse[];
  meta: {
    total: number;
    page: number;
    page_size: number;
  };
}
