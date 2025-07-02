import { BarChart3, CheckCircle, Award, TrendingUp, Activity } from 'lucide-react';

export const META_FLOAT_REPUTATION_CONTRACT_ADDRES = "0x8d6884DF71818AC93ead8c8b51b39f7140D6fBdD"



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