import { Users, UserCheck, FileText, Building2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  const statCards = [
    {
      title: 'Total Leads',
      value: stats?.totalLeads ?? 0,
      icon: Users,
    },
    {
      title: 'Qualified Leads',
      value: stats?.qualifiedLeads ?? 0,
      icon: UserCheck,
    },
    {
      title: 'Proposals Sent',
      value: stats?.proposalsSent ?? 0,
      icon: FileText,
    },
    {
      title: 'Active Clients',
      value: stats?.activeClients ?? 0,
      icon: Building2,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back. Here's what's happening with your leads.
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-[120px] rounded-lg" />
              ))}
            </>
          ) : (
            statCards.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))
          )}
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Activity Feed */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ActivityFeed />
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="mb-4 font-medium text-foreground">Pipeline Overview</h3>
            <div className="space-y-4">
              {[
                { stage: 'Discovery', count: 45, color: 'bg-primary' },
                { stage: 'Qualification', count: 32, color: 'bg-primary/80' },
                { stage: 'Proposal', count: 18, color: 'bg-primary/60' },
                { stage: 'Negotiation', count: 12, color: 'bg-primary/40' },
                { stage: 'Closed Won', count: 8, color: 'bg-success' },
              ].map((stage) => (
                <div key={stage.stage} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{stage.stage}</span>
                    <span className="text-foreground font-medium">{stage.count}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className={`h-2 rounded-full ${stage.color} transition-all`}
                      style={{ width: `${(stage.count / 45) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
