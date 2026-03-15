import { getThreatIntel } from '../_lib/store';
import type { ApiRequest, ApiResponse } from '../_lib/http';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const threats = await getThreatIntel({
    search: typeof req.query?.search === 'string' ? req.query.search : undefined,
    severity: typeof req.query?.severity === 'string' ? req.query.severity : undefined,
    type: typeof req.query?.type === 'string' ? req.query.type : undefined,
    status: typeof req.query?.status === 'string' ? req.query.status : undefined,
    sort: typeof req.query?.sort === 'string' ? (req.query.sort as 'name' | 'severity' | 'confidence' | 'type') : undefined,
    direction: typeof req.query?.direction === 'string' ? (req.query.direction as 'asc' | 'desc') : undefined,
  });

  return res.status(200).json({ threats });
}
