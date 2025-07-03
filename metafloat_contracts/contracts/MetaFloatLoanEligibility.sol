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
    
    MetaFloatReputationReader public  reputationReader;
    MetaFloatReputation public immutable reputationContract;
    
    // Loan tier structure based on reputation
    enum LoanTier { None, Micro, Small, Medium, Large }
    
    struct LoanEligibility {
        bool eligible;
        LoanTier maxTier;
        uint256 maxAmount; // in USDC (6 decimals)
        uint32 interestRate; // basis points (100 = 1%)
        string[] requirements;
        string[] reasons;
    }
    
    // Loan tier configurations
    struct TierConfig {
        uint32 minOverallReputation;
        uint32 minConsistencyScore;
        uint32 minLoyaltyScore;
        uint32 minReliabilityScore;
        uint8 minTrustLevel; // 0=Bronze, 1=Silver, 2=Gold, 3=Platinum
        uint256 maxLoanAmount; // in USDC (6 decimals)
        uint32 baseInterestRate; // basis points (fixed at 100 = 1%)
    }
    
    mapping(LoanTier => TierConfig) public tierConfigs;
    
    // Additional requirements
    uint256 public constant MIN_PLATFORM_TENURE_DAYS = 7;
    uint32 public constant MIN_ACTIVITY_SCORE = 100;
    uint32 public constant FIXED_INTEREST_RATE = 100; // 1% APR for all loans
    
    // Risk adjustment factors
    mapping(address => bool) public blacklistedUsers;
    mapping(address => bool) public authorizedUpdaters;
    
    event LoanEligibilityChecked(
        address indexed user,
        bool eligible,
        LoanTier maxTier,
        uint256 maxAmount,
        uint32 interestRate
    );
    
    event TierConfigUpdated(LoanTier tier, TierConfig config);
    event UserBlacklisted(address indexed user, bool blacklisted);
    event AuthorizedUpdaterAdded(address indexed updater);
    event AuthorizedUpdaterRemoved(address indexed updater);
    event MetaFloatReputationReaderContractUpdated(address indexed newContract);
    
    constructor(
        address _reputationReader,
        address _reputationContract
    ) Ownable(msg.sender) {
        reputationReader = MetaFloatReputationReader(_reputationReader);
        reputationContract = MetaFloatReputation(_reputationContract);
        
        // Initialize default tier configurations
        _initializeDefaultTiers();
        authorizedUpdaters[msg.sender] = true;
    }

    modifier onlyAuthorizedUpdater() {
        require(authorizedUpdaters[msg.sender], "Not authorized to update reputations");
        _;
    }
    
    function _initializeDefaultTiers() private {
        // Micro Loans: Entry level - 25 USDC
        tierConfigs[LoanTier.Micro] = TierConfig({
            minOverallReputation: 600,
            minConsistencyScore: 600,
            minLoyaltyScore: 150,
            minReliabilityScore: 200,
            minTrustLevel: 0, // Bronze
            maxLoanAmount: 25 * 10**6, // 25 USDC
            baseInterestRate: FIXED_INTEREST_RATE
        });
        
        // Small Loans: 50 USDC
        tierConfigs[LoanTier.Small] = TierConfig({
            minOverallReputation: 700,
            minConsistencyScore: 700,
            minLoyaltyScore: 200,
            minReliabilityScore: 300,
            minTrustLevel: 0, // Bronze
            maxLoanAmount: 50 * 10**6, // 50 USDC
            baseInterestRate: FIXED_INTEREST_RATE
        });
        
        // Medium Loans: 200 USDC
        tierConfigs[LoanTier.Medium] = TierConfig({
            minOverallReputation: 800,
            minConsistencyScore: 800,
            minLoyaltyScore: 300,
            minReliabilityScore: 400,
            minTrustLevel: 1, // Silver
            maxLoanAmount: 200 * 10**6, // 200 USDC
            baseInterestRate: FIXED_INTEREST_RATE
        });
        
        // Large Loans: 1000 USDC - maximum
        tierConfigs[LoanTier.Large] = TierConfig({
            minOverallReputation: 950,
            minConsistencyScore: 950,
            minLoyaltyScore: 500,
            minReliabilityScore: 600,
            minTrustLevel: 2, // Gold
            maxLoanAmount: 1000 * 10**6, // 1000 USDC
            baseInterestRate: FIXED_INTEREST_RATE
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
                reasons: _createSingleArray("User is blacklisted")
            });
        }
        
        // Check MetaFloat ID
        if (!reputationReader.hasValidMetaFloatID(user)) {
            return LoanEligibility({
                eligible: false,
                maxTier: LoanTier.None,
                maxAmount: 0,
                interestRate: 0,
                requirements: _createSingleArray("Must have valid MetaFloat ID"),
                reasons: _createSingleArray("No MetaFloat ID found")
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
                requirements: _createSingleArray("Reputation data must be current"),
                reasons: _createSingleArray("Stale reputation data")
            });
        }
        
        // Check minimum activity score
        if (profile.scores.activityScore < MIN_ACTIVITY_SCORE) {
            return LoanEligibility({
                eligible: false,
                maxTier: LoanTier.None,
                maxAmount: 0,
                interestRate: 0,
                requirements: _createSingleArray("Minimum activity score required"),
                reasons: _createSingleArray("Insufficient platform activity")
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
                requirements: _getTierRequirements(),
                reasons: _createSingleArray("Minimum 600 consistency and overall reputation required")
            });
        }
        
        return LoanEligibility({
            eligible: true,
            maxTier: maxTier,
            maxAmount: tierConfigs[maxTier].maxLoanAmount,
            interestRate: FIXED_INTEREST_RATE,
            requirements: new string[](0),
            reasons: _generateEligibilityReasons(maxTier)
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
    
    function _getTierRequirements() private pure returns (string[] memory) {
        string[] memory requirements = new string[](4);
        requirements[0] = "Min overall reputation: 600";
        requirements[1] = "Min consistency score: 600";
        requirements[2] = "Min activity score: 100";
        requirements[3] = "Valid MetaFloat ID";
        return requirements;
    }
    
    function _generateEligibilityReasons(LoanTier tier) private pure returns (string[] memory) {
        string[] memory reasons = new string[](3);
        reasons[0] = string(abi.encodePacked("Qualified for ", _getTierName(tier), " tier loans"));
        reasons[1] = "Meets reputation requirements";
        reasons[2] = "Fixed 1% APR for all loans";
        return reasons;
    }
    
    // Admin functions
    function updateTierConfig(LoanTier tier, TierConfig memory config) external onlyOwner {
        require(config.maxLoanAmount <= 1000 * 10**6, "Maximum loan amount cannot exceed 1000 USDC");
        require(config.baseInterestRate == FIXED_INTEREST_RATE, "Interest rate must be 1% APR");
        tierConfigs[tier] = config;
        emit TierConfigUpdated(tier, config);
    }
    
    function setUserBlacklisted(address user, bool blacklisted) external onlyAuthorizedUpdater {
        blacklistedUsers[user] = blacklisted;
        emit UserBlacklisted(user, blacklisted);
    }

    function setMetaFloatReputionContract(address _metaFloatReputionReaderContract) external onlyAuthorizedUpdater {
        reputationReader = MetaFloatReputationReader(_metaFloatReputionReaderContract);
        emit MetaFloatReputationReaderContractUpdated(_metaFloatReputionReaderContract);
    }
    
    // Helper functions
    function _createSingleArray(string memory item) private pure returns (string[] memory) {
        string[] memory array = new string[](1);
        array[0] = item;
        return array;
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
    
    function isUserBlacklisted(address user) external view returns (bool) {
        return blacklistedUsers[user];
    }
    
    function getMaxTierForUser(address user) external view returns (LoanTier) {
        if (blacklistedUsers[user] || !reputationReader.hasValidMetaFloatID(user)) {
            return LoanTier.None;
        }
        
        MetaFloatReputation.UserProfile memory profile = reputationContract.getUserProfile(user);
        return _getMaxEligibleTier(profile);
    }
    
    function getLoanAmountForTier(LoanTier tier) external view returns (uint256) {
        return tierConfigs[tier].maxLoanAmount;
    }
    
    // Get all tier information for frontend display
    function getAllTierConfigs() external view returns (
        TierConfig memory micro,
        TierConfig memory small, 
        TierConfig memory medium,
        TierConfig memory large
    ) {
        return (
            tierConfigs[LoanTier.Micro],
            tierConfigs[LoanTier.Small],
            tierConfigs[LoanTier.Medium],
            tierConfigs[LoanTier.Large]
        );
    }

            /**
     * @dev Admin functions
     */
    function addAuthorizedUpdater(address updater) external onlyOwner {
        authorizedUpdaters[updater] = true;
        emit AuthorizedUpdaterAdded(updater);
    }
    
    function removeAuthorizedUpdater(address updater) external onlyOwner {
        authorizedUpdaters[updater] = false;
        emit AuthorizedUpdaterRemoved(updater);
    }
}