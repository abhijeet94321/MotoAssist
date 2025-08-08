import { config } from 'dotenv';
// Load environment variables from .env
config();

import '@/ai/flows/suggest-services.ts';
import '@/ai/flows/find-due-services.ts';
