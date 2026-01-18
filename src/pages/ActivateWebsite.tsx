import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Globe, ArrowRight, Sparkles, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function ActivateWebsite() {
  const [searchParams] = useSearchParams();
  const [showConfetti, setShowConfetti] = useState(true);

  // Get parameters from Stripe success redirect
  const sessionId = searchParams.get('session_id');
  const businessName = searchParams.get('business') || 'Your Business';

  useEffect(() => {
    // Hide confetti after animation
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Confetti animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-20px`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][
                    Math.floor(Math.random() * 5)
                  ],
                }}
              />
            </div>
          ))}
        </div>
      )}

      <Card className="max-w-lg w-full shadow-2xl border-0 overflow-hidden">
        {/* Success header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center text-white">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4 backdrop-blur-sm">
            <CheckCircle className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-green-100 text-lg">Your website is being activated</p>
        </div>

        <CardContent className="p-8 space-y-6">
          {/* Business name */}
          <div className="text-center">
            <p className="text-muted-foreground mb-1">Website for</p>
            <h2 className="text-2xl font-bold text-foreground">{decodeURIComponent(businessName)}</h2>
          </div>

          {/* What happens next */}
          <div className="bg-blue-50 rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-blue-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              What happens next?
            </h3>
            <ul className="space-y-3 text-sm text-blue-800">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  1
                </div>
                <span>Our team will review your website and prepare it for launch</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  2
                </div>
                <span>You'll receive an email with your custom domain options</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  3
                </div>
                <span>Your website goes live within 24-48 hours!</span>
              </li>
            </ul>
          </div>

          {/* Contact info */}
          <div className="bg-gray-50 rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Need help?</h3>
            <div className="space-y-2 text-sm">
              <a 
                href="mailto:support@royscompany.com" 
                className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
              >
                <Mail className="w-4 h-4" />
                support@royscompany.com
              </a>
              <a 
                href="https://royscompany.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
              >
                <Globe className="w-4 h-4" />
                royscompany.com
              </a>
            </div>
          </div>

          {/* CTA */}
          <div className="pt-2">
            <a 
              href="https://royscompany.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full"
            >
              <Button className="w-full gap-2 h-12 text-base">
                <Globe className="w-5 h-5" />
                Visit RoysCompany.com
                <ArrowRight className="w-4 h-4" />
              </Button>
            </a>
          </div>

          {/* Session ID for reference */}
          {sessionId && (
            <p className="text-center text-xs text-muted-foreground">
              Reference: {sessionId.slice(0, 20)}...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
