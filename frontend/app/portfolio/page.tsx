"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  AlertTriangle,
  Eye,
  EyeOff,
  Filter,
  Download
} from 'lucide-react';
import PositionCard from '@/components/portfolio/PositionCard';
import PerformanceChart from '@/components/portfolio/PerformanceChart';
import RiskMetrics from '@/components/portfolio/RiskMetrics';

export default function PortfolioPage() {
  const [positions, setPositions] = useState([]);
  const [showPnL, setShowPnL] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [portfolioStats, setPortfolioStats] = useState({
    totalValue: 125432.89,
    totalPnL: 8234.56,
    winRate: 68.5,
    totalTrades: 147,
    activePositions: 8,
    marginUsed: 45.2,
  });

  const filters = [
    { id: 'all', label: 'All Positions' },
    { id: 'long', label: 'Long Only' },
    { id: 'short', label: 'Short Only' },
    { id: 'profitable', label: 'Profitable' },
    { id: 'losing', label: 'Losing' },
  ];

  return (
    <div className="min-h-screen bg-void text-text-primary">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">
                Portfolio Overview
              </h1>
              <p className="text-text-secondary">
                Track your trading performance and manage positions
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-elevated border border-border-dim rounded-lg hover:bg-glass transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* Portfolio Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: 'Total Value',
                value: `$${portfolioStats.totalValue.toLocaleString()}`,
                change: '+12.3%',
                positive: true,
                icon: DollarSign,
              },
              {
                label: 'Total PnL',
                value: `$${portfolioStats.totalPnL.toLocaleString()}`,
                change: '+$2,345',
                positive: true,
                icon: TrendingUp,
              },
              {
                label: 'Win Rate',
                value: `${portfolioStats.winRate}%`,
                change: '+3.2%',
                positive: true,
                icon: Activity,
              },
              {
                label: 'Margin Used',
                value: `${portfolioStats.marginUsed}%`,
                change: '-2.1%',
                positive: false,
                icon: AlertTriangle,
                warning: portfolioStats.marginUsed > 80,
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-elevated border border-border-dim rounded-xl p-6 shadow-glass ${
                  stat.warning ? 'border-neon-magenta/50' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg ${
                    stat.positive ? 'bg-neon-cyan/10' : 'bg-neon-magenta/10'
                  }`}>
                    <stat.icon className={`w-5 h-5 ${
                      stat.positive ? 'text-neon-cyan' : 'text-neon-magenta'
                    }`} />
                  </div>
                  <span className={`text-sm font-medium ${
                    stat.positive ? 'text-neon-cyan' : 'text-neon-magenta'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <div>
                  <p className="text-text-secondary text-sm mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Filters and Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-text-secondary" />
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    selectedFilter === filter.id
                      ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50'
                      : 'bg-elevated border border-border-dim text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowPnL(!showPnL)}
              className="flex items-center gap-2 px-4 py-2 bg-elevated border border-border-dim rounded-lg hover:bg-glass transition-colors"
            >
              {showPnL ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showPnL ? 'Hide' : 'Show'} PnL
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Positions List */}
          <div className="lg:col-span-2 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-elevated border border-border-dim rounded-xl p-6 shadow-glass"
            >
              <h2 className="text-xl font-semibold mb-4">Active Positions</h2>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <PositionCard 
                    key={i} 
                    showPnL={showPnL}
                    position={{
                      id: i,
                      market: 'BTC/USD',
                      direction: i % 2 === 0 ? 'long' : 'short',
                      size: 1000 * i,
                      entryPrice: 43000 + (i * 100),
                      currentPrice: 43567,
                      pnl: i % 2 === 0 ? 567 * i : -234 * i,
                      leverage: 5,
                      margin: 200 * i,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-elevated border border-border-dim rounded-xl p-6 shadow-glass"
            >
              <PerformanceChart />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-elevated border border-border-dim rounded-xl p-6 shadow-glass"
            >
              <RiskMetrics />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
