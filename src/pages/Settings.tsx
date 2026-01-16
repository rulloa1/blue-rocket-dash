import { Settings as SettingsIcon } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileTab } from '@/components/settings/ProfileTab';
import { IntegrationsTab } from '@/components/settings/IntegrationsTab';
import { EmailTab } from '@/components/settings/EmailTab';
import { NotificationsTab } from '@/components/settings/NotificationsTab';
import { TeamTab } from '@/components/settings/TeamTab';

export default function Settings() {
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
            <SettingsIcon className="h-6 w-6" />
            Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your account, integrations, and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>

          <div className="mt-6 rounded-lg border border-border bg-card p-6">
            <TabsContent value="profile" className="mt-0">
              <ProfileTab />
            </TabsContent>
            <TabsContent value="integrations" className="mt-0">
              <IntegrationsTab />
            </TabsContent>
            <TabsContent value="email" className="mt-0">
              <EmailTab />
            </TabsContent>
            <TabsContent value="notifications" className="mt-0">
              <NotificationsTab />
            </TabsContent>
            <TabsContent value="team" className="mt-0">
              <TeamTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
