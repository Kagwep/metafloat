import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
from dataclasses import dataclass
from typing import Dict, List, Tuple
from enum import Enum

class TrustLevel(Enum):
    BRONZE = "Bronze"
    SILVER = "Silver" 
    GOLD = "Gold"
    PLATINUM = "Platinum"

class UserClass(Enum):
    NEWCOMER = "Newcomer"
    CASUAL_USER = "Casual User"
    REGULAR_USER = "Regular User"
    POWER_USER = "Power User"
    WHALE = "Whale"
    VETERAN = "Veteran"

@dataclass
class ReputationScores:
    consistency_score: float      # 0-1000: Spending pattern regularity
    loyalty_score: float         # 0-1000: Platform engagement duration  
    sophistication_score: float  # 0-1000: Multi-token usage & complexity
    activity_score: float        # 0-1000: Transaction frequency
    reliability_score: float     # 0-1000: Success rate & platform stability
    overall_reputation: float    # 0-1000: Weighted composite score

@dataclass
class UserProfile:
    wallet_address: str
    verification_timestamp: datetime
    trust_level: TrustLevel
    user_class: UserClass
    reputation_scores: ReputationScores
    behavioral_metrics: Dict
    classification_reasoning: List[str]

class MetaSenseReputationEngine:
    """
    Core engine for calculating reputation scores and user classifications
    from MetaMask card spending data
    """
    
    def __init__(self, spending_data_csv: str):
        """Initialize with MetaMask spending data"""
        self.df = pd.read_csv(spending_data_csv)
        self.df['timestamp'] = pd.to_datetime(self.df['timestamp'])
        self.df['date'] = self.df['timestamp'].dt.date
        
        # Score weights for overall reputation
        self.score_weights = {
            'consistency': 0.25,    # Most important for predictability
            'loyalty': 0.25,        # Platform commitment
            'sophistication': 0.20, # DeFi experience
            'activity': 0.15,       # Engagement level
            'reliability': 0.15     # Platform stability
        }
        
        print(f"🚀 MetaSense Reputation Engine initialized")
        print(f"📊 Processing {len(self.df):,} transactions from {self.df['user_wallet'].nunique():,} users")
        
    def analyze_all_users(self) -> Dict[str, UserProfile]:
        """Analyze all users and generate reputation profiles"""
        print("🧮 Analyzing user reputation profiles...")
        
        profiles = {}
        unique_users = self.df['user_wallet'].unique()
        
        for i, wallet in enumerate(unique_users):
            if i % 50 == 0:
                print(f"  Progress: {i}/{len(unique_users)} users analyzed ({i/len(unique_users)*100:.1f}%)")
                
            user_data = self.df[self.df['user_wallet'] == wallet].copy()
            profile = self._analyze_single_user(wallet, user_data)
            profiles[wallet] = profile
            
        print(f"✅ Analysis complete! {len(profiles)} user profiles generated")
        return profiles
        
    def _analyze_single_user(self, wallet: str, user_data: pd.DataFrame) -> UserProfile:
        """Analyze a single user's spending patterns"""
        
        # Extract behavioral metrics
        metrics = self._extract_behavioral_metrics(user_data)
        
        # Calculate reputation scores
        scores = self._calculate_reputation_scores(metrics)
        
        # Classify user
        user_class = self._classify_user(metrics, scores)
        trust_level = self._determine_trust_level(scores.overall_reputation)
        
        # Generate reasoning
        reasoning = self._generate_classification_reasoning(metrics, scores, user_class, trust_level)
        
        return UserProfile(
            wallet_address=wallet,
            verification_timestamp=datetime.now(),
            trust_level=trust_level,
            user_class=user_class,
            reputation_scores=scores,
            behavioral_metrics=metrics,
            classification_reasoning=reasoning
        )
        
    def _extract_behavioral_metrics(self, user_data: pd.DataFrame) -> Dict:
        """Extract key behavioral metrics from user spending data"""
        
        # Basic statistics
        total_transactions = len(user_data)
        total_volume = user_data['amount'].sum()
        avg_transaction = user_data['amount'].mean()
        median_transaction = user_data['amount'].median()
        
        # Time-based patterns
        first_tx = user_data['timestamp'].min()
        last_tx = user_data['timestamp'].max()
        days_active = (user_data['date'].max() - user_data['date'].min()).days + 1
        platform_tenure = (datetime.now() - first_tx).days
        transaction_frequency = total_transactions / max(days_active, 1)
        
        # Spending patterns
        spending_std = user_data['amount'].std()
        spending_cv = spending_std / avg_transaction if avg_transaction > 0 else 0
        
        # Large transaction analysis
        large_threshold = user_data['amount'].quantile(0.8)
        large_transactions = (user_data['amount'] >= large_threshold).sum()
        large_tx_ratio = large_transactions / total_transactions
        
        # Token usage analysis
        unique_tokens = user_data['token_symbol'].nunique()
        most_used_token = user_data['token_symbol'].mode().iloc[0] if len(user_data) > 0 else 'UNKNOWN'
        token_concentration = user_data['token_symbol'].value_counts().iloc[0] / total_transactions
        
        # Temporal patterns
        daily_spending = user_data.groupby('date')['amount'].sum()
        spending_consistency = 1 / (daily_spending.std() + 1) if len(daily_spending) > 1 else 0.5
        
        # Recent activity (last 30 days)
        recent_cutoff = datetime.now() - timedelta(days=30)
        recent_activity = user_data[user_data['timestamp'] >= recent_cutoff]
        recent_transactions = len(recent_activity)
        days_since_last_tx = (datetime.now() - last_tx).days
        
        return {
            # Volume metrics
            'total_transactions': total_transactions,
            'total_volume': total_volume,
            'avg_transaction': avg_transaction,
            'median_transaction': median_transaction,
            
            # Time metrics
            'platform_tenure': platform_tenure,
            'days_active': days_active,
            'transaction_frequency': transaction_frequency,
            'days_since_last_tx': days_since_last_tx,
            
            # Pattern metrics
            'spending_cv': spending_cv,
            'spending_consistency': spending_consistency,
            'large_tx_ratio': large_tx_ratio,
            
            # Token metrics
            'unique_tokens': unique_tokens,
            'token_concentration': token_concentration,
            'most_used_token': most_used_token,
            
            # Activity metrics
            'recent_transactions': recent_transactions,
            'first_transaction': first_tx,
            'last_transaction': last_tx
        }
        
    def _calculate_reputation_scores(self, metrics: Dict) -> ReputationScores:
        """Calculate the five core reputation scores"""
        
        # 1. Consistency Score (0-1000)
        # Lower coefficient of variation = higher consistency
        cv = metrics['spending_cv']
        consistency_raw = max(0, 1 - cv)  # Invert CV (lower CV = higher score)
        consistency_score = min(1000, consistency_raw * 1000)
        
        # 2. Loyalty Score (0-1000) 
        # Platform tenure + sustained usage
        tenure_days = metrics['platform_tenure']
        tenure_score = min(1, tenure_days / 365)  # Max score at 1 year
        
        frequency = metrics['transaction_frequency']
        frequency_score = min(1, frequency / 2)  # Max score at 2 txs/day
        
        loyalty_raw = (tenure_score * 0.7) + (frequency_score * 0.3)
        loyalty_score = loyalty_raw * 1000
        
        # 3. Sophistication Score (0-1000)
        # Token diversity + transaction complexity
        token_diversity = metrics['unique_tokens']
        diversity_score = min(1, token_diversity / 5)  # Max score at 5 different tokens
        
        avg_amount = metrics['avg_transaction']
        amount_score = min(1, avg_amount / 1000)  # Max score at $1000 avg
        
        sophistication_raw = (diversity_score * 0.6) + (amount_score * 0.4)
        sophistication_score = sophistication_raw * 1000
        
        # 4. Activity Score (0-1000)
        # Transaction frequency + recent activity
        freq = metrics['transaction_frequency']
        frequency_score = min(1, freq / 3)  # Max score at 3 txs/day
        
        recent_ratio = metrics['recent_transactions'] / max(metrics['total_transactions'], 1)
        recency_score = recent_ratio  # Recent activity ratio
        
        activity_raw = (frequency_score * 0.7) + (recency_score * 0.3)
        activity_score = activity_raw * 1000
        
        # 5. Reliability Score (0-1000)
        # Platform stability + consistent usage
        consistency = metrics['spending_consistency']
        consistency_score = min(1, consistency * 2)  # Boost consistency
        
        days_since_last = metrics['days_since_last_tx']
        recency_penalty = max(0, 1 - (days_since_last / 30))  # Penalty for inactivity
        
        reliability_raw = (consistency_score * 0.6) + (recency_penalty * 0.4)
        reliability_score = reliability_raw * 1000
        
        # Overall Reputation (weighted average)
        overall = (
            consistency_score * self.score_weights['consistency'] +
            loyalty_score * self.score_weights['loyalty'] +
            sophistication_score * self.score_weights['sophistication'] +
            activity_score * self.score_weights['activity'] +
            reliability_score * self.score_weights['reliability']
        )
        
        return ReputationScores(
            consistency_score=round(consistency_score, 1),
            loyalty_score=round(loyalty_score, 1),
            sophistication_score=round(sophistication_score, 1),
            activity_score=round(activity_score, 1),
            reliability_score=round(reliability_score, 1),
            overall_reputation=round(overall, 1)
        )
        
    def _classify_user(self, metrics: Dict, scores: ReputationScores) -> UserClass:
        """Classify user based on behavioral patterns and scores"""
        
        total_txs = metrics['total_transactions']
        total_volume = metrics['total_volume']
        tenure = metrics['platform_tenure']
        frequency = metrics['transaction_frequency']
        avg_amount = metrics['avg_transaction']
        
        # Classification logic
        if tenure >= 180 and total_txs >= 50 and scores.overall_reputation >= 700:
            return UserClass.VETERAN
            
        elif total_volume >= 10000 or avg_amount >= 500:
            return UserClass.WHALE
            
        elif total_txs >= 30 and frequency >= 1.0 and scores.overall_reputation >= 600:
            return UserClass.POWER_USER
            
        elif total_txs >= 10 and tenure >= 30 and scores.overall_reputation >= 400:
            return UserClass.REGULAR_USER
            
        elif total_txs >= 3 and tenure >= 7:
            return UserClass.CASUAL_USER
            
        else:
            return UserClass.NEWCOMER
            
    def _determine_trust_level(self, overall_reputation: float) -> TrustLevel:
        """Determine trust level based on overall reputation score"""
        
        if overall_reputation >= 800:
            return TrustLevel.PLATINUM
        elif overall_reputation >= 600:
            return TrustLevel.GOLD
        elif overall_reputation >= 400:
            return TrustLevel.SILVER
        else:
            return TrustLevel.BRONZE
            
    def _generate_classification_reasoning(self, metrics: Dict, scores: ReputationScores, 
                                         user_class: UserClass, trust_level: TrustLevel) -> List[str]:
        """Generate human-readable reasoning for the classification"""
        
        reasoning = []
        
        # Trust level reasoning
        if trust_level == TrustLevel.PLATINUM:
            reasoning.append("Exceptional reputation (800+ score) demonstrates highest reliability")
        elif trust_level == TrustLevel.GOLD:
            reasoning.append("Strong reputation (600+ score) shows consistent good behavior")
        elif trust_level == TrustLevel.SILVER:
            reasoning.append("Moderate reputation (400+ score) indicates developing trust")
        else:
            reasoning.append("Building reputation (<400 score) - new or inconsistent user")
            
        # User class reasoning
        if user_class == UserClass.VETERAN:
            reasoning.append(f"Veteran status: {metrics['platform_tenure']} days tenure with {metrics['total_transactions']} transactions")
        elif user_class == UserClass.WHALE:
            reasoning.append(f"High-value user: ${metrics['total_volume']:.2f} total volume, ${metrics['avg_transaction']:.2f} average")
        elif user_class == UserClass.POWER_USER:
            reasoning.append(f"Power user: {metrics['transaction_frequency']:.1f} txs/day frequency with consistent patterns")
        elif user_class == UserClass.REGULAR_USER:
            reasoning.append(f"Regular user: {metrics['total_transactions']} transactions over {metrics['platform_tenure']} days")
        elif user_class == UserClass.CASUAL_USER:
            reasoning.append(f"Casual usage: {metrics['total_transactions']} transactions, moderate engagement")
        else:
            reasoning.append("New user: Limited transaction history for full assessment")
            
        # Score highlights
        if scores.consistency_score >= 700:
            reasoning.append(f"Highly consistent spending patterns (score: {scores.consistency_score:.0f})")
        if scores.loyalty_score >= 700:
            reasoning.append(f"Strong platform loyalty (score: {scores.loyalty_score:.0f})")
        if scores.sophistication_score >= 700:
            reasoning.append(f"Advanced DeFi user with {metrics['unique_tokens']} different tokens")
            
        return reasoning
        
    def generate_reputation_report(self, profiles: Dict[str, UserProfile]) -> Dict:
        """Generate comprehensive reputation analysis report"""
        
        print("\n" + "="*80)
        print("📋 METASENSE REPUTATION ANALYSIS REPORT")
        print("="*80)
        
        total_users = len(profiles)
        
        # Trust level distribution
        trust_distribution = {}
        class_distribution = {}
        
        for profile in profiles.values():
            trust_level = profile.trust_level.value
            user_class = profile.user_class.value
            
            trust_distribution[trust_level] = trust_distribution.get(trust_level, 0) + 1
            class_distribution[user_class] = class_distribution.get(user_class, 0) + 1
            
        print(f"👥 USER TRUST DISTRIBUTION ({total_users:,} total users):")
        for level, count in trust_distribution.items():
            percentage = (count / total_users) * 100
            avg_score = np.mean([p.reputation_scores.overall_reputation 
                               for p in profiles.values() 
                               if p.trust_level.value == level])
            print(f"  {level}: {count:,} users ({percentage:.1f}%) - Avg Score: {avg_score:.0f}")
            
        print(f"\n🎯 USER CLASS DISTRIBUTION:")
        for user_class, count in class_distribution.items():
            percentage = (count / total_users) * 100
            print(f"  {user_class}: {count:,} users ({percentage:.1f}%)")
            
        # Top users by reputation
        print(f"\n🏆 TOP 10 REPUTATION USERS:")
        sorted_profiles = sorted(profiles.values(), 
                               key=lambda p: p.reputation_scores.overall_reputation, 
                               reverse=True)
        
        for i, profile in enumerate(sorted_profiles[:10], 1):
            scores = profile.reputation_scores
            print(f"  {i:2d}. {profile.wallet_address[:12]}... - {scores.overall_reputation:.0f} score")
            print(f"      Trust: {profile.trust_level.value} | Class: {profile.user_class.value}")
            print(f"      Scores: C:{scores.consistency_score:.0f} L:{scores.loyalty_score:.0f} "
                  f"S:{scores.sophistication_score:.0f} A:{scores.activity_score:.0f} R:{scores.reliability_score:.0f}")
            
        return {
            'total_users': total_users,
            'trust_distribution': trust_distribution,
            'class_distribution': class_distribution,
            'top_users': sorted_profiles[:10]
        }
        
    def export_reputation_data(self, profiles: Dict[str, UserProfile], filename_prefix: str = "metasense_reputation"):
        """Export reputation data for on-chain integration"""
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Create DataFrame for export
        export_data = []
        for profile in profiles.values():
            scores = profile.reputation_scores
            export_data.append({
                'wallet_address': profile.wallet_address,
                'overall_reputation': scores.overall_reputation,
                'consistency_score': scores.consistency_score,
                'loyalty_score': scores.loyalty_score,
                'sophistication_score': scores.sophistication_score,
                'activity_score': scores.activity_score,
                'reliability_score': scores.reliability_score,
                'trust_level': profile.trust_level.value,
                'user_class': profile.user_class.value,
                'verification_timestamp': profile.verification_timestamp.isoformat(),
                'reasoning': ' | '.join(profile.classification_reasoning)
            })
            
        df = pd.DataFrame(export_data)
        
        # Export to CSV
        csv_filename = f"{filename_prefix}_{timestamp}.csv"
        df.to_csv(csv_filename, index=False)
        print(f"📄 Reputation data exported to: {csv_filename}")
        
        # Export smart contract integration data
        contract_data = []
        for profile in profiles.values():
            contract_data.append({
                'address': profile.wallet_address,
                'overallReputation': int(profile.reputation_scores.overall_reputation),
                'trustLevel': ['Bronze', 'Silver', 'Gold', 'Platinum'].index(profile.trust_level.value),
                'verifiedHuman': True,
                'scores': [
                    int(profile.reputation_scores.consistency_score),
                    int(profile.reputation_scores.loyalty_score),
                    int(profile.reputation_scores.sophistication_score),
                    int(profile.reputation_scores.activity_score),
                    int(profile.reputation_scores.reliability_score)
                ]
            })
            
        json_filename = f"{filename_prefix}_contract_data_{timestamp}.json"
        with open(json_filename, 'w') as f:
            json.dump(contract_data, f, indent=2)
        print(f"📄 Smart contract data exported to: {json_filename}")
        
        return csv_filename, json_filename

# Usage example
if __name__ == "__main__":
    # Initialize reputation engine
    csv_file = "metamask_preliminary_2050of10000_20250701_010659.csv"
    
    print("🚀 MetaSense Reputation Engine")
    print("="*60)
    
    # Create engine
    engine = MetaSenseReputationEngine(csv_file)
    
    # Analyze all users
    profiles = engine.analyze_all_users()
    
    # Generate report
    report = engine.generate_reputation_report(profiles)
    
    # Export data
    files = engine.export_reputation_data(profiles)
    
    print(f"\n✅ MetaSense reputation analysis complete!")
    print(f"📊 {len(profiles)} user profiles generated")
    print(f"📄 Data exported to: {files[0]} and {files[1]}")
    print(f"\n🎯 Ready for smart contract integration!")