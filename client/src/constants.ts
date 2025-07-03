import { BarChart3, CheckCircle, Award, TrendingUp, Activity } from 'lucide-react';

export const META_FLOAT_REPUTATION_CONTRACT_ADDRES = "0x1DF5405f6393058Fec1E78ecb0B1e0F6B6fA68c4"

export const META_LOAN_ELIGIBILITY_CONTRACT_ADDRESS = "0xe235c14329BFe8DF418947361CE856CAf41A584b"


export const META_LOAN_MANAGER_ADDRESS = "0xDC7B6EBBd5da133aFEcC2F8aA256A05Cf03d459A"

export const META_USDC_ADDRESS = "0xFEce4462D57bD51A6A552365A011b95f0E16d9B7"


export const getScoreCategories = (scores: any) => [
  { 
    name: 'Consistency', 
    score: scores?.consistency || 0, 
    icon: BarChart3, 
    description: 'Spending pattern regularity',
    importance: 'Required for loans (600+ needed)',
    maxScore: 1000,
    isRequired: true
  },
  { 
    name: 'Reliability', 
    score: scores?.reliability || 0, 
    icon: CheckCircle, 
    description: 'Platform stability & recent activity',
    importance: 'Transaction dependability',
    maxScore: 1000,
    isRequired: false
  },
  { 
    name: 'Loyalty', 
    score: scores?.loyalty || 0, 
    icon: Award, 
    description: 'Platform engagement duration',
    importance: 'Long-term user value',
    maxScore: 1000,
    isRequired: false
  },
  { 
    name: 'Sophistication', 
    score: scores?.sophistication || 0, 
    icon: TrendingUp, 
    description: 'Token diversity & transaction complexity',
    importance: 'DeFi experience level',
    maxScore: 1000,
    isRequired: false
  },
  { 
    name: 'Activity', 
    score: scores?.activity || 0, 
    icon: Activity, 
    description: 'Platform usage frequency',
    importance: 'Recent engagement',
    maxScore: 1000,
    isRequired: false
  }
];