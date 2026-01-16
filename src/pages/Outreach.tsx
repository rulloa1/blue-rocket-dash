import { useState } from 'react';
import { Plus } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SequencesList } from '@/components/outreach/SequencesList';
import { SequenceDetail } from '@/components/outreach/SequenceDetail';
import { CreateSequenceModal } from '@/components/outreach/CreateSequenceModal';
import { TemplatesList } from '@/components/outreach/TemplatesList';
import { CreateTemplateModal } from '@/components/outreach/CreateTemplateModal';
import type { Tables } from '@/integrations/supabase/types';

type Sequence = Tables<'sequences'>;

export default function Outreach() {
  const [activeTab, setActiveTab] = useState('sequences');
  const [showCreateSequence, setShowCreateSequence] = useState(false);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [selectedSequence, setSelectedSequence] = useState<Sequence | null>(null);

  // If viewing a sequence detail, show that instead of the list
  if (selectedSequence) {
    return (
      <DashboardLayout>
        <div className="animate-fade-in">
          <SequenceDetail
            sequence={selectedSequence}
            onBack={() => setSelectedSequence(null)}
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Outreach</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Automate your email sequences and campaigns
            </p>
          </div>
          <Button
            onClick={() =>
              activeTab === 'sequences'
                ? setShowCreateSequence(true)
                : setShowCreateTemplate(true)
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            {activeTab === 'sequences' ? 'Create Sequence' : 'Create Template'}
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="sequences">Sequences</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="sequences" className="mt-6">
            <SequencesList
              onCreateClick={() => setShowCreateSequence(true)}
              onSequenceClick={setSelectedSequence}
            />
          </TabsContent>

          <TabsContent value="templates" className="mt-6">
            <TemplatesList onCreateClick={() => setShowCreateTemplate(true)} />
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <CreateSequenceModal
          open={showCreateSequence}
          onOpenChange={setShowCreateSequence}
        />
        <CreateTemplateModal
          open={showCreateTemplate}
          onOpenChange={setShowCreateTemplate}
        />
      </div>
    </DashboardLayout>
  );
}
