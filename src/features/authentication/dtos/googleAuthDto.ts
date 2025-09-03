interface User {
  email: string;
  username: String;
  lastname: String;
  firstname: String;
  avatar: String | null;
}

export interface GoogleAuthDTO<T = any> {
  success: boolean;
  message: string;
  token: string;
  data: T;
}
