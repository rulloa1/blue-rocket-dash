import { Plus, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SequenceCard } from './SequenceCard';
import { useSequences } from '@/hooks/useSequences';
import type { Tables } from '@/integrations/supabase/types';

type Sequence = Tables<'sequences'>;

interface SequencesListProps {
  onCreateClick: () => void;
  onSequenceClick: (sequence: Sequence) => void;
}

export function SequencesList({ onCreateClick, onSequenceClick }: SequencesListProps) {
  const { data: sequences, isLoading } = useSequences();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!sequences?.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/50 py-16">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-1">No sequences yet</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Create your first email sequence to start automating outreach
        </p>
        <Button onClick={onCreateClick}>
          <Plus className="mr-2 h-4 w-4" />
          Create Sequence
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {sequences.map((sequence) => (
        <SequenceCard
          key={sequence.id}
          sequence={sequence}
          onClick={() => onSequenceClick(sequence)}
        />
      ))}
    </div>
  );
}
