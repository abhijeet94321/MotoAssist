'use server';

/**
 * @fileOverview Suggests common service tasks based on vehicle model and mileage.
 *
 * - suggestServices - A function that suggests service tasks.
 * - SuggestServicesInput - The input type for the suggestServices function.
 * - SuggestServicesOutput - The return type for the suggestServices function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestServicesInputSchema = z.object({
  vehicleModel: z.string().describe('The model of the vehicle.'),
  mileage: z.number().describe('The current mileage of the vehicle.'),
});
export type SuggestServicesInput = z.infer<typeof SuggestServicesInputSchema>;

const SuggestServicesOutputSchema = z.object({
  suggestedServices: z
    .array(z.string())
    .describe('An array of suggested service tasks.'),
});
export type SuggestServicesOutput = z.infer<typeof SuggestServicesOutputSchema>;

export async function suggestServices(input: SuggestServicesInput): Promise<SuggestServicesOutput> {
  return suggestServicesFlow(input);
}

const suggestServicesFlow = ai.defineFlow(
  {
    name: 'suggestServicesFlow',
    inputSchema: SuggestServicesInputSchema,
    outputSchema: SuggestServicesOutputSchema,
  },
  async input => {
    const prompt = ai.definePrompt({
        name: 'suggestServicesPrompt',
        input: {schema: SuggestServicesInputSchema},
        output: {schema: SuggestServicesOutputSchema},
        prompt: `You are an experienced mechanic. Based on the vehicle model and mileage provided, suggest common service tasks that might be due.

Vehicle Model: {{{vehicleModel}}}
Mileage: {{{mileage}}}

Consider services like oil changes, tire rotations, brake inspections, fluid checks, and filter replacements.  Return the output in JSON format.
`,
    });

    const {output} = await prompt(input);
    return output!;
  }
);
