import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { StepSelectTemplate } from './wizard/StepSelectTemplate';
import { StepClientDetails } from './wizard/StepClientDetails';
import { StepCustomize } from './wizard/StepCustomize';
import { StepPreview } from './wizard/StepPreview';
import { useCreateProposal, type LineItem, type ProposalTemplate, type ProposalStatus } from '@/hooks/useProposals';

interface CreateProposalWizardProps {
  onClose: () => void;
  onComplete: () => void;
}

export interface ProposalFormData {
  template: ProposalTemplate | null;
  client_name: string;
  client_email: string;
  client_business: string;
  lead_id?: string;
  deal_id?: string;
  line_items: LineItem[];
  discount_type: 'percentage' | 'fixed' | null;
  discount_value: number;
  delivery_date: string;
  terms: string;
  notes: string;
}

const STEPS = [
  { id: 1, title: 'Select Template' },
  { id: 2, title: 'Client Details' },
  { id: 3, title: 'Customize' },
  { id: 4, title: 'Preview' },
];

export function CreateProposalWizard({ onClose, onComplete }: CreateProposalWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProposalFormData>({
    template: null,
    client_name: '',
    client_email: '',
    client_business: '',
    line_items: [],
    discount_type: null,
    discount_value: 0,
    delivery_date: '',
    terms: '',
    notes: '',
  });

  const createProposal = useCreateProposal();

  const updateFormData = (data: Partial<ProposalFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const calculateTotals = () => {
    const subtotal = formData.line_items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    );
    let discount = 0;
    if (formData.discount_type === 'percentage') {
      discount = subtotal * (formData.discount_value / 100);
    } else if (formData.discount_type === 'fixed') {
      discount = formData.discount_value;
    }
    const total = subtotal - discount;
    return { subtotal, discount, total };
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSave = async (status: ProposalStatus = 'draft') => {
    const { subtotal, total } = calculateTotals();

    try {
      await createProposal.mutateAsync({
        template_id: formData.template?.id,
        deal_id: formData.deal_id,
        lead_id: formData.lead_id,
        client_name: formData.client_name,
        client_email: formData.client_email || undefined,
        client_business: formData.client_business || undefined,
        subtotal,
        discount_type: formData.discount_type || undefined,
        discount_value: formData.discount_value,
        total,
        delivery_date: formData.delivery_date || undefined,
        terms: formData.terms || undefined,
        notes: formData.notes || undefined,
        line_items: formData.line_items,
        status,
      });
      onComplete();
    } catch (error) {
      console.error('Failed to create proposal:', error);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.template !== null;
      case 2:
        return formData.client_name.trim() !== '';
      case 3:
        return formData.line_items.length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col animate-fade-in">
      {/* Header */}
      <div className="border-b border-border">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Create Proposal</h1>
              <p className="text-sm text-muted-foreground">Step {currentStep} of {STEPS.length}</p>
            </div>
          </div>

          {/* Step indicators */}
          <div className="hidden md:flex items-center gap-2">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm',
                    currentStep === step.id && 'bg-primary text-primary-foreground',
                    currentStep > step.id && 'bg-success/20 text-success',
                    currentStep < step.id && 'bg-muted text-muted-foreground'
                  )}
                >
                  {currentStep > step.id ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="h-5 w-5 flex items-center justify-center rounded-full bg-current/20 text-xs">
                      {step.id}
                    </span>
                  )}
                  <span className="hidden lg:inline">{step.title}</span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className="w-8 h-0.5 bg-border mx-1" />
                )}
              </div>
            ))}
          </div>

          <div className="w-24" /> {/* Spacer for alignment */}
        </div>
        <Progress value={progress} className="h-1" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-6">
          {currentStep === 1 && (
            <StepSelectTemplate
              selected={formData.template}
              onSelect={(template) => {
                updateFormData({
                  template,
                  line_items: template?.default_services || [],
                  terms: template?.default_terms || '',
                });
              }}
            />
          )}
          {currentStep === 2 && (
            <StepClientDetails
              formData={formData}
              onUpdate={updateFormData}
            />
          )}
          {currentStep === 3 && (
            <StepCustomize
              formData={formData}
              onUpdate={updateFormData}
            />
          )}
          {currentStep === 4 && (
            <StepPreview
              formData={formData}
              totals={calculateTotals()}
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            {currentStep === 4 ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleSave('draft')}
                  disabled={createProposal.isPending}
                >
                  Save as Draft
                </Button>
                <Button
                  onClick={() => handleSave('sent')}
                  disabled={createProposal.isPending}
                >
                  Save & Send
                </Button>
              </>
            ) : (
              <Button onClick={handleNext} disabled={!canProceed()}>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
