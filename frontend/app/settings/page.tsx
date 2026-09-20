"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  DollarSign,
  Sliders,
  Save,
  Moon,
  Sun,
  Volume2,
  Wifi
} from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState({
    priceAlerts: true,
    tradeUpdates: true,
    marketNews: false,
    systemUpdates: true,
  });
  const [tradingPreferences, setTradingPreferences] = useState({
    defaultLeverage: '5x',
    slippage: '0.5%',
    confirmOrders: true,
    showPnL: true,
  });
  const [displaySettings, setDisplaySettings] = useState({
    theme: 'dark',
    language: 'en',
    animations: true,
    soundEffects: false,
    autoConnect: true,
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'trading', label: 'Trading', icon: DollarSign },
    { id: 'display', label: 'Display', icon: Palette },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'advanced', label: 'Advanced', icon: Sliders },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    defaultValue="trader_pro"
                    className="w-full px-4 py-2 bg-elevated border border-border-dim rounded-lg focus:outline-none focus:border-neon-cyan/50 text-text-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue="trader@example.com"
                    className="w-full px-4 py-2 bg-elevated border border-border-dim rounded-lg focus:outline-none focus:border-neon-cyan/50 text-text-primary"
                  />
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Bio</h3>
              <textarea
                rows={4}
                defaultValue="Professional trend trader with 5+ years of experience"
                className="w-full px-4 py-2 bg-elevated border border-border-dim rounded-lg focus:outline-none focus:border-neon-cyan/50 text-text-primary resize-none"
              />
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
            <div className="space-y-4">
              {Object.entries({
                priceAlerts: 'Price Alerts',
                tradeUpdates: 'Trade Updates',
                marketNews: 'Market News',
                systemUpdates: 'System Updates',
              }).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{label}</p>
                    <p className="text-sm text-text-secondary">
                      Get notified about {label.toLowerCase()}
                    </p>
                  </div>
                  <button
                    onClick={() => setNotifications(prev => ({
                      ...prev,
                      [key]: !prev[key as keyof typeof notifications]
                    }))}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      notifications[key as keyof typeof notifications]
                        ? 'bg-neon-cyan'
                        : 'bg-border-dim'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      notifications[key as keyof typeof notifications]
                        ? 'translate-x-6'
                        : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'trading':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Trading Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Default Leverage
                </label>
                <select
                  value={tradingPreferences.defaultLeverage}
                  onChange={(e) => setTradingPreferences(prev => ({
                    ...prev,
                    defaultLeverage: e.target.value
                  }))}
                  className="w-full px-4 py-2 bg-elevated border border-border-dim rounded-lg focus:outline-none focus:border-neon-cyan/50 text-text-primary"
                >
                  <option value="1x">1x</option>
                  <option value="2x">2x</option>
                  <option value="5x">5x</option>
                  <option value="10x">10x</option>
                  <option value="20x">20x</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Slippage Tolerance
                </label>
                <select
                  value={tradingPreferences.slippage}
                  onChange={(e) => setTradingPreferences(prev => ({
                    ...prev,
                    slippage: e.target.value
                  }))}
                  className="w-full px-4 py-2 bg-elevated border border-border-dim rounded-lg focus:outline-none focus:border-neon-cyan/50 text-text-primary"
                >
                  <option value="0.1%">0.1%</option>
                  <option value="0.5%">0.5%</option>
                  <option value="1%">1%</option>
                  <option value="2%">2%</option>
                </select>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { key: 'confirmOrders', label: 'Confirm all orders before execution' },
                { key: 'showPnL', label: 'Show PnL in real-time' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <p className="font-medium">{label}</p>
                  <button
                    onClick={() => setTradingPreferences(prev => ({
                      ...prev,
                      [key]: !prev[key as keyof typeof tradingPreferences]
                    }))}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      tradingPreferences[key as keyof typeof tradingPreferences]
                        ? 'bg-neon-cyan'
                        : 'bg-border-dim'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      tradingPreferences[key as keyof typeof tradingPreferences]
                        ? 'translate-x-6'
                        : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'display':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Display Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Theme
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDisplaySettings(prev => ({ ...prev, theme: 'dark' }))}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      displaySettings.theme === 'dark'
                        ? 'bg-neon-cyan/20 border-neon-cyan/50 text-neon-cyan'
                        : 'bg-elevated border-border-dim text-text-secondary'
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    Dark
                  </button>
                  <button
                    onClick={() => setDisplaySettings(prev => ({ ...prev, theme: 'light' }))}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      displaySettings.theme === 'light'
                        ? 'bg-neon-cyan/20 border-neon-cyan/50 text-neon-cyan'
                        : 'bg-elevated border-border-dim text-text-secondary'
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    Light
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Language
                </label>
                <select
                  value={displaySettings.language}
                  onChange={(e) => setDisplaySettings(prev => ({
                    ...prev,
                    language: e.target.value
                  }))}
                  className="w-full px-4 py-2 bg-elevated border border-border-dim rounded-lg focus:outline-none focus:border-neon-cyan/50 text-text-primary"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { key: 'animations', label: 'Enable animations', icon: motion ? undefined : null },
                { key: 'soundEffects', label: 'Sound effects', icon: Volume2 },
                { key: 'autoConnect', label: 'Auto-connect wallet', icon: Wifi },
              ].map(({ key, label, icon: Icon }) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {Icon && <Icon className="w-4 h-4 text-text-secondary" />}
                    <p className="font-medium">{label}</p>
                  </div>
                  <button
                    onClick={() => setDisplaySettings(prev => ({
                      ...prev,
                      [key]: !prev[key as keyof typeof displaySettings]
                    }))}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      displaySettings[key as keyof typeof displaySettings]
                        ? 'bg-neon-cyan'
                        : 'bg-border-dim'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      displaySettings[key as keyof typeof displaySettings]
                        ? 'translate-x-6'
                        : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
            <div className="space-y-4">
              <div className="p-4 bg-elevated border border-border-dim rounded-lg">
                <h4 className="font-medium mb-2">Two-Factor Authentication</h4>
                <p className="text-sm text-text-secondary mb-3">
                  Add an extra layer of security to your account
                </p>
                <button className="px-4 py-2 bg-neon-cyan/10 border border-neon-cyan/50 text-neon-cyan rounded-lg hover:bg-neon-cyan/20 transition-colors">
                  Enable 2FA
                </button>
              </div>
              <div className="p-4 bg-elevated border border-border-dim rounded-lg">
                <h4 className="font-medium mb-2">Session Management</h4>
                <p className="text-sm text-text-secondary mb-3">
                  Manage your active sessions across devices
                </p>
                <button className="px-4 py-2 bg-elevated border border-border-dim rounded-lg hover:bg-glass transition-colors">
                  View Sessions
                </button>
              </div>
            </div>
          </div>
        );

      case 'advanced':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Advanced Settings</h3>
            <div className="space-y-4">
              <div className="p-4 bg-elevated border border-border-dim rounded-lg">
                <h4 className="font-medium mb-2">API Access</h4>
                <p className="text-sm text-text-secondary mb-3">
                  Generate API keys for programmatic access
                </p>
                <button className="px-4 py-2 bg-elevated border border-border-dim rounded-lg hover:bg-glass transition-colors">
                  Manage API Keys
                </button>
              </div>
              <div className="p-4 bg-elevated border border-border-dim rounded-lg">
                <h4 className="font-medium mb-2">Data Export</h4>
                <p className="text-sm text-text-secondary mb-3">
                  Download your trading history and account data
                </p>
                <button className="px-4 py-2 bg-elevated border border-border-dim rounded-lg hover:bg-glass transition-colors">
                  Export Data
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-void text-text-primary">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Settings</h1>
          <p className="text-text-secondary">
            Manage your account preferences and trading settings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-elevated border border-border-dim rounded-xl p-4 shadow-glass">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/50'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-elevated border border-border-dim rounded-xl p-6 shadow-glass"
            >
              {renderTabContent()}
              
              {/* Save Button */}
              <div className="mt-8 flex justify-end">
                <button className="flex items-center gap-2 px-6 py-3 bg-neon-cyan/10 border border-neon-cyan/50 text-neon-cyan rounded-lg hover:bg-neon-cyan/20 transition-colors">
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
