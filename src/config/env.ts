/// <reference types="vite/client" />
import { z } from 'zod';

const envSchema = z.object({
  VITE_API_URL: z.string().url(),
  VITE_APP_NAME: z.string().default('Candle Store'),
});

export const env = envSchema.parse(import.meta.env);

export const apiUrl = env.VITE_API_URL;
export const appName = env.VITE_APP_NAME;
