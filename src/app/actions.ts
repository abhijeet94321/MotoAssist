'use server';

import { suggestServices, SuggestServicesInput } from '@/ai/flows/suggest-services';
import { z } from 'zod';

const ActionInputSchema = z.object({
  vehicleModel: z.string(),
  mileage: z.number().positive(),
});

export async function getAiSuggestions(input: SuggestServicesInput) {
  const parsedInput = ActionInputSchema.safeParse(input);
  if (!parsedInput.success) {
    return { error: 'Invalid input. Please provide a valid model and mileage.' };
  }
  
  try {
    const result = await suggestServices(parsedInput.data);
    return { suggestions: result.suggestedServices };
  } catch (e) {
    console.error(e);
    return { error: 'An unexpected error occurred while getting AI suggestions.' };
  }
}
