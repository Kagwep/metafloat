// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./MetaFloatReputation.sol";
import "./MetaFloatReputationReader.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title MetaFloat Micro Loan Eligibility Contract
 * @dev Determines loan eligibility based on MetaFloat reputation scores and behavioral metrics
 */
contract MetaFloatLoanEligibility is Ownable, ReentrancyGuard {
    
    MetaFloatReputationReader public immutable reputationReader;
    MetaFloatReputation public immutable reputationContract;
    
    // Loan tier structure based on reputation
    enum LoanTier { None, Micro, Small, Medium, Large }
    
    struct LoanEligibility {
        bool eligible;
        LoanTier maxTier;
        uint256 maxAmount; // in wei or token units
        uint16 interestRate; // basis points (e.g., 500 = 5%)
        string[] requirements;
        string[] reasons;
    }
    
    // Loan tier configurations
    struct TierConfig {
        uint16 minOverallReputation;
        uint16 minConsistencyScore;
        uint16 minLoyaltyScore;
        uint16 minReliabilityScore;
        uint8 minTrustLevel; // 0=Bronze, 1=Silver, 2=Gold, 3=Platinum
        uint256 maxLoanAmount;
        uint16 baseInterestRate; // basis points
    }
    
    mapping(LoanTier => TierConfig) public tierConfigs;
    
    // Additional requirements
    uint256 public constant MIN_PLATFORM_TENURE_DAYS = 7;
    uint16 public constant MIN_ACTIVITY_SCORE = 200;
    uint16 public constant CONSISTENCY_WEIGHT = 35; // Most important for loans
    uint16 public constant RELIABILITY_WEIGHT = 30;
    uint16 public constant LOYALTY_WEIGHT = 20;
    uint16 public constant OVERALL_WEIGHT = 15;
    
    // Risk adjustment factors
    mapping(address => uint16) public userRiskAdjustment; // basis points adjustment
    mapping(address => bool) public blacklistedUsers;
    
    event LoanEligibilityChecked(
        address indexed user,
        bool eligible,
        LoanTier maxTier,
        uint256 maxAmount,
        uint16 interestRate
    );
    
    event TierConfigUpdated(LoanTier tier, TierConfig config);
    event UserRiskAdjusted(address indexed user, uint16 adjustment);
    event UserBlacklisted(address indexed user, bool blacklisted);
    
    constructor(
        address _reputationReader,
        address _reputationContract
    ) Ownable(msg.sender) {
        reputationReader = MetaFloatReputationReader(_reputationReader);
        reputationContract = MetaFloatReputation(_reputationContract);
        
        // Initialize default tier configurations
        _initializeDefaultTiers();
    }
    
    function _initializeDefaultTiers() private {
        // Micro Loans: New users with basic verification
        tierConfigs[LoanTier.Micro] = TierConfig({
            minOverallReputation: 300,
            minConsistencyScore: 250,
            minLoyaltyScore: 200,
            minReliabilityScore: 250,
            minTrustLevel: 0, // Bronze
            maxLoanAmount: 100 ether, // $100 equivalent
            baseInterestRate: 1200 // 12% APR
        });
        
        // Small Loans: Regular users with good patterns
        tierConfigs[LoanTier.Small] = TierConfig({
            minOverallReputation: 500,
            minConsistencyScore: 450,
            minLoyaltyScore: 400,
            minReliabilityScore: 450,
            minTrustLevel: 1, // Silver
            maxLoanAmount: 500 ether, // $500 equivalent
            baseInterestRate: 900 // 9% APR
        });
        
        // Medium Loans: Power users with strong consistency
        tierConfigs[LoanTier.Medium] = TierConfig({
            minOverallReputation: 700,
            minConsistencyScore: 650,
            minLoyaltyScore: 600,
            minReliabilityScore: 650,
            minTrustLevel: 2, // Gold
            maxLoanAmount: 2000 ether, // $2000 equivalent
            baseInterestRate: 600 // 6% APR
        });
        
        // Large Loans: Veterans and whales with exceptional scores
        tierConfigs[LoanTier.Large] = TierConfig({
            minOverallReputation: 850,
            minConsistencyScore: 800,
            minLoyaltyScore: 750,
            minReliabilityScore: 800,
            minTrustLevel: 3, // Platinum
            maxLoanAmount: 10000 ether, // $10000 equivalent
            baseInterestRate: 400 // 4% APR
        });
    }
    
    /**
     * @dev Check loan eligibility for a user
     */
    function checkLoanEligibility(address user) external view returns (LoanEligibility memory) {
        // Check basic requirements first
        if (blacklistedUsers[user]) {
            return LoanEligibility({
                eligible: false,
                maxTier: LoanTier.None,
                maxAmount: 0,
                interestRate: 0,
                requirements: new string[](0),
                reasons: _createArray("User is blacklisted")
            });
        }
        
        // Check MetaFloat ID
        if (!reputationReader.hasValidMetaFloatID(user)) {
            return LoanEligibility({
                eligible: false,
                maxTier: LoanTier.None,
                maxAmount: 0,
                interestRate: 0,
                requirements: _createArray("Must have valid MetaFloat ID"),
                reasons: _createArray("No MetaFloat ID found")
            });
        }
        
        // Get user reputation profile
        MetaFloatReputation.UserProfile memory profile = reputationContract.getUserProfile(user);
        
        // Check if reputation is current
        if (!reputationContract.isReputationCurrent(user)) {
            return LoanEligibility({
                eligible: false,
                maxTier: LoanTier.None,
                maxAmount: 0,
                interestRate: 0,
                requirements: _createArray("Reputation data must be current (updated within 30 days)"),
                reasons: _createArray("Stale reputation data")
            });
        }
        
        // Check minimum activity score
        if (profile.scores.activityScore < MIN_ACTIVITY_SCORE) {
            return LoanEligibility({
                eligible: false,
                maxTier: LoanTier.None,
                maxAmount: 0,
                interestRate: 0,
                requirements: _createArray("Minimum activity score required"),
                reasons: _createArray("Insufficient platform activity")
            });
        }
        
        // Determine highest eligible tier
        LoanTier maxTier = _getMaxEligibleTier(profile);
        
        if (maxTier == LoanTier.None) {
            return LoanEligibility({
                eligible: false,
                maxTier: LoanTier.None,
                maxAmount: 0,
                interestRate: 0,
                requirements: _getTierRequirements(LoanTier.Micro),
                reasons: _createArray("Does not meet minimum loan requirements")
            });
        }
        
        // Calculate interest rate with risk adjustments
        uint16 baseRate = tierConfigs[maxTier].baseInterestRate;
        uint16 adjustedRate = _calculateAdjustedInterestRate(user, profile, baseRate);
        
        return LoanEligibility({
            eligible: true,
            maxTier: maxTier,
            maxAmount: tierConfigs[maxTier].maxLoanAmount,
            interestRate: adjustedRate,
            requirements: new string[](0),
            reasons: _generateEligibilityReasons(profile, maxTier)
        });
    }
    
    function _getMaxEligibleTier(MetaFloatReputation.UserProfile memory profile) 
        private view returns (LoanTier) {
        
        // Check tiers from highest to lowest
        LoanTier[4] memory tiers = [LoanTier.Large, LoanTier.Medium, LoanTier.Small, LoanTier.Micro];
        
        for (uint i = 0; i < tiers.length; i++) {
            TierConfig memory config = tierConfigs[tiers[i]];
            
            if (profile.scores.overallReputation >= config.minOverallReputation &&
                profile.scores.consistencyScore >= config.minConsistencyScore &&
                profile.scores.loyaltyScore >= config.minLoyaltyScore &&
                profile.scores.reliabilityScore >= config.minReliabilityScore &&
                uint8(profile.trustLevel) >= config.minTrustLevel) {
                
                return tiers[i];
            }
        }
        
        return LoanTier.None;
    }
    
    function _calculateAdjustedInterestRate(
        address user, 
        MetaFloatReputation.UserProfile memory profile,
        uint16 baseRate
    ) private view returns (uint16) {
        
        uint16 adjustedRate = baseRate;
        
        // Apply user-specific risk adjustment
        if (userRiskAdjustment[user] > 0) {
            adjustedRate += userRiskAdjustment[user];
        }
        
        // Consistency bonus (most important for loans)
        if (profile.scores.consistencyScore >= 800) {
            adjustedRate = adjustedRate > 50 ? adjustedRate - 50 : 0; // 0.5% discount
        } else if (profile.scores.consistencyScore < 400) {
            adjustedRate += 200; // 2% penalty
        }
        
        // Reliability bonus
        if (profile.scores.reliabilityScore >= 850) {
            adjustedRate = adjustedRate > 25 ? adjustedRate - 25 : 0; // 0.25% discount
        }
        
        // Loyalty bonus (long-term users)
        if (profile.scores.loyaltyScore >= 800) {
            adjustedRate = adjustedRate > 25 ? adjustedRate - 25 : 0; // 0.25% discount
        }
        
        // Cap the maximum interest rate
        return adjustedRate > 2000 ? 2000 : adjustedRate; // Max 20% APR
    }
    
    function _getTierRequirements(LoanTier tier) private view returns (string[] memory) {
        string[] memory requirements = new string[](5);
        
        requirements[0] = "Min reputation score";
        requirements[1] = "Min consistency score";
        requirements[2] = "Min loyalty score";
        requirements[3] = "Min reliability score";
        requirements[4] = "Valid MetaFloat ID";
        
        return requirements;
    }
    
    function _generateEligibilityReasons(
        MetaFloatReputation.UserProfile memory profile,
        LoanTier tier
    ) private pure returns (string[] memory) {
        string[] memory reasons = new string[](3);
        
        reasons[0] = string(abi.encodePacked("Qualified for ", _getTierName(tier), " tier"));
        reasons[1] = "Strong consistency";
        reasons[2] = "Reliable user";
        
        return reasons;
    }
    
    // Admin functions
    function updateTierConfig(LoanTier tier, TierConfig memory config) external onlyOwner {
        tierConfigs[tier] = config;
        emit TierConfigUpdated(tier, config);
    }
    
    function adjustUserRisk(address user, uint16 adjustmentBasisPoints) external onlyOwner {
        userRiskAdjustment[user] = adjustmentBasisPoints;
        emit UserRiskAdjusted(user, adjustmentBasisPoints);
    }
    
    function setUserBlacklisted(address user, bool blacklisted) external onlyOwner {
        blacklistedUsers[user] = blacklisted;
        emit UserBlacklisted(user, blacklisted);
    }
    
    // Helper functions
    function _createArray(string memory item) private pure returns (string[] memory) {
        string[] memory array = new string[](1);
        array[0] = item;
        return array;
    }
    
    function _getTrustLevelName(uint8 level) private pure returns (string memory) {
        if (level == 0) return "Bronze";
        if (level == 1) return "Silver";
        if (level == 2) return "Gold";
        if (level == 3) return "Platinum";
        return "Unknown";
    }
    
    function _getTierName(LoanTier tier) private pure returns (string memory) {
        if (tier == LoanTier.Micro) return "Micro";
        if (tier == LoanTier.Small) return "Small";
        if (tier == LoanTier.Medium) return "Medium";
        if (tier == LoanTier.Large) return "Large";
        return "None";
    }
    
    // View functions for frontend integration
    function getTierConfig(LoanTier tier) external view returns (TierConfig memory) {
        return tierConfigs[tier];
    }
    
    function getUserRiskAdjustment(address user) external view returns (uint16) {
        return userRiskAdjustment[user];
    }
    
    function isUserBlacklisted(address user) external view returns (bool) {
        return blacklistedUsers[user];
    }
}