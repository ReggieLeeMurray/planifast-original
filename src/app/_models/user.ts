import { Role } from 'src/app/_models/role';

export class User {
  id: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  rol: Role;
  token?: string;
}
