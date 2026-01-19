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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface ScrapeLeadsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ScrapeLeadsModal({ open, onOpenChange }: ScrapeLeadsModalProps) {
    const [city, setCity] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const handleScrape = async () => {
        if (!city) return;
        if (!user) {
            toast.error("You must be logged in to scrape leads.");
            return;
        }

        setIsLoading(true);

        try {
            const { data, error } = await supabase.functions.invoke('scrape-leads', {
                body: {
                    city: city,
                    userId: user.id,
                }
            });

            if (error) throw error;

            if (data.success) {
                toast.success(data.message || "Scraping complete!");
                // Refresh the leads list
                queryClient.invalidateQueries({ queryKey: ['leads'] });
                onOpenChange(false);
                setCity(""); 
            } else {
                toast.error("Failed to start scraping.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error triggering automation: " + (error as any).message);
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
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleScrape();
                            }}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleScrape} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isLoading ? "Finding Agents..." : "Start Scraping"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
