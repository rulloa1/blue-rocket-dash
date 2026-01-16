import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function Leads() {
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Leads</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and track your sales leads.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">Lead management coming soon.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
