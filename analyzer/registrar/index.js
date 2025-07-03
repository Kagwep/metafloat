
const Papa = require('papaparse');
const { MetaFloatReputationContract } = require('./metaFloatReputation');

// Enums
const TrustLevel = {
    BRONZE: "Bronze",
    SILVER: "Silver",
    GOLD: "Gold", 
    PLATINUM: "Platinum"
};

const UserClass = {
    NEWCOMER: "Newcomer",
    CASUAL_USER: "Casual User",
    REGULAR_USER: "Regular User",
    POWER_USER: "Power User",
    WHALE: "Whale",
    VETERAN: "Veteran"
};



class MetaSenseReputationEngine {
    constructor(csvData) {
        // Parse CSV data with better decimal handling
        const parsed = Papa.parse(csvData, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true
        });
        
        this.data = parsed.data.map(row => ({
            ...row,
            timestamp: new Date(row.timestamp),
            date: new Date(row.timestamp).toISOString().split('T')[0],
            amount: parseFloat(row.amount) || 0
        }));
        
        // Score weights for overall reputation
        this.scoreWeights = {
            consistency: 0.25,
            loyalty: 0.25,
            sophistication: 0.20,
            activity: 0.15,
            reliability: 0.15
        };
        
        console.log(`MetaSense Engine initialized with ${this.data.length} transactions`);
    }
    
    getUserProfile(walletAddress) {
        const userData = this.data.filter(row => 
            row.user_wallet === walletAddress || row.wallet_address === walletAddress
        );
        
        if (userData.length === 0) {
            return null;
        }
        
        return this._analyzeSingleUser(walletAddress, userData);
    }
    
    _analyzeSingleUser(wallet, userData) {
        // Extract behavioral metrics
        const metrics = this._extractBehavioralMetrics(userData);
        
        // Calculate reputation scores
        const scores = this._calculateReputationScores(metrics);
        
        // Classify user
        const userClass = this._classifyUser(metrics, scores);
        const trustLevel = this._determineTrustLevel(scores.overall_reputation);
        
        // Generate reasoning
        const reasoning = this._generateClassificationReasoning(metrics, scores, userClass, trustLevel);
        
        return {
            wallet_address: wallet,
            verification_timestamp: new Date().toISOString(),
            trust_level: trustLevel,
            user_class: userClass,
            reputation_scores: scores,
            behavioral_metrics: metrics,
            classification_reasoning: reasoning
        };
    }
    
    _extractBehavioralMetrics(userData) {
        const now = new Date();
        
        // Basic statistics
        const totalTransactions = userData.length;
        const amounts = userData.map(tx => tx.amount);
        const totalVolume = amounts.reduce((sum, amt) => sum + amt, 0);
        const avgTransaction = totalVolume / totalTransactions;
        const medianTransaction = this._median(amounts);
        
        // Time-based patterns
        const timestamps = userData.map(tx => tx.timestamp);
        const firstTx = new Date(Math.min(...timestamps));
        const lastTx = new Date(Math.max(...timestamps));
        
        const uniqueDates = [...new Set(userData.map(tx => tx.date))];
        const daysActive = uniqueDates.length;
        const platformTenure = Math.floor((now - firstTx) / (1000 * 60 * 60 * 24));
        const transactionFrequency = totalTransactions / Math.max(daysActive, 1);
        
        // Spending patterns
        const spendingStd = this._standardDeviation(amounts);
        const spendingCv = avgTransaction > 0 ? spendingStd / avgTransaction : 0;
        
        // Large transaction analysis
        const largeThreshold = this._percentile(amounts, 80);
        const largeTransactions = amounts.filter(amt => amt >= largeThreshold).length;
        const largeTxRatio = largeTransactions / totalTransactions;
        
        // Token usage analysis
        const tokens = userData.map(tx => tx.token_symbol || tx.token);
        const uniqueTokens = new Set(tokens).size;
        const tokenCounts = this._countOccurrences(tokens);
        const mostUsedToken = Object.keys(tokenCounts)[0] || 'UNKNOWN';
        const tokenConcentration = Math.max(...Object.values(tokenCounts)) / totalTransactions;
        
        // Recent activity (last 30 days)
        const recentCutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const recentActivity = userData.filter(tx => tx.timestamp >= recentCutoff);
        const recentTransactions = recentActivity.length;
        const daysSinceLastTx = Math.floor((now - lastTx) / (1000 * 60 * 60 * 24));
        
        // Spending consistency
        const dailySpending = this._groupByDate(userData);
        const dailyAmounts = Object.values(dailySpending);
        const spendingConsistency = dailyAmounts.length > 1 ? 
            1 / (this._standardDeviation(dailyAmounts) + 1) : 0.5;
        
        return {
            // Volume metrics (rounded for blockchain compatibility)
            total_transactions: totalTransactions,
            total_volume: Math.round(totalVolume * 100) / 100, // 2 decimal places max
            avg_transaction: Math.round(avgTransaction * 100) / 100,
            median_transaction: Math.round(medianTransaction * 100) / 100,
            
            // Time metrics (integers)
            platform_tenure: platformTenure,
            days_active: daysActive,
            transaction_frequency: Math.round(transactionFrequency * 100) / 100,
            days_since_last_tx: daysSinceLastTx,
            
            // Pattern metrics (rounded)
            spending_cv: Math.round(spendingCv * 1000) / 1000, // 3 decimal places
            spending_consistency: Math.round(spendingConsistency * 1000) / 1000,
            large_tx_ratio: Math.round(largeTxRatio * 1000) / 1000,
            
            // Token metrics (integers where possible)
            unique_tokens: uniqueTokens,
            token_concentration: Math.round(tokenConcentration * 1000) / 1000,
            most_used_token: mostUsedToken,
            
            // Activity metrics (integers)
            recent_transactions: recentTransactions,
            first_transaction: firstTx.toISOString(),
            last_transaction: lastTx.toISOString()
        };
    }
    
    _calculateReputationScores(metrics) {
        // 1. Consistency Score (0-1000) - More forgiving scale
        const cv = metrics.spending_cv;
        // Use a curve that's more forgiving to higher CV values
        const consistencyRaw = Math.max(0, 1 / (1 + cv)); // This gives partial credit even for high CV
        const consistencyScore = Math.min(1000, consistencyRaw * 1000);
        
        // 2. Loyalty Score (0-1000)
        const tenureDays = metrics.platform_tenure;
        const tenureScore = Math.min(1, tenureDays / 365);
        const frequency = metrics.transaction_frequency;
        const frequencyScore = Math.min(1, frequency / 2);
        const loyaltyRaw = (tenureScore * 0.7) + (frequencyScore * 0.3);
        const loyaltyScore = loyaltyRaw * 1000;
        
        // 3. Sophistication Score (0-1000)
        const tokenDiversity = metrics.unique_tokens;
        const diversityScore = Math.min(1, tokenDiversity / 5);
        const avgAmount = metrics.avg_transaction;
        const amountScore = Math.min(1, avgAmount / 1000);
        const sophisticationRaw = (diversityScore * 0.6) + (amountScore * 0.4);
        const sophisticationScore = sophisticationRaw * 1000;
        
        // 4. Activity Score (0-1000)
        const freq = metrics.transaction_frequency;
        const freqScore = Math.min(1, freq / 3);
        const recentRatio = metrics.recent_transactions / Math.max(metrics.total_transactions, 1);
        const activityRaw = (freqScore * 0.7) + (recentRatio * 0.3);
        const activityScore = activityRaw * 1000;
        
        // 5. Reliability Score (0-1000)
        const consistency = metrics.spending_consistency;
        const consistencyScoreRel = Math.min(1, consistency * 2);
        const daysSinceLast = metrics.days_since_last_tx;
        const recencyPenalty = Math.max(0, 1 - (daysSinceLast / 30));
        const reliabilityRaw = (consistencyScoreRel * 0.6) + (recencyPenalty * 0.4);
        const reliabilityScore = reliabilityRaw * 1000;
        
        // Overall Reputation (weighted average)
        const overall = (
            consistencyScore * this.scoreWeights.consistency +
            loyaltyScore * this.scoreWeights.loyalty +
            sophisticationScore * this.scoreWeights.sophistication +
            activityScore * this.scoreWeights.activity +
            reliabilityScore * this.scoreWeights.reliability
        );
        
        return {
            consistency_score: Math.round(consistencyScore), // Integer for blockchain
            loyalty_score: Math.round(loyaltyScore),
            sophistication_score: Math.round(sophisticationScore),
            activity_score: Math.round(activityScore), 
            reliability_score: Math.round(reliabilityScore),
            overall_reputation: Math.round(overall) // Integer for blockchain
        };
    }
    
    _classifyUser(metrics, scores) {
        const totalTxs = metrics.total_transactions;
        const totalVolume = metrics.total_volume;
        const tenure = metrics.platform_tenure;
        const frequency = metrics.transaction_frequency;
        const avgAmount = metrics.avg_transaction;
        
        if (tenure >= 180 && totalTxs >= 50 && scores.overall_reputation >= 700) {
            return UserClass.VETERAN;
        } else if (totalVolume >= 10000 || avgAmount >= 500) {
            return UserClass.WHALE;
        } else if (totalTxs >= 30 && frequency >= 1.0 && scores.overall_reputation >= 600) {
            return UserClass.POWER_USER;
        } else if (totalTxs >= 10 && tenure >= 30 && scores.overall_reputation >= 400) {
            return UserClass.REGULAR_USER;
        } else if (totalTxs >= 3 && tenure >= 7) {
            return UserClass.CASUAL_USER;
        } else {
            return UserClass.NEWCOMER;
        }
    }
    
    _determineTrustLevel(overallReputation) {
        if (overallReputation >= 800) {
            return TrustLevel.PLATINUM;
        } else if (overallReputation >= 600) {
            return TrustLevel.GOLD;
        } else if (overallReputation >= 400) {
            return TrustLevel.SILVER;
        } else {
            return TrustLevel.BRONZE;
        }
    }
    
    _generateClassificationReasoning(metrics, scores, userClass, trustLevel) {
        const reasoning = [];
        
        // Trust level reasoning
        if (trustLevel === TrustLevel.PLATINUM) {
            reasoning.push("Exceptional reputation (800+ score) demonstrates highest reliability");
        } else if (trustLevel === TrustLevel.GOLD) {
            reasoning.push("Strong reputation (600+ score) shows consistent good behavior");
        } else if (trustLevel === TrustLevel.SILVER) {
            reasoning.push("Moderate reputation (400+ score) indicates developing trust");
        } else {
            reasoning.push("Building reputation (<400 score) - new or inconsistent user");
        }
        
        // User class reasoning
        if (userClass === UserClass.VETERAN) {
            reasoning.push(`Veteran status: ${metrics.platform_tenure} days tenure with ${metrics.total_transactions} transactions`);
        } else if (userClass === UserClass.WHALE) {
            reasoning.push(`High-value user: $${metrics.total_volume.toFixed(2)} total volume, $${metrics.avg_transaction.toFixed(2)} average`);
        } else if (userClass === UserClass.POWER_USER) {
            reasoning.push(`Power user: ${metrics.transaction_frequency.toFixed(1)} txs/day frequency with consistent patterns`);
        } else if (userClass === UserClass.REGULAR_USER) {
            reasoning.push(`Regular user: ${metrics.total_transactions} transactions over ${metrics.platform_tenure} days`);
        } else if (userClass === UserClass.CASUAL_USER) {
            reasoning.push(`Casual usage: ${metrics.total_transactions} transactions, moderate engagement`);
        } else {
            reasoning.push("New user: Limited transaction history for full assessment");
        }
        
        // Score highlights
        if (scores.consistency_score >= 700) {
            reasoning.push(`Highly consistent spending patterns (score: ${Math.round(scores.consistency_score)})`);
        }
        if (scores.loyalty_score >= 700) {
            reasoning.push(`Strong platform loyalty (score: ${Math.round(scores.loyalty_score)})`);
        }
        if (scores.sophistication_score >= 700) {
            reasoning.push(`Advanced DeFi user with ${metrics.unique_tokens} different tokens`);
        }
        
        return reasoning;
    }
    
    // Helper functions
    _median(arr) {
        const sorted = [...arr].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    }
    
    _percentile(arr, p) {
        const sorted = [...arr].sort((a, b) => a - b);
        const index = (p / 100) * (sorted.length - 1);
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
    }
    
    _standardDeviation(arr) {
        const mean = arr.reduce((sum, val) => sum + val, 0) / arr.length;
        const variance = arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
        return Math.sqrt(variance);
    }
    
    _countOccurrences(arr) {
        return arr.reduce((acc, val) => {
            acc[val] = (acc[val] || 0) + 1;
            return acc;
        }, {});
    }
    
    _groupByDate(userData) {
        return userData.reduce((acc, tx) => {
            const date = tx.date;
            acc[date] = (acc[date] || 0) + tx.amount;
            return acc;
        }, {});
    }
}

