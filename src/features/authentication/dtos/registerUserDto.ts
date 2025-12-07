export interface User {
  email: string;
  username: string | null;
  name: string | null;
  password: String;
  role: String | null;
  phone: String;
}

export interface UserResendOTP {
  id: string;
  email: string;
  username: string | null;
  name: string | null;
  password: String;
  role: String | null;
  phone: String;
}

export interface adminUser {
  email: string;
  username: string | null;
  name?: string;
  password: string;
  role: "superAdmin" | "admin";
  phone?: string;
}
