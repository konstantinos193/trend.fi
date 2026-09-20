"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ArrowUpDown, Settings, BarChart3 } from 'lucide-react';
import TradingChart from '@/components/trade/TradingChart';
import OrderForm from '@/components/trade/OrderForm';
import OrderBook from '@/components/trade/OrderBook';
import MarketDepth from '@/components/trade/MarketDepth';
import RecentTrades from '@/components/trade/RecentTrades';
import PositionManager from '@/components/trade/PositionManager';

export default function TradingPage() {
  const params = useParams();
  const marketId = params?.marketId as string;
  const [selectedTab, setSelectedTab] = useState('chart');
  const [marketData, setMarketData] = useState(null);

  useEffect(() => {
    // Fetch market data based on marketId
    // This would integrate with your API
  }, [marketId]);

  return (
    <div className="min-h-screen bg-void text-text-primary">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">
                BTC/USD Trend Market
              </h1>
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-neon-cyan">$43,567.89</span>
                <span className="flex items-center text-neon-lime bg-neon-lime/10 px-2 py-1 rounded">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +2.34%
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-elevated rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 bg-elevated p-1 rounded-lg">
            {[
              { id: 'chart', label: 'Chart', icon: BarChart3 },
              { id: 'orderbook', label: 'Order Book', icon: ArrowUpDown },
              { id: 'depth', label: 'Depth', icon: TrendingUp },
              { id: 'trades', label: 'Trades', icon: ArrowUpDown },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                  selectedTab === tab.id
                    ? 'bg-neon-cyan/20 text-neon-cyan'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Chart/Trading View */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-elevated border border-border-dim rounded-xl p-6 shadow-glass"
            >
              {selectedTab === 'chart' && <TradingChart />}
              {selectedTab === 'orderbook' && <OrderBook />}
              {selectedTab === 'depth' && <MarketDepth />}
              {selectedTab === 'trades' && <RecentTrades />}
            </motion.div>

            {/* Position Manager */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-elevated border border-border-dim rounded-xl p-6 shadow-glass"
            >
              <PositionManager />
            </motion.div>
          </div>

          {/* Right Column - Order Form */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-elevated border border-border-dim rounded-xl p-6 shadow-glass sticky top-6"
            >
              <OrderForm marketId={marketId} />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
