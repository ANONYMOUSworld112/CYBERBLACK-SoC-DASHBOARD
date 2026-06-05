import { useEffect } from 'react';
import SettingsPanel from '../components/settings/SettingsPanel.jsx';
import { useSettingsStore } from '../store/settingsStore.js';

export default function SettingsPage() {
  const load = useSettingsStore((s) => s.load);
  useEffect(() => { load(); }, [load]);
  return (
    <div className="p-4">
      <SettingsPanel />
    </div>
  );
}
