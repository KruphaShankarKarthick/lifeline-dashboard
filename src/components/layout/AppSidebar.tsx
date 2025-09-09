import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import {
  LayoutDashboard,
  AlertTriangle,
  Heart,
  Ambulance,
  Users,
  Settings,
  LogOut,
  Shield,
  MessageSquare,
  MapPin,
  Activity,
} from 'lucide-react';

const menuItems = [
  { 
    title: 'Dashboard', 
    url: '/dashboard', 
    icon: LayoutDashboard,
    roles: ['admin', 'dispatcher', 'responder']
  },
  { 
    title: 'Active Emergencies', 
    url: '/emergencies', 
    icon: AlertTriangle,
    roles: ['admin', 'dispatcher', 'responder']
  },
  { 
    title: 'Medical IDs', 
    url: '/medical-ids', 
    icon: Heart,
    roles: ['admin', 'dispatcher', 'responder']
  },
  { 
    title: 'Ambulances', 
    url: '/ambulances', 
    icon: Ambulance,
    roles: ['admin', 'dispatcher']
  },
  { 
    title: 'Alert Logs', 
    url: '/alerts', 
    icon: Activity,
    roles: ['admin', 'dispatcher']
  },
  { 
    title: 'Communication', 
    url: '/communication', 
    icon: MessageSquare,
    roles: ['admin', 'dispatcher', 'responder']
  },
  { 
    title: 'Live Map', 
    url: '/map', 
    icon: MapPin,
    roles: ['admin', 'dispatcher']
  },
  { 
    title: 'Users', 
    url: '/users', 
    icon: Users,
    roles: ['admin']
  },
  { 
    title: 'Settings', 
    url: '/settings', 
    icon: Settings,
    roles: ['admin', 'dispatcher', 'responder']
  },
];

export function AppSidebar() {
  const { collapsed } = useSidebar();
  const { user, signOut } = useAuth();
  const location = useLocation();

  // Get user role from metadata (you might want to fetch from profiles table instead)
  const userRole = user?.user_metadata?.role || 'responder';
  
  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(userRole)
  );

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <Sidebar className={collapsed ? 'w-14' : 'w-64'} collapsible>
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <Shield className="h-6 w-6 text-primary" />
            <Heart className="h-6 w-6 text-emergency" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-lg font-semibold">Lifeline</h2>
              <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                          isActive
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                            : 'hover:bg-sidebar-accent/50'
                        }`
                      }
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="w-full justify-start"
        >
          <LogOut className="h-4 w-4 mr-2" />
          {!collapsed && 'Sign Out'}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}