import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Card from '../ui/Card';
import { Transaction } from '../../types';
import { formatCurrency, calculateBalance } from '../../utils/helpers';
import CreditCard from '../3d/CreditCard';

interface BalanceCardProps {
  transactions: Transaction[];
}

const BalanceCard: React.FC<BalanceCardProps> = ({ transactions }) => {
  const balance = calculateBalance(transactions);
  
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <Card className="bg-gradient-to-r from-[#0A84FF] to-[#5E5CE6] text-white overflow-hidden">
      <div className="flex flex-col space-y-6">
        <div className="h-64 -mx-6 -mt-6">
          <Canvas>
            <PerspectiveCamera makeDefault position={[0, 0, 5]} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <Suspense fallback={null}>
              <CreditCard balance={balance} />
            </Suspense>
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              minPolarAngle={Math.PI / 2.5}
              maxPolarAngle={Math.PI / 2.5}
            />
          </Canvas>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 transform hover:scale-105 transition-transform">
            <div className="flex items-center">
              <ArrowUpRight size={18} className="text-[#30D158] mr-2" />
              <span className="text-white/80 text-sm">Income</span>
            </div>
            <p className="text-xl font-semibold mt-1">{formatCurrency(income)}</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 transform hover:scale-105 transition-transform">
            <div className="flex items-center">
              <ArrowDownRight size={18} className="text-[#FF453A] mr-2" />
              <span className="text-white/80 text-sm">Expenses</span>
            </div>
            <p className="text-xl font-semibold mt-1">{formatCurrency(expenses)}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BalanceCard;