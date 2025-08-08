"use server";

import { suggestServices, SuggestServicesInput } from '@/ai/flows/suggest-services';
import { findDueServices } from '@/ai/flows/find-due-services';
import { z } from 'zod';

const ActionInputSchema = z.object({
  vehicleModel: z.string(),
  mileage: z.number().positive(),
});

export async function getAiSuggestions(input: SuggestServicesInput) {
  const parsedInput = ActionInputSchema.safeParse(input);
  if (!parsedInput.success) {
    // It's better to return the detailed error from Zod for clearer client-side debugging if needed.
    const errorMessage = parsedInput.error.errors.map(e => e.message).join(', ');
    return { error: `Invalid input: ${errorMessage}` };
  }
  
  try {
    // FIX: Pass the parsedInput.data, not the original input.
    const result = await suggestServices(parsedInput.data);
    return { suggestions: result.suggestedServices };
  } catch (e) {
    console.error(e);
    return { error: 'An unexpected error occurred while getting AI suggestions.' };
  }
}

export async function getDueServiceReminders() {
  try {
    const result = await findDueServices();
    return { dueServices: result.dueServices };
  } catch (e) {
    console.error(e);
    return { error: 'An unexpected error occurred while fetching due services.' };
  }
}
