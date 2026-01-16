import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function Pipeline() {
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Pipeline</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visualize and manage your sales pipeline.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">Pipeline view coming soon.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
