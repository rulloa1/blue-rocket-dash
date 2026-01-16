import { useState } from 'react';
import { Plus, Trash2, Users, Crown, Shield, Eye, Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { useAuth } from '@/contexts/AuthContext';
import {
  useTeamInvites,
  useTeamMembers,
  useCreateTeamInvite,
  useDeleteTeamInvite,
  useUpdateTeamMemberRole,
  useRemoveTeamMember,
} from '@/hooks/useSettings';

const ROLE_ICONS = {
  admin: <Crown className="h-4 w-4" />,
  member: <Shield className="h-4 w-4" />,
  viewer: <Eye className="h-4 w-4" />,
};

const ROLE_LABELS = {
  admin: 'Admin',
  member: 'Member',
  viewer: 'Viewer',
};

const ROLE_DESCRIPTIONS = {
  admin: 'Full access to all features',
  member: 'Can manage leads, deals, and proposals',
  viewer: 'Read-only access',
};

export function TeamTab() {
  const { user } = useAuth();
  const { data: invites, isLoading: loadingInvites } = useTeamInvites();
  const { data: members, isLoading: loadingMembers } = useTeamMembers();
  const createInvite = useCreateTeamInvite();
  const deleteInvite = useDeleteTeamInvite();
  const updateRole = useUpdateTeamMemberRole();
  const removeMember = useRemoveTeamMember();

  const [showInvite, setShowInvite] = useState(false);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [newInvite, setNewInvite] = useState({
    email: '',
    role: 'member' as 'admin' | 'member' | 'viewer',
  });

  const handleInvite = async () => {
    if (!newInvite.email) return;
    await createInvite.mutateAsync(newInvite);
    setShowInvite(false);
    setNewInvite({ email: '', role: 'member' });
  };

  const handleRemove = () => {
    if (removeId) {
      removeMember.mutate(removeId);
      setRemoveId(null);
    }
  };

  const isLoading = loadingInvites || loadingMembers;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Team Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members
          </h3>
          <p className="text-sm text-muted-foreground">
            Manage your team and their access levels
          </p>
        </div>
        <Button onClick={() => setShowInvite(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </div>

      {/* Current User (Owner) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-4">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">{user?.email}</p>
                <Badge className="bg-primary/20 text-primary">Owner</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Full access to all features</p>
            </div>
          </div>
        </div>

        {/* Team Members */}
        {members?.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between p-4 rounded-lg border border-border bg-card"
          >
            <div className="flex items-center gap-4">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{member.member_id.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{member.member_id}</p>
                <p className="text-sm text-muted-foreground">
                  {ROLE_DESCRIPTIONS[member.role]}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={member.role}
                onValueChange={(value: 'admin' | 'member' | 'viewer') =>
                  updateRole.mutate({ id: member.id, role: value })
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      {ROLE_ICONS.admin}
                      Admin
                    </div>
                  </SelectItem>
                  <SelectItem value="member">
                    <div className="flex items-center gap-2">
                      {ROLE_ICONS.member}
                      Member
                    </div>
                  </SelectItem>
                  <SelectItem value="viewer">
                    <div className="flex items-center gap-2">
                      {ROLE_ICONS.viewer}
                      Viewer
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setRemoveId(member.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {members?.length === 0 && !invites?.length && (
          <div className="text-center py-8 border border-dashed border-border rounded-lg">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No team members yet</p>
            <p className="text-sm text-muted-foreground">Invite colleagues to collaborate</p>
          </div>
        )}
      </div>

      {/* Pending Invites */}
      {invites && invites.length > 0 && (
        <div>
          <h4 className="font-medium mb-3">Pending Invites</h4>
          <div className="space-y-2">
            {invites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between p-3 rounded-lg border border-dashed border-border"
              >
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{invite.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Invited as {ROLE_LABELS[invite.role]}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteInvite.mutate(invite.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  Cancel
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Dialog */}
      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invite to add a new member to your team
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                type="email"
                value={newInvite.email}
                onChange={(e) => setNewInvite({ ...newInvite, email: e.target.value })}
                placeholder="colleague@company.com"
              />
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={newInvite.role}
                onValueChange={(value: 'admin' | 'member' | 'viewer') =>
                  setNewInvite({ ...newInvite, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      {ROLE_ICONS.admin}
                      <div>
                        <p>Admin</p>
                        <p className="text-xs text-muted-foreground">
                          {ROLE_DESCRIPTIONS.admin}
                        </p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="member">
                    <div className="flex items-center gap-2">
                      {ROLE_ICONS.member}
                      <div>
                        <p>Member</p>
                        <p className="text-xs text-muted-foreground">
                          {ROLE_DESCRIPTIONS.member}
                        </p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="viewer">
                    <div className="flex items-center gap-2">
                      {ROLE_ICONS.viewer}
                      <div>
                        <p>Viewer</p>
                        <p className="text-xs text-muted-foreground">
                          {ROLE_DESCRIPTIONS.viewer}
                        </p>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInvite(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite} disabled={createInvite.isPending}>
              Send Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation */}
      <AlertDialog open={!!removeId} onOpenChange={() => setRemoveId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this team member? They will lose access immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemove} className="bg-destructive text-destructive-foreground">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
