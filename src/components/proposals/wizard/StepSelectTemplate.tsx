import { Globe, Bot, Mic, FileEdit, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useProposalTemplates, type ProposalTemplate } from '@/hooks/useProposals';

interface StepSelectTemplateProps {
  selected: ProposalTemplate | null;
  onSelect: (template: ProposalTemplate) => void;
}

const TEMPLATE_ICONS: Record<string, React.ReactNode> = {
  'Website Package': <Globe className="h-8 w-8" />,
  'Automation Package': <Bot className="h-8 w-8" />,
  'Voice Agent Package': <Mic className="h-8 w-8" />,
};

export function StepSelectTemplate({ selected, onSelect }: StepSelectTemplateProps) {
  const { data: templates, isLoading } = useProposalTemplates();

  // Add custom template option
  const customTemplate: ProposalTemplate = {
    id: 'custom',
    user_id: null,
    name: 'Custom',
    description: 'Start from scratch with a blank proposal',
    default_services: [],
    default_terms: 'Payment terms: 50% upfront, 50% upon completion.',
    created_at: '',
    updated_at: '',
  };

  const allTemplates = [...(templates || []), customTemplate];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Select a Template</h2>
        <p className="text-muted-foreground">
          Choose a pre-built template or start from scratch
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {allTemplates.map((template) => {
          const isSelected = selected?.id === template.id;
          const icon = TEMPLATE_ICONS[template.name] || <FileEdit className="h-8 w-8" />;

          return (
            <Card
              key={template.id}
              className={cn(
                'cursor-pointer transition-all hover:border-primary/50',
                isSelected && 'border-primary ring-2 ring-primary/20'
              )}
              onClick={() => onSelect(template)}
            >
              <CardHeader className="relative">
                {isSelected && (
                  <div className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                    <Check className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
                <div className={cn(
                  'flex h-14 w-14 items-center justify-center rounded-lg mb-2',
                  isSelected ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                )}>
                  {icon}
                </div>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {template.default_services.length > 0 ? (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Includes:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {template.default_services.slice(0, 3).map((service, i) => (
                        <li key={i} className="truncate">• {service.description}</li>
                      ))}
                      {template.default_services.length > 3 && (
                        <li className="text-primary">
                          +{template.default_services.length - 3} more services
                        </li>
                      )}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Add your own services and pricing
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
