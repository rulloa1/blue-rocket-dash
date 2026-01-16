import { UserPlus, Send, FileCheck, MessageSquare, Clock, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRecentActivities } from '@/hooks/useRecentActivities';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

type ActivityType = 'lead_created' | 'lead_updated' | 'status_changed' | 'note_added' | 'email_sent' | 'default';

const activityIcons: Record<string, typeof UserPlus> = {
  lead_created: UserPlus,
  lead_updated: FileCheck,
  status_changed: MessageSquare,
  note_added: FileCheck,
  email_sent: Send,
  default: Activity,
};

const activityColors: Record<string, string> = {
  lead_created: 'text-primary',
  lead_updated: 'text-success',
  status_changed: 'text-warning',
  note_added: 'text-muted-foreground',
  email_sent: 'text-success',
  default: 'text-muted-foreground',
};

function getActivityType(action: string): ActivityType {
  const lowerAction = action.toLowerCase();
  if (lowerAction.includes('created') || lowerAction.includes('added')) return 'lead_created';
  if (lowerAction.includes('updated') || lowerAction.includes('edited')) return 'lead_updated';
  if (lowerAction.includes('status')) return 'status_changed';
  if (lowerAction.includes('note')) return 'note_added';
  if (lowerAction.includes('email') || lowerAction.includes('sent')) return 'email_sent';
  return 'default';
}

function formatActivityDescription(action: string, description: string | null, businessName: string): string {
  if (description) return description;
  return `${action} for ${businessName}`;
}

export function ActivityFeed() {
  const { data: activities, isLoading } = useRecentActivities(10);

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h3 className="font-medium text-foreground">Recent Activity</h3>
        <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          View all
        </button>
      </div>
      <div className="divide-y divide-border">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 px-5 py-3">
              <Skeleton className="h-7 w-7 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          ))
        ) : activities && activities.length > 0 ? (
          activities.map((activity) => {
            const activityType = getActivityType(activity.action);
            const Icon = activityIcons[activityType] || activityIcons.default;
            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-muted/30"
              >
                <div className={cn('mt-0.5 rounded-md bg-muted p-1.5', activityColors[activityType] || activityColors.default)}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">
                    {formatActivityDescription(activity.action, activity.description, activity.lead_business_name)}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground">
            No recent activity yet
          </div>
        )}
      </div>
    </div>
  );
}
