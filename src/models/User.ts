export interface Role {
    id: number;
    name: string | null;
    active: boolean;
}

export interface User {
    id: number;
    name: string;
    email: string;
    active: boolean | null;
    id_role: number;
    role: Role;
}

export interface UserForm {
    name: string;
    email: string;
    password: string;
    id_role: number;
}

export interface UserUpdateForm {
    name?: string;
    email?: string;
    password?: string;
    id_role?: number;
    active?: boolean;
}