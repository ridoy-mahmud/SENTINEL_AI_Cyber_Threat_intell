import { generateAiResponse } from '../_lib/ai';
import type { ApiRequest, ApiResponse } from '../_lib/http';

interface AnalyzePayload {
  input?: string;
  history?: string[];
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const payload = (req.body && typeof req.body === 'object' ? req.body : {}) as AnalyzePayload;
  const input = payload.input;
  const history = Array.isArray(payload.history) ? payload.history : [];

  if (!input || typeof input !== 'string') {
    return res.status(400).json({ error: 'input is required' });
  }

  const response = await generateAiResponse(input, history);
  return res.status(200).json({ response });
}
