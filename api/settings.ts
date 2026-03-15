import { getSettings, saveSettings } from './_lib/store';
import type { ApiRequest, ApiResponse } from './_lib/http';
import type { SettingsState } from './_lib/store';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method === 'GET') {
    const settings = await getSettings();
    return res.status(200).json(settings);
  }

  if (req.method === 'PUT') {
    const payload = req.body;
    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ error: 'settings payload is required' });
    }

    const saved = await saveSettings(payload as SettingsState);
    return res.status(200).json(saved);
  }

  res.setHeader('Allow', 'GET, PUT');
  return res.status(405).json({ error: 'Method not allowed' });
}
