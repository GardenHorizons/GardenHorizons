import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import { Save, Edit2, Plus } from 'lucide-react';
import { cn } from '../lib/utils';

// Types
interface ContentItem {
  id?: number;
  title?: string;
  name?: string;
  description?: string;
  imageUrl?: string;
  overlayText?: string;
  youtubeUrl?: string;
  question?: string;
  answer?: string;
  code?: string;
  displayOrder?: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { refreshSettings } = useSettings();
  const [activeTab, setActiveTab] = useState('mutations');
  const [password, setPassword] = useState('');
  
  // Data states
  const [items, setItems] = useState<ContentItem[]>([]);
  const [settingsData, setSettingsData] = useState<any>({});
  const [newPassword, setNewPassword] = useState('');
  
  // Edit states
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const storedPass = sessionStorage.getItem('admin_password');
    if (!storedPass) {
      navigate('/admin/login');
    } else {
      setPassword(storedPass);
      loadData(activeTab, storedPass);
    }
  }, [activeTab, navigate]);

  const loadData = async (tab: string, pass: string) => {
    const config = { headers: { Authorization: pass } };
    try {
      if (tab === 'settings') {
        const res = await axios.get('/api/admin/settings', config);
        setSettingsData(res.data);
      } else {
        const endpoint = tab === 'hall-of-fame' ? 'hall_of_fame' : tab;
        const res = await axios.get(`/api/content/${endpoint}`);
        setItems(res.data);
      }
    } catch (err) {
      console.error(err);
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        navigate('/admin/login');
      }
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const config = { headers: { Authorization: password } };
    const endpoint = activeTab === 'hall-of-fame' ? 'hall_of_fame' : activeTab;
    
    try {
      if (isCreating) {
        await axios.post(`/api/content/${endpoint}`, editingItem, config);
      } else {
        await axios.put(`/api/content/${endpoint}/${editingItem.id}`, editingItem, config);
      }
      setEditingItem(null);
      setIsCreating(false);
      loadData(activeTab, password);
    } catch (err) {
      alert('Failed to save');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const config = { headers: { Authorization: password } };
    try {
      await axios.put('/api/admin/settings', { settings: settingsData, newPassword: newPassword || undefined }, config);
      if (newPassword) {
        sessionStorage.setItem('admin_password', newPassword);
        setPassword(newPassword);
        setNewPassword('');
      }
      await refreshSettings();
      alert('Settings saved');
    } catch (err) {
      alert('Failed to save settings');
    }
  };

  const tabs = [
    { id: 'mutations', label: 'Mutations' },
    { id: 'plants', label: 'Plants' },
    { id: 'codes', label: 'Codes' },
    { id: 'updates', label: 'Updates' },
    { id: 'hall-of-fame', label: 'Hall of Fame' },
    { id: 'faqs', label: 'FAQs' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div className="min-h-screen">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="glass-panel rounded-xl p-4 sticky top-24">
            <h2 className="text-xl font-bold mb-6 px-2 text-gh-green-light">Dashboard</h2>
            <nav className="space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setEditingItem(null); setIsCreating(false); }}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-lg transition-colors font-medium",
                    activeTab === tab.id ? "bg-gh-green-dark text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-grow">
          <div className="glass-panel rounded-xl p-6 min-h-[500px]">
            
            {/* List View */}
            {!editingItem && activeTab !== 'settings' && (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold">{tabs.find(t => t.id === activeTab)?.label}</h3>
                  {activeTab !== 'faqs' && (
                       <button 
                         onClick={() => { setEditingItem({}); setIsCreating(true); }}
                         className="flex items-center gap-2 bg-gh-accent hover:bg-gh-accent/80 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                       >
                         <Plus size={16} /> Add New
                       </button>
                  )}
                </div>

                <div className="grid gap-4">
                  {items.map((item: any) => (
                    <div key={item.id} className="bg-black/20 border border-white/5 p-4 rounded-lg flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        {item.imageUrl && <img src={item.imageUrl} alt="" className="w-12 h-12 rounded object-cover" />}
                        <div>
                          <div className="font-bold flex items-center gap-2">
                            {item.title || item.name || item.question || item.code}
                            {item.displayOrder !== undefined && <span className="text-xs bg-gray-700 px-2 py-0.5 rounded text-gray-300">Order: {item.displayOrder}</span>}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-md">{item.description || item.answer}</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => { setEditingItem(item); setIsCreating(false); }}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                      >
                        <Edit2 size={18} className="text-gray-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Edit Form */}
            {editingItem && activeTab !== 'settings' && (
              <form onSubmit={handleSaveItem} className="space-y-6 max-w-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold">{isCreating ? 'Create New' : 'Edit Item'}</h3>
                  <button 
                    type="button" 
                    onClick={() => setEditingItem(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>

                {/* Dynamic Fields based on Type */}
                {(activeTab === 'mutations' || activeTab === 'plants') && (
                  <>
                    <Input label="Title" value={editingItem.title} onChange={v => setEditingItem({...editingItem, title: v})} />
                    <TextArea label="Description" value={editingItem.description} onChange={v => setEditingItem({...editingItem, description: v})} />
                    <Input label="Image URL" value={editingItem.imageUrl} onChange={v => setEditingItem({...editingItem, imageUrl: v})} />
                    <Input label="Overlay Text" value={editingItem.overlayText} onChange={v => setEditingItem({...editingItem, overlayText: v})} />
                    <Input label="Display Order" type="number" value={editingItem.displayOrder} onChange={v => setEditingItem({...editingItem, displayOrder: parseInt(v) || 0})} />
                  </>
                )}

                {activeTab === 'hall-of-fame' && (
                  <>
                    <Input label="Name" value={editingItem.name} onChange={v => setEditingItem({...editingItem, name: v})} />
                    <TextArea label="Description" value={editingItem.description} onChange={v => setEditingItem({...editingItem, description: v})} />
                    <Input label="Image URL" value={editingItem.imageUrl} onChange={v => setEditingItem({...editingItem, imageUrl: v})} />
                    <Input label="YouTube URL" value={editingItem.youtubeUrl} onChange={v => setEditingItem({...editingItem, youtubeUrl: v})} />
                    <Input label="Display Order" type="number" value={editingItem.displayOrder} onChange={v => setEditingItem({...editingItem, displayOrder: parseInt(v) || 0})} />
                  </>
                )}

                {activeTab === 'codes' && (
                  <>
                    <Input label="Code" value={editingItem.code} onChange={v => setEditingItem({...editingItem, code: v})} />
                    <TextArea label="Description" value={editingItem.description} onChange={v => setEditingItem({...editingItem, description: v})} />
                    <Input label="Display Order" type="number" value={editingItem.displayOrder} onChange={v => setEditingItem({...editingItem, displayOrder: parseInt(v) || 0})} />
                  </>
                )}

                {activeTab === 'updates' && (
                  <>
                    <Input label="Title" value={editingItem.title} onChange={v => setEditingItem({...editingItem, title: v})} />
                    <TextArea label="Description" value={editingItem.description} onChange={v => setEditingItem({...editingItem, description: v})} />
                    <Input label="Image URL" value={editingItem.imageUrl} onChange={v => setEditingItem({...editingItem, imageUrl: v})} />
                    <Input label="Overlay Text (Bottom Right)" value={editingItem.overlayText} onChange={v => setEditingItem({...editingItem, overlayText: v})} />
                    <Input label="Display Order" type="number" value={editingItem.displayOrder} onChange={v => setEditingItem({...editingItem, displayOrder: parseInt(v) || 0})} />
                  </>
                )}

                {activeTab === 'faqs' && (
                  <>
                    <Input label="Question" value={editingItem.question} onChange={v => setEditingItem({...editingItem, question: v})} />
                    <TextArea label="Answer" value={editingItem.answer} onChange={v => setEditingItem({...editingItem, answer: v})} />
                  </>
                )}

                <button type="submit" className="bg-gh-green-light text-black font-bold px-6 py-3 rounded-lg hover:bg-green-400 transition-colors flex items-center gap-2">
                  <Save size={18} /> Save Changes
                </button>
              </form>
            )}

            {/* Settings Form */}
            {activeTab === 'settings' && (
              <form onSubmit={handleSaveSettings} className="space-y-6 max-w-2xl">
                <h3 className="text-2xl font-bold mb-6">Global Settings</h3>
                
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gh-purple">Integrations</h4>
                  <Input label="Discord Invite URL" value={settingsData.discord_invite_url} onChange={v => setSettingsData({...settingsData, discord_invite_url: v})} />
                  <Input label="Discord Webhook URL" value={settingsData.discord_webhook_url} onChange={v => setSettingsData({...settingsData, discord_webhook_url: v})} />
                  <Input label="Roblox Game URL" value={settingsData.game_url} onChange={v => setSettingsData({...settingsData, game_url: v})} />
                </div>

                <div className="space-y-4 pt-4 border-t border-white/10">
                  <h4 className="text-lg font-semibold text-gh-purple">Appearance</h4>
                  <Input label="App Icon URL" value={settingsData.app_icon_url} onChange={v => setSettingsData({...settingsData, app_icon_url: v})} />
                  <Input label="Home Background URL" value={settingsData.bg_home} onChange={v => setSettingsData({...settingsData, bg_home: v})} />
                  <Input label="Mutations Background URL" value={settingsData.bg_mutations} onChange={v => setSettingsData({...settingsData, bg_mutations: v})} />
                  <Input label="Plants Background URL" value={settingsData.bg_plants} onChange={v => setSettingsData({...settingsData, bg_plants: v})} />
                  <Input label="Codes Background URL" value={settingsData.bg_codes} onChange={v => setSettingsData({...settingsData, bg_codes: v})} />
                  <Input label="Updates Background URL" value={settingsData.bg_updates} onChange={v => setSettingsData({...settingsData, bg_updates: v})} />
                </div>

                <div className="space-y-4 pt-4 border-t border-white/10">
                  <h4 className="text-lg font-semibold text-gh-purple">Security</h4>
                  <Input label="Change Dashboard Password" type="password" value={newPassword} onChange={setNewPassword} placeholder="Leave empty to keep current" />
                </div>

                <button type="submit" className="bg-gh-green-light text-black font-bold px-6 py-3 rounded-lg hover:bg-green-400 transition-colors flex items-center gap-2 mt-8">
                  <Save size={18} /> Save Settings
                </button>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", placeholder }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
      <input
        type={type}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gh-green-light"
      />
    </div>
  );
}

function TextArea({ label, value, onChange }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
      <textarea
        rows={4}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gh-green-light resize-none"
      />
    </div>
  );
}
