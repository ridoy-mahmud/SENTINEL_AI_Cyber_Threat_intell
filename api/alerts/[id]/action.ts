import { updateAlert } from '../../_lib/store';
import type { ApiRequest, ApiResponse } from '../../_lib/http';

type AlertAction = 'acknowledge' | 'investigate' | 'resolve' | 'dismiss';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const alertId = req.query?.id;
  const action = (
    req.body && typeof req.body === 'object' && 'action' in req.body
      ? (req.body as { action?: AlertAction }).action
      : undefined
  );

  if (!alertId || typeof alertId !== 'string') {
    return res.status(400).json({ error: 'alert id is required' });
  }

  if (!action || !['acknowledge', 'investigate', 'resolve', 'dismiss'].includes(action)) {
    return res.status(400).json({ error: 'valid action is required' });
  }

  const updated = await updateAlert(alertId, action);
  if (!updated) {
    return res.status(404).json({ error: 'alert not found' });
  }

  return res.status(200).json({ alert: updated });
}
