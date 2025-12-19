import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { can } from '@/lib/can';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    ClipboardCheck,
    Clock,
    Dumbbell,
    Folder,
    GraduationCap,
    Group,
    LayoutGrid,
    LibraryBig,
    PencilLine,
    PersonStanding,
    School,
    Trophy,
    UserCheck,
    UserCog,
    UserPlus,
    Users,
    LayoutDashboard,
    Newspaper,
    BarChart3,
    Heart,
    Mail,
} from 'lucide-react';
import AppLogo from './app-logo';

type AuthUser = {
    name: string;
    email: string;
    roles: string[];
    permissions: string[]; // ✅ added to fix TS error
};

type PageProps = {
    auth: {
        user: AuthUser;
    };
};

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const { props } = usePage<PageProps>();
    const user = props.auth.user;
    const roles = user?.roles || [];

    const isSuperAdmin = roles.includes('super_admin');
    const isSchoolAdmin =
        roles.includes('Admin') || roles.includes('school-admin');
    const isCoach = roles.includes('Coach');

    const mainNavItems: NavItem[] = [
        // ------------------------------ TOP PRIORITY: KPI & WELLNESS ------------------------------
        isSuperAdmin && {
            title: 'KPI Dashboard',
            href: '/kpi-dashboard/school',
            icon: BarChart3,
        },

        isCoach && {
            title: 'Team KPI',
            href: '/kpi-dashboard/team',
            icon: BarChart3,
        },

        isSchoolAdmin && {
            title: 'School KPI',
            href: '/kpi-dashboard/school',
            icon: BarChart3,
        },

        isCoach && {
            title: 'Coach Dashboard',
            href: '/coach/dashboard',
            icon: LayoutDashboard,
        },

        isSchoolAdmin && {
            title: 'Admin Dashboard',
            href: '/admin/dashboard',
            icon: LayoutDashboard,
        },


        (isSuperAdmin || isSchoolAdmin) && {
            title: 'News Feed',
            href: '/news',
            icon: Newspaper,
        },
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
            hidden: true,
        },
        can('users.view') && {
            title: 'Users',
            href: '/users',
            icon: Users,
        },
        // can('roles.view') && {
        //     title: 'Roles',
        //     href: '/roles',
        //     icon: UserCheck,
        // },
        can('courses.view') && {
            title: 'Courses',
            href: '/courses',
            icon: LibraryBig,
        },
        can('sections.view') && {
            title: 'Sections',
            href: '/sections',
            icon: Group,
        },
        can('course-sections.view') && {
            title: 'Course Sections',
            href: '/course-sections',
            icon: BookOpen,
        },
        can('class-schedules.view') && {
            title: 'Class Schedules',
            href: '/class-schedules',
            icon: Clock,
        },

        can('professor-course-sections.view') && {
            title: 'Assign Professors',
            href: '/professor-course-sections',
            icon: UserCheck,
        },

        can('student-course-sections.view') && {
            title: 'Enroll Students',
            href: '/student-course-sections',
            icon: ClipboardCheck,
        },

        can('scholarships.view') && {
            title: 'Scholarship Settings',
            href: '/scholarships',
            icon: GraduationCap,
        },

        // ------------------------------ ATHELETICS SIDE ------------------------------

        can('sports.view') && {
            title: 'Sports',
            href: '/sports',
            icon: Trophy,
        },

        can('sport-teams.view') && {
            title: 'Sport Teams',
            href: '/sport-teams',
            icon: PersonStanding,
        },

        can('coach-assignments.view') && {
            title: 'Assign Coach',
            href: '/coach-assignments',
            icon: UserCheck,
        },

        can('student-sport-teams.view') && {
            title: 'Manage Team Members',
            href: '/student-sport-teams/landing',
            icon: UserPlus,
        },

        can('programs.view') && {
            title: 'Training Programs',
            href: '/programs/landing',
            icon: Dumbbell,
        },

        can('exercise-logs.view') && {
            title: 'Exercise Logs',
            href: '/exercise-logs',
            icon: PencilLine,
        },

        // ------------------------------ ADMIN ONLY ------------------------------
        isSchoolAdmin && !isSuperAdmin && {
            title: 'Wellness Logs',
            href: '/admin/wellness-logs',
            icon: Heart,
        },

        // ------------------------------ COACH ONLY ------------------------------
        isCoach && {
            title: 'Wellness Logs',
            href: '/coach/wellness-logs',
            icon: Heart,
        },

        // ------------------------------ SUPER ADMIN ------------------------------
        isSuperAdmin &&
            can('super-admin.view') && {
                title: 'Super Admin Dashboard',
                href: '/super-admin/dashboard',
                icon: LayoutDashboard, 
            },

        isSuperAdmin &&
            can('super-admin.view') && {
                title: 'Wellness Logs',
                href: '/super-admin/wellness-logs',
                icon: Heart,
            },

        isSuperAdmin &&
            can('super-admin.view') && {
                title: 'Demo Requests',
                href: '/super-admin/demo-requests',
                icon: Mail,
            },

        isSuperAdmin &&
            can('schools.view') && {
                title: 'Schools',
                href: '/schools',
                icon: School,
            },
        isSuperAdmin &&
            can('school-admins.view') && {
                title: 'School Admin',
                href: '/school-admins',
                icon: UserCog,
            },
        isSuperAdmin &&
            can('roles.view') && {
                title: 'Roles',
                href: '/roles',
                icon: UserCheck,
            },
    ].filter(Boolean) as NavItem[];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
