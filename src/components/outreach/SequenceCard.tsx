import { Mail, Users, Eye, Reply, MoreHorizontal, Play, Pause, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSequenceStats, useUpdateSequence, useDeleteSequence } from '@/hooks/useSequences';
import type { Tables } from '@/integrations/supabase/types';

type Sequence = Tables<'sequences'>;

interface SequenceCardProps {
  sequence: Sequence;
  onClick: () => void;
}

export function SequenceCard({ sequence, onClick }: SequenceCardProps) {
  const { data: stats } = useSequenceStats(sequence.id);
  const updateSequence = useUpdateSequence();
  const deleteSequence = useDeleteSequence();

  const statusColors = {
    draft: 'bg-muted text-muted-foreground',
    active: 'bg-success/20 text-success',
    paused: 'bg-warning/20 text-warning',
  };

  const handleToggleStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = sequence.status === 'active' ? 'paused' : 'active';
    updateSequence.mutate({ id: sequence.id, status: newStatus });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteSequence.mutate(sequence.id);
  };

  return (
    <Card 
      className="group cursor-pointer transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg font-medium">{sequence.name}</CardTitle>
          {sequence.description && (
            <p className="text-sm text-muted-foreground line-clamp-1">
              {sequence.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge className={statusColors[sequence.status]}>
            {sequence.status}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleToggleStatus}>
                {sequence.status === 'active' ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Activate
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="space-y-1">
            <div className="flex items-center justify-center text-muted-foreground">
              <Mail className="h-4 w-4" />
            </div>
            <p className="text-xl font-semibold">{stats?.stepCount || 0}</p>
            <p className="text-xs text-muted-foreground">Steps</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center text-muted-foreground">
              <Users className="h-4 w-4" />
            </div>
            <p className="text-xl font-semibold">{stats?.enrollmentCount || 0}</p>
            <p className="text-xs text-muted-foreground">Enrolled</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center text-muted-foreground">
              <Eye className="h-4 w-4" />
            </div>
            <p className="text-xl font-semibold">{stats?.openRate || 0}%</p>
            <p className="text-xs text-muted-foreground">Open Rate</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center text-muted-foreground">
              <Reply className="h-4 w-4" />
            </div>
            <p className="text-xl font-semibold">{stats?.replyRate || 0}%</p>
            <p className="text-xs text-muted-foreground">Reply Rate</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
