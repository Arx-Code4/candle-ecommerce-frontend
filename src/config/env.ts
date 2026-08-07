// src/config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  VITE_API_URL: z.string().url(),
  VITE_CHAPA_API_KEY: z.string().min(1),
  VITE_APP_NAME: z.string().default('Candle Store'),
});

export const env = envSchema.parse(import.meta.env);

export const apiUrl = env.VITE_API_URL;
export const chapaApiKey = env.VITE_CHAPA_API_KEY;
export const appName = env.VITE_APP_NAME;
