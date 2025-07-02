// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./MetaFloatID.sol";
/**
 * @title MetaFloatReputation Contract
 * @dev Main contract for storing and managing user reputation scores
 */
contract MetaFloatReputation is Ownable, ReentrancyGuard {
    
    // Enums matching Python implementation
    enum TrustLevel { Bronze, Silver, Gold, Platinum }
    enum UserClass { Newcomer, CasualUser, RegularUser, PowerUser, Whale, Veteran }
    
    // Reputation scores structure
    struct ReputationScores {
        uint16 consistencyScore;      // 0-1000
        uint16 loyaltyScore;         // 0-1000
        uint16 sophisticationScore;  // 0-1000
        uint16 activityScore;        // 0-1000
        uint16 reliabilityScore;     // 0-1000
        uint16 overallReputation;    // 0-1000
    }
    
    // User profile structure
    struct UserProfile {
        address walletAddress;
        uint256 verificationTimestamp;
        TrustLevel trustLevel;
        UserClass userClass;
        ReputationScores scores;
        bool isVerified;
        uint256 lastUpdateTimestamp;
        string[] reasoningTags;
    }
    
    // Storage
    mapping(address => UserProfile) public userProfiles;
    mapping(address => bool) public authorizedUpdaters;
    
    // MetaFloat contract reference
    MetaFloat public metaFloat;
    
    // Constants
    uint256 public constant REPUTATION_VALIDITY_PERIOD = 30 days;
    uint256 public constant MIN_REPUTATION_FOR_VERIFICATION = 200;
    
    // Events
    event UserReputationUpdated(
        address indexed user,
        uint16 overallReputation,
        TrustLevel trustLevel,
        UserClass userClass
    );
    event UserVerified(address indexed user, uint256 timestamp);
    event AuthorizedUpdaterAdded(address indexed updater);
    event AuthorizedUpdaterRemoved(address indexed updater);
    event MetaFloatContractUpdated(address indexed newContract);
    
    constructor(address _metaFloatContract) Ownable(msg.sender) {
        metaFloat = MetaFloat(_metaFloatContract);
        authorizedUpdaters[msg.sender] = true;
    }
    
    modifier onlyAuthorizedUpdater() {
        require(authorizedUpdaters[msg.sender], "Not authorized to update reputations");
        _;
    }
    
    /**
     * @dev Update or create user reputation profile
     */
    function updateUserReputation(
        address user,
        uint16[5] memory scores, // [consistency, loyalty, sophistication, activity, reliability]
        TrustLevel trustLevel,
        UserClass userClass,
        string[] memory reasoningTags
    ) external onlyAuthorizedUpdater nonReentrant {
        require(user != address(0), "Invalid user address");
        require(scores[4] <= 1000, "Invalid reputation scores"); // Check last score as proxy
        
        // Calculate overall reputation (weighted average)
        uint16 overallReputation = uint16(
            (scores[0] * 25 + scores[1] * 25 + scores[2] * 20 + scores[3] * 15 + scores[4] * 15) / 100
        );
        
        ReputationScores memory reputationScores = ReputationScores({
            consistencyScore: scores[0],
            loyaltyScore: scores[1],
            sophisticationScore: scores[2],
            activityScore: scores[3],
            reliabilityScore: scores[4],
            overallReputation: overallReputation
        });
        
        bool isNewUser = userProfiles[user].walletAddress == address(0);
        
        userProfiles[user] = UserProfile({
            walletAddress: user,
            verificationTimestamp: isNewUser ? block.timestamp : userProfiles[user].verificationTimestamp,
            trustLevel: trustLevel,
            userClass: userClass,
            scores: reputationScores,
            isVerified: overallReputation >= MIN_REPUTATION_FOR_VERIFICATION,
            lastUpdateTimestamp: block.timestamp,
            reasoningTags: reasoningTags
        });
        
        // Issue MetaFloat for new users
        if (isNewUser && !metaFloat.hasMetaFloat(user)) {
            try metaFloat.issueMetaFloat(user) {
                emit UserVerified(user, block.timestamp);
            } catch {
                // Continue even if NFT issuance fails
            }
        }
        
        emit UserReputationUpdated(user, overallReputation, trustLevel, userClass);
    }
    
    /**
     * @dev Batch update multiple users (gas efficient)
     */
    
    /**
     * @dev Get user reputation score
     */
    function getUserReputation(address user) external view returns (uint16) {
        return userProfiles[user].scores.overallReputation;
    }
    
    /**
     * @dev Get detailed user profile
     */
    function getUserProfile(address user) external view returns (UserProfile memory) {
        return userProfiles[user];
    }
    
    /**
     * @dev Get user trust level
     */
    function getUserTrustLevel(address user) external view returns (TrustLevel) {
        return userProfiles[user].trustLevel;
    }
    
    /**
     * @dev Get user class
     */
    function getUserClass(address user) external view returns (UserClass) {
        return userProfiles[user].userClass;
    }
    
    /**
     * @dev Check if user is verified
     */
    function isUserVerified(address user) external view returns (bool) {
        return userProfiles[user].isVerified;
    }
    
    /**
     * @dev Check if user reputation is current (updated within validity period)
     */
    function isReputationCurrent(address user) external view returns (bool) {
        UserProfile memory profile = userProfiles[user];
        if (profile.walletAddress == address(0)) return false;
        return (block.timestamp - profile.lastUpdateTimestamp) <= REPUTATION_VALIDITY_PERIOD;
    }
    
    /**
     * @dev Get user reputation age in seconds
     */
    function getReputationAge(address user) external view returns (uint256) {
        UserProfile memory profile = userProfiles[user];
        if (profile.walletAddress == address(0)) return type(uint256).max;
        return block.timestamp - profile.lastUpdateTimestamp;
    }
    
    /**
     * @dev Verify user meets minimum reputation requirements
     */
    function meetsMinimumReputation(address user, uint16 minimumScore) external view returns (bool) {
        UserProfile memory profile = userProfiles[user];
        return profile.scores.overallReputation >= minimumScore && 
               (block.timestamp - profile.lastUpdateTimestamp) <= REPUTATION_VALIDITY_PERIOD;
    }
    
    /**
     * @dev Get reputation breakdown for detailed analysis
     */
    function getReputationBreakdown(address user) external view returns (
        uint16 consistency,
        uint16 loyalty,
        uint16 sophistication,
        uint16 activity,
        uint16 reliability,
        uint16 overall
    ) {
        ReputationScores memory scores = userProfiles[user].scores;
        return (
            scores.consistencyScore,
            scores.loyaltyScore,
            scores.sophisticationScore,
            scores.activityScore,
            scores.reliabilityScore,
            scores.overallReputation
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
    
    function setMetaFloatContract(address _metaFloatContract) external onlyOwner {
        metaFloat = MetaFloat(_metaFloatContract);
        emit MetaFloatContractUpdated(_metaFloatContract);
    }
    
    /**
     * @dev Emergency functions
     */
    function pauseUser(address user) external onlyOwner {
        userProfiles[user].isVerified = false;
    }
    
    function unpauseUser(address user) external onlyOwner {
        if (userProfiles[user].scores.overallReputation >= MIN_REPUTATION_FOR_VERIFICATION) {
            userProfiles[user].isVerified = true;
        }
    }
    
    /**
     * @dev Get contract statistics
     */
    // function getContractStats() external view returns (
    //     uint256 totalUsers,
    //     uint256 verifiedUsers,
    //     uint256 platinumUsers,
    //     uint256 goldUsers,
    //     uint256 silverUsers,
    //     uint256 bronzeUsers
    // ) {
    
    //     return (0, 0, 0, 0, 0, 0);
    // }
}