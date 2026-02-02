import { z } from 'zod';

export const DetectInputSchema = z.object({
  keys: z.array(z.string()).default(['Interact']),
  isPressed: z.boolean().default(false),
  justPressed: z.boolean().default(false)
});

export const DetectInput = (config = {}) => {
  const result = DetectInputSchema.safeParse(config);

  if (result.success) {
    return result.data;
  } else {
    console.error('[DetectInput] Schema validation failed', result.error);
    return DetectInputSchema.parse({});
  }
}
