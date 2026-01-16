import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { LeadFilters, LeadStatus } from '@/hooks/useLeads';
import { cn } from '@/lib/utils';

const industries = [
  'Technology',
  'Healthcare',
  'Finance',
  'Retail',
  'Manufacturing',
  'Real Estate',
  'Education',
  'Marketing',
  'Legal',
  'Other',
];

interface LeadsFiltersProps {
  filters: LeadFilters;
  onFiltersChange: (filters: LeadFilters) => void;
}

export function LeadsFilters({ filters, onFiltersChange }: LeadsFiltersProps) {
  const hasActiveFilters =
    filters.status !== 'all' ||
    filters.industry !== '' ||
    filters.dateRange.from !== null ||
    filters.dateRange.to !== null;

  const clearFilters = () => {
    onFiltersChange({
      ...filters,
      status: 'all',
      industry: '',
      dateRange: { from: null, to: null },
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        value={filters.status}
        onValueChange={(value) =>
          onFiltersChange({ ...filters, status: value as LeadStatus | 'all' })
        }
      >
        <SelectTrigger className="w-36 bg-muted/50 border-border">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="new">New</SelectItem>
          <SelectItem value="contacted">Contacted</SelectItem>
          <SelectItem value="qualified">Qualified</SelectItem>
          <SelectItem value="not_interested">Not Interested</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.industry}
        onValueChange={(value) =>
          onFiltersChange({ ...filters, industry: value === 'all' ? '' : value })
        }
      >
        <SelectTrigger className="w-40 bg-muted/50 border-border">
          <SelectValue placeholder="Industry" />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          <SelectItem value="all">All Industries</SelectItem>
          {industries.map((industry) => (
            <SelectItem key={industry} value={industry}>
              {industry}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-56 justify-start text-left font-normal bg-muted/50 border-border',
              !filters.dateRange.from && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {filters.dateRange.from ? (
              filters.dateRange.to ? (
                <>
                  {format(filters.dateRange.from, 'LLL dd')} -{' '}
                  {format(filters.dateRange.to, 'LLL dd')}
                </>
              ) : (
                format(filters.dateRange.from, 'LLL dd, y')
              )
            ) : (
              'Date Range'
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-popover border-border" align="start">
          <Calendar
            initialFocus
            mode="range"
            selected={{
              from: filters.dateRange.from || undefined,
              to: filters.dateRange.to || undefined,
            }}
            onSelect={(range) =>
              onFiltersChange({
                ...filters,
                dateRange: { from: range?.from || null, to: range?.to || null },
              })
            }
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="h-9 gap-1 text-muted-foreground hover:text-foreground"
        >
          <X className="h-3 w-3" />
          Clear filters
        </Button>
      )}
    </div>
  );
}
