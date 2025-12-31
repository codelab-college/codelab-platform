import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { getSettings, updateSettings } from '../../services/adminApi';
import { Settings as SettingsIcon, Save, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const [settings, setSettings] = useState({
    platform_name: 'CodeLab',
    max_submission_size: '65536',
    execution_timeout: '5000',
    enable_practice_mode: 'true',
    enable_badges: 'true',
    plagiarism_threshold: '70',
    default_password: 'password123'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await getSettings();
      setSettings(prev => ({ ...prev, ...response.data.settings }));
    } catch (error) {
      // Use defaults
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff375f]"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Platform Settings</h1>
            <p className="text-gray-400 mt-1">Configure global platform settings</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-[#ff375f] hover:bg-[#ff4d6d] text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Changes
          </button>
        </div>

        {/* General Settings */}
        <div className="bg-[#282828] border border-[#3e3e3e] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[#3e3e3e]">
            <h2 className="text-lg font-semibold text-white">General</h2>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Platform Name</label>
              <input
                type="text"
                value={settings.platform_name}
                onChange={(e) => handleChange('platform_name', e.target.value)}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3e3e3e] rounded-lg text-white focus:border-[#ff375f] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Default Password for New Users</label>
              <input
                type="text"
                value={settings.default_password}
                onChange={(e) => handleChange('default_password', e.target.value)}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3e3e3e] rounded-lg text-white focus:border-[#ff375f] focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">Used when importing students via CSV</p>
            </div>
          </div>
        </div>

        {/* Execution Settings */}
        <div className="bg-[#282828] border border-[#3e3e3e] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[#3e3e3e]">
            <h2 className="text-lg font-semibold text-white">Code Execution</h2>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Max Submission Size (bytes)</label>
                <input
                  type="number"
                  value={settings.max_submission_size}
                  onChange={(e) => handleChange('max_submission_size', e.target.value)}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3e3e3e] rounded-lg text-white focus:border-[#ff375f] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Execution Timeout (ms)</label>
                <input
                  type="number"
                  value={settings.execution_timeout}
                  onChange={(e) => handleChange('execution_timeout', e.target.value)}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3e3e3e] rounded-lg text-white focus:border-[#ff375f] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="bg-[#282828] border border-[#3e3e3e] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[#3e3e3e]">
            <h2 className="text-lg font-semibold text-white">Features</h2>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Practice Mode</p>
                <p className="text-gray-500 text-sm">Allow students to practice problems outside assignments</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enable_practice_mode === 'true'}
                  onChange={(e) => handleChange('enable_practice_mode', e.target.checked ? 'true' : 'false')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#3e3e3e] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00b8a3]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Achievement Badges</p>
                <p className="text-gray-500 text-sm">Enable gamification with achievement badges</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enable_badges === 'true'}
                  onChange={(e) => handleChange('enable_badges', e.target.checked ? 'true' : 'false')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#3e3e3e] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00b8a3]"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Plagiarism Settings */}
        <div className="bg-[#282828] border border-[#3e3e3e] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[#3e3e3e]">
            <h2 className="text-lg font-semibold text-white">Plagiarism Detection</h2>
          </div>
          <div className="p-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Similarity Threshold (%)</label>
              <input
                type="number"
                min="50"
                max="100"
                value={settings.plagiarism_threshold}
                onChange={(e) => handleChange('plagiarism_threshold', e.target.value)}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3e3e3e] rounded-lg text-white focus:border-[#ff375f] focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Submissions with similarity above this threshold will be flagged
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Settings;
