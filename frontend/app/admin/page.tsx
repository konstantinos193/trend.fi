"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Settings,
  Pause,
  Play,
  RefreshCw,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [systemStatus, setSystemStatus] = useState({
    contracts: 'operational',
    oracle: 'operational',
    api: 'operational',
    database: 'operational',
  });
  const [emergencyMode, setEmergencyMode] = useState(false);

  const tabs = [
    { id: 'overview', label: 'System Overview', icon: TrendingUp },
    { id: 'markets', label: 'Market Management', icon: DollarSign },
    { id: 'trends', label: 'Trend Management', icon: TrendingUp },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'oracle', label: 'Oracle Settings', icon: Eye },
    { id: 'emergency', label: 'Emergency Controls', icon: AlertTriangle },
  ];

  const systemStats = [
    { label: 'Total Markets', value: '156', change: '+12', positive: true },
    { label: 'Active Users', value: '2,847', change: '+234', positive: true },
    { label: '24h Volume', value: '$1.2M', change: '+18%', positive: true },
    { label: 'System Health', value: '99.9%', change: 'Stable', positive: true },
  ];

  const mockMarkets = [
    { id: 1, name: 'BTC/USD', status: 'active', volume: '$450K', users: 234 },
    { id: 2, name: 'ETH/USD', status: 'active', volume: '$320K', users: 189 },
    { id: 3, name: 'SOL/USD', status: 'suspended', volume: '$0', users: 0 },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* System Status */}
            <div>
              <h3 className="text-lg font-semibold mb-4">System Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(systemStatus).map(([service, status]) => (
                  <div key={service} className="bg-elevated border border-border-dim rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="capitalize font-medium">{service}</span>
                      <div className={`w-3 h-3 rounded-full ${
                        status === 'operational' ? 'bg-neon-lime' : 'bg-neon-magenta'
                      }`} />
                    </div>
                    <span className={`text-sm ${
                      status === 'operational' ? 'text-neon-lime' : 'text-neon-magenta'
                    }`}>
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats Grid */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Platform Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {systemStats.map((stat, index) => (
                  <div key={stat.label} className="bg-elevated border border-border-dim rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-text-secondary">{stat.label}</span>
                      <span className={`text-sm ${
                        stat.positive ? 'text-neon-lime' : 'text-neon-magenta'
                      }`}>
                        {stat.change}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="bg-elevated border border-border-dim rounded-lg p-4">
                <div className="space-y-3">
                  {[
                    'New market created: DOGE/USD',
                    'Oracle price update completed',
                    'Emergency drill conducted',
                    'System backup completed',
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0">
                      <span className="text-text-secondary">{activity}</span>
                      <span className="text-text-dim text-sm">{index + 1}h ago</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'markets':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Market Management</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-neon-cyan/10 border border-neon-cyan/50 text-neon-cyan rounded-lg hover:bg-neon-cyan/20 transition-colors">
                <Plus className="w-4 h-4" />
                Create Market
              </button>
            </div>
            
            <div className="bg-elevated border border-border-dim rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-glass">
                  <tr>
                    <th className="px-4 py-3 text-left text-text-secondary">Market</th>
                    <th className="px-4 py-3 text-left text-text-secondary">Status</th>
                    <th className="px-4 py-3 text-left text-text-secondary">Volume</th>
                    <th className="px-4 py-3 text-left text-text-secondary">Users</th>
                    <th className="px-4 py-3 text-left text-text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {mockMarkets.map((market) => (
                    <tr key={market.id} className="hover:bg-glass">
                      <td className="px-4 py-3 font-medium">{market.name}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          market.status === 'active' 
                            ? 'bg-neon-lime/10 text-neon-lime'
                            : 'bg-neon-magenta/10 text-neon-magenta'
                        }`}>
                          {market.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">{market.volume}</td>
                      <td className="px-4 py-3">{market.users}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button className="p-1 hover:bg-glass rounded">
                            <Edit className="w-4 h-4 text-text-secondary" />
                          </button>
                          <button className="p-1 hover:bg-glass rounded">
                            <Pause className="w-4 h-4 text-text-secondary" />
                          </button>
                          <button className="p-1 hover:bg-glass rounded">
                            <Trash2 className="w-4 h-4 text-neon-magenta" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'trends':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Trend Management</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-neon-cyan/10 border border-neon-cyan/50 text-neon-cyan rounded-lg hover:bg-neon-cyan/20 transition-colors">
                <Plus className="w-4 h-4" />
                Create Trend
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-elevated border border-border-dim rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Trend #{i}</h4>
                    <span className="px-2 py-1 bg-neon-lime/10 text-neon-lime rounded text-xs">
                      Active
                    </span>
                  </div>
                  <p className="text-text-secondary text-sm mb-3">
                    Description for trend #{i} with detailed analysis
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-text-dim">
                      <span>Markets: {i * 3}</span>
                      <span>Accuracy: {75 + i}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-1 hover:bg-glass rounded">
                        <Edit className="w-4 h-4 text-text-secondary" />
                      </button>
                      <button className="p-1 hover:bg-glass rounded">
                        <Trash2 className="w-4 h-4 text-neon-magenta" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">User Management</h3>
            
            <div className="bg-elevated border border-border-dim rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="px-3 py-2 bg-glass border border-border-dim rounded text-sm focus:outline-none focus:border-neon-cyan/50"
                  />
                  <select className="px-3 py-2 bg-glass border border-border-dim rounded text-sm focus:outline-none focus:border-neon-cyan/50">
                    <option>All Users</option>
                    <option>Active</option>
                    <option>Suspended</option>
                  </select>
                </div>
                <button className="flex items-center gap-2 px-3 py-2 bg-neon-cyan/10 border border-neon-cyan/50 text-neon-cyan rounded text-sm hover:bg-neon-cyan/20 transition-colors">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
              
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-border-subtle last:border-0">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-neon-cyan/10 rounded-full flex items-center justify-center">
                        <span className="text-neon-cyan text-sm font-medium">U{i}</span>
                      </div>
                      <div>
                        <p className="font-medium">user{i}@example.com</p>
                        <p className="text-sm text-text-secondary">Joined {i} month{i > 1 ? 's' : ''} ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="px-2 py-1 bg-neon-lime/10 text-neon-lime rounded text-xs">
                        Active
                      </span>
                      <div className="flex items-center gap-2">
                        <button className="p-1 hover:bg-glass rounded">
                          <Eye className="w-4 h-4 text-text-secondary" />
                        </button>
                        <button className="p-1 hover:bg-glass rounded">
                          <Pause className="w-4 h-4 text-text-secondary" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'oracle':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Oracle Management</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-elevated border border-border-dim rounded-lg p-4">
                <h4 className="font-medium mb-4">Oracle Configuration</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Oracle Address
                    </label>
                    <input
                      type="text"
                      defaultValue="0x1234...5678"
                      className="w-full px-3 py-2 bg-glass border border-border-dim rounded focus:outline-none focus:border-neon-cyan/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Update Frequency (seconds)
                    </label>
                    <input
                      type="number"
                      defaultValue="30"
                      className="w-full px-3 py-2 bg-glass border border-border-dim rounded focus:outline-none focus:border-neon-cyan/50"
                    />
                  </div>
                  <button className="px-4 py-2 bg-neon-cyan/10 border border-neon-cyan/50 text-neon-cyan rounded hover:bg-neon-cyan/20 transition-colors">
                    Update Configuration
                  </button>
                </div>
              </div>
              
              <div className="bg-elevated border border-border-dim rounded-lg p-4">
                <h4 className="font-medium mb-4">Oracle Status</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Last Update</span>
                    <span>2 minutes ago</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Update Rate</span>
                    <span className="text-neon-lime">30s</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Success Rate</span>
                    <span className="text-neon-lime">99.8%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Total Updates</span>
                    <span>1,234,567</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'emergency':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Emergency Controls</h3>
            
            <div className="bg-elevated border border-neon-magenta/50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-neon-magenta" />
                <h4 className="text-lg font-medium text-neon-magenta">Emergency Mode</h4>
              </div>
              
              <p className="text-text-secondary mb-6">
                Emergency mode will pause all trading activities and freeze the system. 
                This should only be used in critical situations.
              </p>
              
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="font-medium">Current Status</p>
                  <p className={`text-sm ${
                    emergencyMode ? 'text-neon-magenta' : 'text-neon-lime'
                  }`}>
                    {emergencyMode ? 'Emergency Mode Active' : 'Normal Operations'}
                  </p>
                </div>
                <button
                  onClick={() => setEmergencyMode(!emergencyMode)}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    emergencyMode
                      ? 'bg-neon-lime/10 border border-neon-lime/50 text-neon-lime hover:bg-neon-lime/20'
                      : 'bg-neon-magenta/10 border border-neon-magenta/50 text-neon-magenta hover:bg-neon-magenta/20'
                  }`}
                >
                  {emergencyMode ? (
                    <>
                      <Play className="w-4 h-4 inline mr-2" />
                      Resume Operations
                    </>
                  ) : (
                    <>
                      <Pause className="w-4 h-4 inline mr-2" />
                      Activate Emergency Mode
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-elevated border border-border-dim rounded-lg p-4">
                <h4 className="font-medium mb-4">Quick Actions</h4>
                <div className="space-y-3">
                  <button className="w-full px-4 py-2 bg-glass border border-border-dim rounded hover:bg-elevated transition-colors text-left">
                    Pause All Markets
                  </button>
                  <button className="w-full px-4 py-2 bg-glass border border-border-dim rounded hover:bg-elevated transition-colors text-left">
                    Suspend Oracle Updates
                  </button>
                  <button className="w-full px-4 py-2 bg-glass border border-border-dim rounded hover:bg-elevated transition-colors text-left">
                    Force Close All Positions
                  </button>
                </div>
              </div>
              
              <div className="bg-elevated border border-border-dim rounded-lg p-4">
                <h4 className="font-medium mb-4">System Logs</h4>
                <div className="space-y-2 text-sm">
                  {[
                    'System backup completed successfully',
                    'Emergency drill executed',
                    'Oracle health check passed',
                    'Database optimization completed',
                  ].map((log, index) => (
                    <div key={index} className="flex items-center justify-between py-1">
                      <span className="text-text-secondary">{log}</span>
                      <span className="text-text-dim">{index + 1}h ago</span>
                    </div>
                  ))}
                </div>
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
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-neon-cyan" />
            <h1 className="text-3xl font-bold text-text-primary">Admin Dashboard</h1>
          </div>
          <p className="text-text-secondary">
            System administration and emergency controls
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
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
