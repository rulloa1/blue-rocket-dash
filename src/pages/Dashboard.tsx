import { Users, UserCheck, FileText, Building2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { QuickActions } from '@/components/dashboard/QuickActions';

const stats = [
  {
    title: 'Total Leads',
    value: '2,847',
    change: '+12.5% from last month',
    changeType: 'positive' as const,
    icon: Users,
  },
  {
    title: 'Qualified Leads',
    value: '483',
    change: '+8.2% from last month',
    changeType: 'positive' as const,
    icon: UserCheck,
  },
  {
    title: 'Proposals Sent',
    value: '127',
    change: '+23.1% from last month',
    changeType: 'positive' as const,
    icon: FileText,
  },
  {
    title: 'Active Clients',
    value: '64',
    change: '+4 new this month',
    changeType: 'positive' as const,
    icon: Building2,
  },
];

export default function Dashboard() {
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
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
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
