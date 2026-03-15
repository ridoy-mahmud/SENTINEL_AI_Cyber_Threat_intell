import { getTelemetrySnapshot } from '../_lib/store';
import type { ApiRequest, ApiResponse } from '../_lib/http';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const snapshot = await getTelemetrySnapshot();
  return res.status(200).json(snapshot);
}
