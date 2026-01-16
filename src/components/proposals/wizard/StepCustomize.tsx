import { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ProposalFormData } from '../CreateProposalWizard';
import type { LineItem } from '@/hooks/useProposals';

interface StepCustomizeProps {
  formData: ProposalFormData;
  onUpdate: (data: Partial<ProposalFormData>) => void;
}

export function StepCustomize({ formData, onUpdate }: StepCustomizeProps) {
  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    const newItems = [...formData.line_items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
      total: field === 'quantity' || field === 'unit_price'
        ? (field === 'quantity' ? Number(value) : newItems[index].quantity) *
          (field === 'unit_price' ? Number(value) : newItems[index].unit_price)
        : newItems[index].total,
    };
    onUpdate({ line_items: newItems });
  };

  const addLineItem = () => {
    onUpdate({
      line_items: [
        ...formData.line_items,
        { description: '', quantity: 1, unit_price: 0, total: 0 },
      ],
    });
  };

  const removeLineItem = (index: number) => {
    onUpdate({
      line_items: formData.line_items.filter((_, i) => i !== index),
    });
  };

  const subtotal = formData.line_items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  );

  const discount = formData.discount_type === 'percentage'
    ? subtotal * (formData.discount_value / 100)
    : formData.discount_type === 'fixed'
    ? formData.discount_value
    : 0;

  const total = subtotal - discount;

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
        <h2 className="text-xl font-semibold mb-2">Customize Proposal</h2>
        <p className="text-muted-foreground">
          Edit services, pricing, and terms
        </p>
      </div>

      {/* Line Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">Services & Pricing</Label>
          <Button variant="outline" size="sm" onClick={addLineItem}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>

        <div className="space-y-3">
          {formData.line_items.map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card/50"
            >
              <GripVertical className="h-5 w-5 text-muted-foreground mt-2 cursor-grab" />
              
              <div className="flex-1 grid gap-3 md:grid-cols-12">
                <div className="md:col-span-6">
                  <Input
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <Input
                    type="number"
                    min={1}
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(index, 'quantity', parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="md:col-span-2">
                  <Input
                    type="number"
                    min={0}
                    step={100}
                    placeholder="Price"
                    value={item.unit_price}
                    onChange={(e) => updateLineItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="md:col-span-2 flex items-center justify-between">
                  <span className="font-medium text-foreground">
                    {formatCurrency(item.quantity * item.unit_price)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => removeLineItem(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {formData.line_items.length === 0 && (
            <div className="text-center py-8 border border-dashed border-border rounded-lg">
              <p className="text-muted-foreground mb-2">No services added yet</p>
              <Button variant="outline" size="sm" onClick={addLineItem}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Item
              </Button>
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="flex flex-col items-end gap-2 pt-4 border-t border-border">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">Subtotal:</span>
            <span className="font-medium w-24 text-right">{formatCurrency(subtotal)}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Discount:</span>
            <Select
              value={formData.discount_type || 'none'}
              onValueChange={(value) =>
                onUpdate({
                  discount_type: value === 'none' ? null : (value as 'percentage' | 'fixed'),
                  discount_value: value === 'none' ? 0 : formData.discount_value,
                })
              }
            >
              <SelectTrigger className="w-24">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="percentage">%</SelectItem>
                <SelectItem value="fixed">$</SelectItem>
              </SelectContent>
            </Select>
            {formData.discount_type && (
              <Input
                type="number"
                min={0}
                className="w-24"
                value={formData.discount_value}
                onChange={(e) => onUpdate({ discount_value: parseFloat(e.target.value) || 0 })}
              />
            )}
            <span className="font-medium w-24 text-right text-destructive">
              -{formatCurrency(discount)}
            </span>
          </div>

          <div className="flex items-center gap-4 text-lg font-semibold pt-2 border-t border-border">
            <span>Total:</span>
            <span className="w-24 text-right text-primary">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Delivery & Terms */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="delivery_date">Delivery Date</Label>
          <Input
            id="delivery_date"
            type="date"
            value={formData.delivery_date}
            onChange={(e) => onUpdate({ delivery_date: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="terms">Terms & Conditions</Label>
        <Textarea
          id="terms"
          rows={4}
          value={formData.terms}
          onChange={(e) => onUpdate({ terms: e.target.value })}
          placeholder="Payment terms, delivery conditions, etc."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          rows={3}
          value={formData.notes}
          onChange={(e) => onUpdate({ notes: e.target.value })}
          placeholder="Any additional notes for the client..."
        />
      </div>
    </div>
  );
}
