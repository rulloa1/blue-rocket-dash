import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ScrapeLeadsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ScrapeLeadsModal({ open, onOpenChange }: ScrapeLeadsModalProps) {
    const [city, setCity] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuth();

    const handleScrape = async () => {
        if (!city) return;
        if (!user) {
            toast.error("You must be logged in to scrape leads.");
            return;
        }

        setIsLoading(true);

        try {
            // TRIGGER PHP SCRIPT ON LOCALHOST (XAMPP)
            const WEBHOOK_URL = "http://localhost/process_leads.php";

            const response = await fetch(WEBHOOK_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    city: city,
                    userId: user.id,
                }),
            });

            if (response.ok) {
                toast.success("Scraping started! Leads will appear shortly.");
                onOpenChange(false);
            } else {
                toast.error("Failed to start scraping.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error triggering automation.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Scrape New Leads</DialogTitle>
                    <DialogDescription>
                        Enter a city to find real estate agents without websites.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="city" className="text-right">
                            City
                        </Label>
                        <Input
                            id="city"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="col-span-3"
                            placeholder="e.g. San Francisco"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleScrape} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Start Scraping
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
