import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LeadsTable } from '@/components/leads/LeadsTable';
import { LeadsFilters } from '@/components/leads/LeadsFilters';
import { LeadsTableSkeleton } from '@/components/leads/LeadsTableSkeleton';
import { LeadsEmptyState } from '@/components/leads/LeadsEmptyState';
import { AddLeadModal } from '@/components/leads/AddLeadModal';
import { LeadDrawer } from '@/components/leads/LeadDrawer';
import { BulkActionsBar } from '@/components/leads/BulkActionsBar';
import { useLeads, LeadFilters } from '@/hooks/useLeads';

export default function Leads() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<LeadFilters>({
    search: '',
    status: 'all',
    source: 'all',
    industry: '',
    dateRange: { from: null, to: null },
  });

  const { data: leads = [], isLoading } = useLeads(filters);

  const handleSearchChange = (value: string) => {
    setFilters({ ...filters, search: value });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Leads</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and track your sales leads.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-64 bg-muted/50 border-border pl-9"
              />
            </div>
            <Button onClick={() => setShowAddModal(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Lead
            </Button>
          </div>
        </div>

        {/* Filters */}
        <LeadsFilters filters={filters} onFiltersChange={setFilters} />

        {/* Bulk Actions Bar */}
        {selectedIds.length > 0 && (
          <BulkActionsBar
            selectedIds={selectedIds}
            leads={leads}
            onClearSelection={() => setSelectedIds([])}
          />
        )}

        {/* Table / Loading / Empty State */}
        {isLoading ? (
          <LeadsTableSkeleton />
        ) : leads.length === 0 ? (
          <LeadsEmptyState onAddLead={() => setShowAddModal(true)} />
        ) : (
          <LeadsTable
            leads={leads}
            selectedIds={selectedIds}
            onSelectChange={setSelectedIds}
            onViewLead={setSelectedLeadId}
          />
        )}

        {/* Add Lead Modal */}
        <AddLeadModal open={showAddModal} onOpenChange={setShowAddModal} />

        {/* Lead Detail Drawer */}
        <LeadDrawer
          leadId={selectedLeadId}
          open={!!selectedLeadId}
          onOpenChange={(open) => !open && setSelectedLeadId(null)}
        />
      </div>
    </DashboardLayout>
  );
}
