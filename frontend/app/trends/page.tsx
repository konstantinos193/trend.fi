"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Plus, 
  TrendingUp, 
  Clock, 
  Star, 
  ChevronRight,
  Activity,
  BarChart3,
  Calendar
} from 'lucide-react';
import TrendCard from '@/components/trends/TrendCard';
import TrendModal from '@/components/trends/TrendModal';

export default function TrendsPage() {
  const [trends, setTrends] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sortBy, setSortBy] = useState('performance');

  const categories = [
    { id: 'all', label: 'All Trends' },
    { id: 'crypto', label: 'Cryptocurrency' },
    { id: 'stocks', label: 'Stocks' },
    { id: 'commodities', label: 'Commodities' },
    { id: 'forex', label: 'Forex' },
  ];

  const sortOptions = [
    { id: 'performance', label: 'Best Performance' },
    { id: 'volume', label: 'Highest Volume' },
    { id: 'recent', label: 'Recently Created' },
    { id: 'popular', label: 'Most Popular' },
  ];

  const mockTrends = [
    {
      id: 1,
      name: 'Bitcoin Bull Run',
      description: 'Long-term upward trend in Bitcoin price driven by institutional adoption',
      category: 'crypto',
      performance: 145.6,
      volume: 12500000,
      markets: 12,
      created: '2024-01-15',
      status: 'active',
      accuracy: 78.5,
    },
    {
      id: 2,
      name: 'Tech Stock Rally',
      description: 'Technology stocks showing strong momentum amid AI boom',
      category: 'stocks',
      performance: 89.3,
      volume: 8900000,
      markets: 8,
      created: '2024-01-20',
      status: 'active',
      accuracy: 72.1,
    },
    {
      id: 3,
      name: 'Gold Safe Haven',
      description: 'Gold prices rising as investors seek safe haven assets',
      category: 'commodities',
      performance: 34.2,
      volume: 5600000,
      markets: 6,
      created: '2024-01-10',
      status: 'active',
      accuracy: 68.9,
    },
  ];

  return (
    <div className="min-h-screen bg-void text-text-primary">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">
                Trends Explorer
              </h1>
              <p className="text-text-secondary">
                Discover and analyze market trends across various asset classes
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-neon-cyan/10 border border-neon-cyan/50 text-neon-cyan rounded-lg hover:bg-neon-cyan/20 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Trend
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-dim" />
              <input
                type="text"
                placeholder="Search trends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-elevated border border-border-dim rounded-lg focus:outline-none focus:border-neon-cyan/50 text-text-primary placeholder-text-dim"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-text-secondary" />
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    selectedCategory === category.id
                      ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50'
                      : 'bg-elevated border border-border-dim text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-elevated border border-border-dim rounded-lg focus:outline-none focus:border-neon-cyan/50 text-text-primary"
            >
              {sortOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Trends', value: '24', icon: TrendingUp, change: '+3 new' },
            { label: 'Active Markets', value: '156', icon: BarChart3, change: '+12 today' },
            { label: 'Total Volume', value: '$2.3M', icon: Activity, change: '+18%' },
            { label: 'Avg Accuracy', value: '74.2%', icon: Star, change: '+2.1%' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-elevated border border-border-dim rounded-xl p-6 shadow-glass"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-neon-cyan/10 rounded-lg">
                  <stat.icon className="w-5 h-5 text-neon-cyan" />
                </div>
                <span className="text-sm text-neon-cyan">{stat.change}</span>
              </div>
              <div>
                <p className="text-text-secondary text-sm mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trends Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {mockTrends.map((trend, index) => (
            <motion.div
              key={trend.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <TrendCard trend={trend} />
            </motion.div>
          ))}
        </div>

        {/* Load More */}
        <div className="flex justify-center mt-8">
          <button className="px-6 py-3 bg-elevated border border-border-dim rounded-lg hover:bg-glass transition-colors flex items-center gap-2">
            Load More Trends
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Create Trend Modal */}
      {showCreateModal && (
        <TrendModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}
