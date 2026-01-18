import { useState } from 'react';
import { Mail, Loader2, X, ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EmailPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessName: string;
  recipientName: string;
  recipientEmail: string;
  websitePreviewUrl: string;
  onSend: () => Promise<void>;
  isSending: boolean;
}

const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/4gM8wOeqfec58K5fbS7kc00';

export function EmailPreviewDialog({
  open,
  onOpenChange,
  businessName,
  recipientName,
  recipientEmail,
  websitePreviewUrl,
  onSend,
  isSending,
}: EmailPreviewDialogProps) {
  const logoUrl = 'https://royscompany.lovable.app/images/royscompany-logo.jpeg';
  const currentYear = new Date().getFullYear();
  const fakeDomain = businessName.toLowerCase().replace(/\s+/g, '') + '.com';

  const handleSend = async () => {
    await onSend();
    if (!isSending) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-border flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Email Preview
          </DialogTitle>
          <DialogDescription>
            Preview of the email that will be sent to <span className="font-medium text-foreground">{recipientEmail}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Email header info */}
        <div className="px-6 py-3 bg-muted/30 border-b border-border flex-shrink-0 space-y-1 text-sm">
          <div className="flex">
            <span className="text-muted-foreground w-16">From:</span>
            <span className="text-foreground">RoysCompany &lt;noreply@royscompany.com&gt;</span>
          </div>
          <div className="flex">
            <span className="text-muted-foreground w-16">To:</span>
            <span className="text-foreground">{recipientEmail}</span>
          </div>
          <div className="flex">
            <span className="text-muted-foreground w-16">Subject:</span>
            <span className="text-foreground font-medium">Your Custom Website Preview for {businessName}</span>
          </div>
        </div>

        {/* Email preview in scrollable area */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-6 bg-[#0f0f0f]">
            {/* Email content preview - styled to match the actual email */}
            <div className="max-w-[520px] mx-auto">
              {/* Logo */}
              <div className="text-center mb-6">
                <img 
                  src={logoUrl} 
                  alt="RoysCompany.com" 
                  className="w-64 max-w-full h-auto mx-auto" 
                />
              </div>

              {/* Main Card */}
              <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] overflow-hidden">
                {/* Gold accent bar */}
                <div className="h-1 bg-gradient-to-r from-[#b8860b] via-[#daa520] to-[#b8860b]" />

                {/* Header */}
                <div className="px-8 pt-10 pb-6 text-center">
                  <h1 className="text-2xl font-bold text-white mb-2">
                    Your Website is Ready
                  </h1>
                  <p className="text-[#b8860b] text-lg font-medium">
                    {businessName}
                  </p>
                </div>

                {/* Body */}
                <div className="px-8 pb-8">
                  <p className="text-[#e5e5e5] text-base mb-4">
                    Hi {recipientName},
                  </p>
                  <p className="text-[#a3a3a3] text-base mb-6">
                    We've crafted a <span className="text-[#daa520] font-semibold">custom website preview</span> exclusively for your business. See how your online presence can elevate your brand and attract more customers.
                  </p>

                  {/* Browser Window Preview */}
                  <div className="mb-6 rounded-xl border border-[#3a3a3a] overflow-hidden bg-[#2a2a2a]">
                    {/* Browser top bar */}
                    <div className="px-4 py-2.5 bg-[#1f1f1f] border-b border-[#3a3a3a] flex items-center">
                      <div className="flex gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                        <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                        <span className="w-3 h-3 rounded-full bg-[#27ca40]" />
                      </div>
                      <div className="flex-1 text-center">
                        <span className="inline-block bg-[#2a2a2a] rounded-md px-4 py-1 text-[11px] text-[#888888]">
                          🔒 {fakeDomain}
                        </span>
                      </div>
                      <div className="w-12" />
                    </div>
                    {/* Website preview content */}
                    <div className="p-6 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-center">
                      <p className="text-2xl font-bold text-white mb-1">{businessName}</p>
                      <p className="text-sm text-[#b8b8b8] mb-4">Your professional website is ready</p>
                      <div className="inline-block bg-gradient-to-r from-[#b8860b] to-[#daa520] px-6 py-2 rounded-md">
                        <span className="text-white text-xs font-semibold uppercase tracking-wider">Preview Ready</span>
                      </div>
                    </div>
                  </div>

                  {/* Preview button */}
                  <div className="text-center mb-8">
                    <a 
                      href={websitePreviewUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#1a1a1a] border-2 border-[#daa520] text-[#daa520] px-8 py-3 rounded-lg font-semibold hover:bg-[#daa520]/10 transition-colors"
                    >
                      View Your Website Preview
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>

                  {/* Features box */}
                  <div className="bg-[#252525] rounded-xl border border-[#333333] p-6 mb-6">
                    <p className="text-white text-sm font-semibold uppercase tracking-wider mb-4">What's Included</p>
                    <div className="space-y-2 text-[#a3a3a3] text-sm">
                      <p><span className="text-[#daa520] mr-2">✓</span> Professional, mobile-responsive design</p>
                      <p><span className="text-[#daa520] mr-2">✓</span> Customized content for your industry</p>
                      <p><span className="text-[#daa520] mr-2">✓</span> Payment integration ready</p>
                      <p><span className="text-[#daa520] mr-2">✓</span> SEO-optimized structure</p>
                    </div>
                  </div>

                  {/* CTA section */}
                  <div className="bg-gradient-to-br from-[#b8860b] to-[#8b6914] rounded-xl p-8 text-center">
                    <p className="text-white/80 text-xs uppercase tracking-widest mb-1">Limited Time Offer</p>
                    <p className="text-white text-xl font-bold mb-4">Ready to Go Live?</p>
                    <span className="inline-block bg-white text-[#8b6914] px-8 py-3 rounded-full font-bold">
                      Activate Now
                    </span>
                    <p className="text-white/70 text-xs mt-4">Secure payment • Instant activation • Full support</p>
                  </div>
                </div>

                {/* Contact */}
                <div className="px-8 pb-8 text-center">
                  <p className="text-[#737373] text-sm">
                    Have questions? Simply reply to this email — we're here to help.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center pt-6">
                <p className="text-[#737373] text-sm mb-1">RoysCompany</p>
                <p className="text-[#525252] text-xs">
                  © {currentYear} <span className="text-[#b8860b]">RoysCompany.com</span> • All rights reserved
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Action buttons */}
        <div className="px-6 py-4 border-t border-border flex gap-3 justify-end flex-shrink-0 bg-background">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={isSending} className="gap-2">
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" />
                Send Email
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
