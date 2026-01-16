import { format } from 'date-fns';
import { Building2, Mail, Calendar, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { ProposalFormData } from '../CreateProposalWizard';

interface StepPreviewProps {
  formData: ProposalFormData;
  totals: { subtotal: number; discount: number; total: number };
}

export function StepPreview({ formData, totals }: StepPreviewProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Preview Proposal</h2>
        <p className="text-muted-foreground">
          Review your proposal before saving or sending
        </p>
      </div>

      {/* Proposal Preview Card */}
      <Card className="border-2">
        <CardHeader className="pb-4">
          {/* Company Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-xl font-bold text-primary-foreground">R</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold">RoysCompany</h3>
                <p className="text-sm text-muted-foreground">AI Automation Agency</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Proposal</p>
              <p className="text-sm font-medium">{format(new Date(), 'MMMM d, yyyy')}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Client Details */}
          <div className="rounded-lg bg-muted/50 p-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Prepared for</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{formData.client_name || 'Client Name'}</span>
              </div>
              {formData.client_business && (
                <p className="text-sm text-muted-foreground pl-6">{formData.client_business}</p>
              )}
              {formData.client_email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{formData.client_email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Template Badge */}
          {formData.template && (
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">{formData.template.name}</span>
            </div>
          )}

          <Separator />

          {/* Services Table */}
          <div>
            <h4 className="font-medium mb-4">Services</h4>
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium">Description</th>
                    <th className="text-center p-3 text-sm font-medium w-20">Qty</th>
                    <th className="text-right p-3 text-sm font-medium w-28">Price</th>
                    <th className="text-right p-3 text-sm font-medium w-28">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.line_items.map((item, index) => (
                    <tr key={index} className="border-t border-border">
                      <td className="p-3">{item.description || 'Service item'}</td>
                      <td className="p-3 text-center">{item.quantity}</td>
                      <td className="p-3 text-right">{formatCurrency(item.unit_price)}</td>
                      <td className="p-3 text-right font-medium">
                        {formatCurrency(item.quantity * item.unit_price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-muted/30">
                  <tr className="border-t border-border">
                    <td colSpan={3} className="p-3 text-right text-sm">Subtotal</td>
                    <td className="p-3 text-right font-medium">{formatCurrency(totals.subtotal)}</td>
                  </tr>
                  {totals.discount > 0 && (
                    <tr>
                      <td colSpan={3} className="p-3 text-right text-sm">
                        Discount
                        {formData.discount_type === 'percentage' && ` (${formData.discount_value}%)`}
                      </td>
                      <td className="p-3 text-right font-medium text-destructive">
                        -{formatCurrency(totals.discount)}
                      </td>
                    </tr>
                  )}
                  <tr className="border-t-2 border-border">
                    <td colSpan={3} className="p-3 text-right font-semibold">Total</td>
                    <td className="p-3 text-right text-lg font-bold text-primary">
                      {formatCurrency(totals.total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Delivery Date */}
          {formData.delivery_date && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Estimated Delivery:</span>
              <span className="font-medium">
                {format(new Date(formData.delivery_date), 'MMMM d, yyyy')}
              </span>
            </div>
          )}

          {/* Terms */}
          {formData.terms && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-2">Terms & Conditions</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {formData.terms}
                </p>
              </div>
            </>
          )}

          {/* Notes */}
          {formData.notes && (
            <div className="rounded-lg bg-muted/50 p-4">
              <h4 className="font-medium mb-2">Notes</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {formData.notes}
              </p>
            </div>
          )}

          <Separator />

          {/* Signature Area */}
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground mb-4">Client Signature</p>
              <div className="h-20 border-b-2 border-dashed border-border" />
              <p className="text-sm text-muted-foreground mt-2">Date: _____________</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-4">RoysCompany</p>
              <div className="h-20 border-b-2 border-dashed border-border" />
              <p className="text-sm text-muted-foreground mt-2">Date: _____________</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
