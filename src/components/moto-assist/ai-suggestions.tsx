"use client";

import { useState, useTransition } from "react";
import { Lightbulb, LoaderCircle, Sparkles } from "lucide-react";
import { getAiSuggestions } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

type AiSuggestionsProps = {
  vehicleModel: string;
  onSuggestionSelect: (suggestion: string) => void;
};

export default function AiSuggestions({
  vehicleModel,
  onSuggestionSelect,
}: AiSuggestionsProps) {
  const [mileage, setMileage] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleGetSuggestions = () => {
    const numericMileage = parseInt(mileage, 10);
    if (isNaN(numericMileage) || numericMileage <= 0) {
      toast({
        title: "Invalid Mileage",
        description: "Please enter a valid, positive number for mileage.",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      const result = await getAiSuggestions({
        vehicleModel,
        mileage: numericMileage,
      });

      if (result.error) {
        toast({
          title: "AI Suggestion Error",
          description: result.error,
          variant: "destructive",
        });
        setSuggestions([]);
      } else if (result.suggestions) {
        setSuggestions(result.suggestions);
        toast({
          title: "AI Suggestions Ready",
          description: "Click on a suggestion to add it to the service description.",
        });
      }
    });
  };

  return (
    <div className="p-4 bg-accent/20 border border-accent/30 rounded-lg space-y-4">
      <div className="flex items-center gap-3">
        <Sparkles className="w-6 h-6 text-accent" />
        <h3 className="text-lg font-semibold text-accent-foreground">
          AI Service Assistant
        </h3>
      </div>
      <div className="flex flex-col sm:flex-row items-end gap-4">
        <div className="flex-grow w-full sm:w-auto">
          <label htmlFor="mileage" className="text-sm font-medium text-muted-foreground">
            Current Mileage (km)
          </label>
          <Input
            id="mileage"
            type="number"
            value={mileage}
            onChange={(e) => setMileage(e.target.value)}
            placeholder="e.g. 25000"
            disabled={isPending}
          />
        </div>
        <Button onClick={handleGetSuggestions} disabled={isPending || !mileage}>
          {isPending ? (
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Lightbulb className="mr-2 h-4 w-4" />
          )}
          Get Suggestions
        </Button>
      </div>

      {isPending && (
         <div className="flex items-center justify-center p-4">
            <LoaderCircle className="w-6 h-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Getting suggestions...</span>
         </div>
      )}

      {!isPending && suggestions.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2 text-muted-foreground">Suggested Services:</h4>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s, i) => (
              <Badge
                key={i}
                variant="outline"
                className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                onClick={() => onSuggestionSelect(s)}
              >
                {s}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
