import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}



export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    roles: Role[];
    school?: School; // ✅ Added this to fix school.name error
    [key: string]: unknown;
}

// ------------------------- ADDED TYPES ---------------------------
export interface Role {
    id: number;
    name: string;
    permissions: Permission[];
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

export interface RolePermission {
    id: number;
    name: string;
    permission?: string[];
    guard_name?: string;
    created_at?: string;
    updated_at?: string;
    [key: string]: unknown;
}

// ✅ Optional: Permission type if used
export interface Permission {
    id: number;
    name: string;
    guard_name?: string;
    created_at?: string;
    updated_at?: string;
    [key: string]: unknown;
}

export interface School {
    id: number;
    name: string;
    address?: string;
    code?: string;
    active?: boolean;
    created_at?: string;
    updated_at?: string;
    [key: string]: unknown;
}