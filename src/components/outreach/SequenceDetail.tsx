import { useState } from 'react';
import { ArrowLeft, Play, Pause, Plus, Mail, Clock, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  useSequence,
  useSequenceSteps,
  useSequenceEnrollments,
  useSequenceStats,
  useUpdateSequence,
  useDeleteSequenceStep,
  useAddSequenceStep,
} from '@/hooks/useSequences';
import { AddStepModal } from './AddStepModal';
import type { Tables } from '@/integrations/supabase/types';

type Sequence = Tables<'sequences'>;

interface SequenceDetailProps {
  sequence: Sequence;
  onBack: () => void;
}

export function SequenceDetail({ sequence, onBack }: SequenceDetailProps) {
  const [showAddStep, setShowAddStep] = useState(false);
  const [deleteStepId, setDeleteStepId] = useState<string | null>(null);
  
  const { data: currentSequence, isLoading: loadingSequence } = useSequence(sequence.id);
  const { data: steps, isLoading: loadingSteps } = useSequenceSteps(sequence.id);
  const { data: enrollments, isLoading: loadingEnrollments } = useSequenceEnrollments(sequence.id);
  const { data: stats } = useSequenceStats(sequence.id);
  const updateSequence = useUpdateSequence();
  const deleteStep = useDeleteSequenceStep();

  const sequenceData = currentSequence || sequence;
  const isActive = sequenceData.status === 'active';

  const handleToggleStatus = () => {
    const newStatus = isActive ? 'paused' : 'active';
    updateSequence.mutate({ id: sequence.id, status: newStatus });
  };

  const handleDeleteStep = () => {
    if (deleteStepId) {
      deleteStep.mutate({ id: deleteStepId, sequenceId: sequence.id });
      setDeleteStepId(null);
    }
  };

  const enrollmentStatusColors = {
    active: 'bg-success/20 text-success',
    paused: 'bg-warning/20 text-warning',
    completed: 'bg-primary/20 text-primary',
    bounced: 'bg-destructive/20 text-destructive',
    replied: 'bg-success/20 text-success',
  };

  if (loadingSequence) {
    return <Skeleton className="h-96" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-semibold">{sequenceData.name}</h2>
            {sequenceData.description && (
              <p className="text-sm text-muted-foreground">{sequenceData.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={isActive}
              onCheckedChange={handleToggleStatus}
              disabled={updateSequence.isPending}
            />
            <span className="text-sm text-muted-foreground">
              {isActive ? 'Active' : 'Paused'}
            </span>
          </div>
          <Badge className={isActive ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}>
            {sequenceData.status}
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{stats?.stepCount || 0}</p>
              <p className="text-sm text-muted-foreground">Email Steps</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{stats?.enrollmentCount || 0}</p>
              <p className="text-sm text-muted-foreground">Leads Enrolled</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{stats?.openRate || 0}%</p>
              <p className="text-sm text-muted-foreground">Open Rate</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{stats?.replyRate || 0}%</p>
              <p className="text-sm text-muted-foreground">Reply Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Step Builder */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Email Steps</CardTitle>
          <Button size="sm" onClick={() => setShowAddStep(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Step
          </Button>
        </CardHeader>
        <CardContent>
          {loadingSteps ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : steps?.length ? (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-border" />
              
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-start gap-4">
                    {/* Step indicator */}
                    <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>

                    {/* Step content */}
                    <div className="flex-1 rounded-lg border border-border bg-card p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Email {step.step_order}</span>
                            {step.delay_days > 0 && (
                              <Badge variant="outline" className="text-xs">
                                <Clock className="mr-1 h-3 w-3" />
                                Wait {step.delay_days} days
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm font-medium text-foreground">{step.subject}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">{step.body}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteStepId(step.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Arrow to next */}
                    {index < steps.length - 1 && (
                      <div className="absolute left-6 mt-14 flex h-8 items-center justify-center">
                        <div className="text-xs text-muted-foreground">↓</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Mail className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No email steps yet</p>
              <Button onClick={() => setShowAddStep(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Step
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enrolled Leads */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Enrolled Leads</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingEnrollments ? (
            <Skeleton className="h-40" />
          ) : enrollments?.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Current Step</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Enrolled</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollments.map((enrollment: any) => (
                  <TableRow key={enrollment.id}>
                    <TableCell className="font-medium">
                      {enrollment.leads?.business_name || 'Unknown'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {enrollment.leads?.email || '-'}
                    </TableCell>
                    <TableCell>
                      Step {enrollment.current_step} of {steps?.length || 0}
                    </TableCell>
                    <TableCell>
                      <Badge className={enrollmentStatusColors[enrollment.status as keyof typeof enrollmentStatusColors]}>
                        {enrollment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(enrollment.enrolled_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No leads enrolled in this sequence yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Step Modal */}
      <AddStepModal
        open={showAddStep}
        onOpenChange={setShowAddStep}
        sequenceId={sequence.id}
        nextOrder={(steps?.length || 0) + 1}
      />

      {/* Delete Step Confirmation */}
      <AlertDialog open={!!deleteStepId} onOpenChange={() => setDeleteStepId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Step</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this email step? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteStep} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
