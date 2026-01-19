import { useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Send,
  GitBranch,
  FileText,
  Settings,
  LayoutTemplate,
  Zap,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const navItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Leads', url: '/leads', icon: Users },
  { title: 'Outreach', url: '/outreach', icon: Send },
  { title: 'Pipeline', url: '/pipeline', icon: GitBranch },
  { title: 'Proposals', url: '/proposals', icon: FileText },
  { title: 'Templates', url: '/templates', icon: LayoutTemplate },
  { title: 'Settings', url: '/settings', icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="border-b border-border px-4 py-4">
        <Link to="/" className="flex items-center gap-3">
          {/* Logo removed by user request */}
          {!isCollapsed && (
            <span className="text-lg font-semibold text-foreground">
              RoysCompany
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      className={cn(
                        'transition-colors duration-150',
                        isActive
                          ? 'bg-sidebar-accent text-foreground'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground'
                      )}
                    >
                      <Link to={item.url} className="flex items-center gap-3">
                        <item.icon className={cn('h-4 w-4', isActive && 'text-primary')} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border px-4 py-4">
        {!isCollapsed && (
          <div className="text-xs text-muted-foreground">
            AI Automation Agency
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
