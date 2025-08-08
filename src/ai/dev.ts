import { config } from 'dotenv';
// Load environment variables from .env.local
config({ path: '.env.local' });

import '@/ai/flows/suggest-services.ts';
import '@/ai/flows/find-due-services.ts';
