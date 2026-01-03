import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const COOKIE_CONSENT_KEY = "cookie-consent";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 bg-card border-t border-border shadow-lg" data-testid="cookie-banner">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-4">
        <p className="text-sm text-muted-foreground flex-1 text-center sm:text-left">
          This website uses cookies to provide necessary site functionality and to improve your experience. By using this website, you agree to our use of cookies.
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <Button 
            onClick={handleAccept} 
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            data-testid="button-accept-cookies"
          >
            Accept
          </Button>
          <Button 
            onClick={handleDecline} 
            variant="outline"
            className="border-border text-muted-foreground hover:text-foreground"
            data-testid="button-decline-cookies"
          >
            Decline
          </Button>
        </div>
      </div>
    </div>
  );
}
