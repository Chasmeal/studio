'use server';

/**
 * @fileOverview Suggests a task priority based on the task title and description.
 *
 * - suggestTaskPriority - A function that suggests a task priority.
 * - SuggestTaskPriorityInput - The input type for the suggestTaskPriority function.
 * - SuggestTaskPriorityOutput - The return type for the suggestTaskPriority function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTaskPriorityInputSchema = z.object({
  title: z.string().describe('The title of the task.'),
  description: z.string().describe('The description of the task.'),
});
export type SuggestTaskPriorityInput = z.infer<
  typeof SuggestTaskPriorityInputSchema
>;

const SuggestTaskPriorityOutputSchema = z.object({
  priority: z
    .enum(['low', 'medium', 'high'])
    .describe('The suggested priority for the task.'),
  reason: z
    .string()
    .describe('The reasoning behind the suggested priority.'),
});
export type SuggestTaskPriorityOutput = z.infer<
  typeof SuggestTaskPriorityOutputSchema
>;

export async function suggestTaskPriority(
  input: SuggestTaskPriorityInput
): Promise<SuggestTaskPriorityOutput> {
  return suggestTaskPriorityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTaskPriorityPrompt',
  input: {schema: SuggestTaskPriorityInputSchema},
  output: {schema: SuggestTaskPriorityOutputSchema},
  prompt: `You are an AI task prioritization assistant. Given the title and description of a task, you will suggest a priority level for the task.

Task Title: {{{title}}}
Task Description: {{{description}}}

Consider the urgency and impact of the task when suggesting the priority.
Respond with a priority level of 'low', 'medium', or 'high', along with a brief explanation of your reasoning.
`,
});

const suggestTaskPriorityFlow = ai.defineFlow(
  {
    name: 'suggestTaskPriorityFlow',
    inputSchema: SuggestTaskPriorityInputSchema,
    outputSchema: SuggestTaskPriorityOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