async function updateReputationFromLambda(userProfile) {
    try {
        const reputationContract = new MetaFloatReputationContract();
        const result = await reputationContract.updateUserReputation(userProfile);
        return result;
    } catch (error) {
        console.error('Contract integration error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}


// Lambda handler
exports.handler = async (event) => {
    try {
        console.log('Received event:', JSON.stringify(event, null, 2));
        
        // Parse event body if it's a string
        const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body || event;


        const corsHeaders = {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        };

        if (event.httpMethod === 'OPTIONS') {
            console.log('Handling OPTIONS preflight request');
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: ''
            };
        }
        
        // Extract wallet address from event body
        const walletAddress = body.wallet_address || body.address || body.wallet;
        
        if (!walletAddress) {
            return {
                statusCode: 400,
                headers:corsHeaders,
                body: JSON.stringify({
                    error: 'wallet_address is required in request body'
                })
            };
        }
        
        // Load CSV from same directory
        const fs = require('fs');
        const path = require('path');
        
        let csvData;
        
        try {
            // Try to find CSV file in the same directory
            const csvFileName = process.env.CSV_FILE || 'metamask_preliminary_2050of10000_20250701_010659.csv';
            const csvPath = path.join(__dirname, csvFileName);
            
            console.log('Looking for CSV file at:', csvPath);
            csvData = fs.readFileSync(csvPath, 'utf-8');
            console.log('Successfully loaded CSV file');
            
        } catch (fileError) {
            console.error('Error loading CSV file:', fileError);
            return {
                statusCode: 500,
                headers: corsHeaders,
                body: JSON.stringify({
                    error: 'Failed to load transaction data from local file',
                    details: fileError.message
                })
            };
        }
        
        // Initialize reputation engine
        const engine = new MetaSenseReputationEngine(csvData);
        
        // Get user profile
        const userProfile = engine.getUserProfile(walletAddress);
        
        if (!userProfile) {
            return {
                statusCode: 404,
                headers: corsHeaders,
                body: JSON.stringify({
                    error: 'Wallet address not found in transaction data'
                })
            };
        }
        
                // Update on-chain reputation
        const contractResult = await updateReputationFromLambda(userProfile);
        
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                success: true,
                userProfile: userProfile,
                contractUpdate: contractResult
            })
        };
        
    } catch (error) {
        console.error('Lambda execution error:', error);
        const corsHeaders = {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        };
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                error: 'Internal server error',
                message: error.message
            })
        };
    }
};