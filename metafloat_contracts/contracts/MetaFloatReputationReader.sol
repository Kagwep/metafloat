// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import "./MetaFloatReputation.sol";
import "./MetaFloatID.sol";

/**
 * @title MetaFloatReputationReader
 * @dev Interface contract for other contracts to easily read reputation data with ID validation
 */
contract MetaFloatReputationReader {
    MetaFloatReputation public  reputationContract;
    MetaFloat public  metaFloatContract;
    
    mapping(address => bool) public authorizedUpdaters;

    event AuthorizedUpdaterAdded(address indexed updater);
    event AuthorizedUpdaterRemoved(address indexed updater);
    event MetaFloatContractUpdated(address indexed newContract);
    event MetaFloatReputationContractUpdated(address indexed newContract);
    
    constructor(address _reputationContract, address _metaFloatContract) {
        reputationContract = MetaFloatReputation(_reputationContract);
        metaFloatContract = MetaFloat(_metaFloatContract);
        authorizedUpdaters[msg.sender] = true;
    }

    modifier onlyAuthorizedUpdater() {
        require(authorizedUpdaters[msg.sender], "Not authorized to update reputations");
        _;
    }
    
    
    /**
     * @dev Check if user has valid MetaFloat ID
     */
    function hasValidMetaFloatID(address user) public view returns (bool) {
        return metaFloatContract.hasMetaFloat(user);
    }
    
    /**
     * @dev Quick reputation check for other contracts with ID validation
     */
    function checkUserReputation(address user, uint32 minimumScore) external view returns (bool) {
        // Must have MetaFloat ID and meet reputation requirements
        return hasValidMetaFloatID(user) && 
               reputationContract.meetsMinimumReputation(user, minimumScore);
    }
    
    /**
     * @dev Comprehensive user validation (ID + verification + reputation)
     */
    function isUserFullyVerified(address user, uint32 minimumScore) external view returns (bool) {
        return hasValidMetaFloatID(user) && 
               reputationContract.isUserVerified(user) &&
               reputationContract.meetsMinimumReputation(user, minimumScore);
    }

    function setMetaFloatContract(address _metaFloatContract) external onlyAuthorizedUpdater {
        metaFloatContract = MetaFloat(_metaFloatContract);
        emit MetaFloatContractUpdated(_metaFloatContract);
    }

    function setMetaFloatReputionContract(address _metaFloatReputionContract) external onlyAuthorizedUpdater {
        reputationContract = MetaFloatReputation(_metaFloatReputionContract);
        emit MetaFloatReputationContractUpdated(_metaFloatReputionContract);
    }
    
    /**
     * @dev Get trust level as uint8 for easier integration (with ID check)
     */
    function getUserTrustLevelValue(address user) external view returns (uint8) {
        require(hasValidMetaFloatID(user), "User must have MetaFloat ID");
        return uint8(reputationContract.getUserTrustLevel(user));
    }
    
    /**
     * @dev Get user class as uint8 for easier integration (with ID check)
     */
    function getUserClassValue(address user) external view returns (uint8) {
        require(hasValidMetaFloatID(user), "User must have MetaFloat ID");
        return uint8(reputationContract.getUserClass(user));
    }
    
    /**
     * @dev Get user's MetaFloat token ID
     */
    function getUserMetaFloatID(address user) external view returns (uint256) {
        require(hasValidMetaFloatID(user), "User must have MetaFloat ID");
        return metaFloatContract.getTokenId(user);
    }
    
    /**
     * @dev Complete user status check for loan eligibility
     */
    function checkLoanEligibility(
        address user, 
        uint32 minimumReputation,
        uint8 minimumTrustLevel
    ) external view returns (
        bool eligible,
        uint32 reputation,
        uint8 trustLevel,
        bool hasID,
        bool isVerified
    ) {
        hasID = hasValidMetaFloatID(user);
        isVerified = reputationContract.isUserVerified(user);
        reputation = reputationContract.getUserReputation(user);
        trustLevel = uint8(reputationContract.getUserTrustLevel(user));
        
        eligible = hasID && 
                  isVerified && 
                  reputation >= minimumReputation && 
                  trustLevel >= minimumTrustLevel &&
                  reputationContract.isReputationCurrent(user);
    }
    
    /**
     * @dev Batch check multiple users (gas efficient for loan platforms)
     */
    function batchCheckEligibility(
        address[] calldata users,
        uint32 minimumReputation
    ) external view returns (bool[] memory eligible) {
        eligible = new bool[](users.length);
        
        for (uint256 i = 0; i < users.length; i++) {
            eligible[i] = hasValidMetaFloatID(users[i]) && 
                         reputationContract.meetsMinimumReputation(users[i], minimumReputation);
        }
    }

            /**
     * @dev Admin functions
     */
    function addAuthorizedUpdater(address updater) external onlyAuthorizedUpdater {
        authorizedUpdaters[updater] = true;
        emit AuthorizedUpdaterAdded(updater);
    }
    
    function removeAuthorizedUpdater(address updater) external onlyAuthorizedUpdater {
        authorizedUpdaters[updater] = false;
        emit AuthorizedUpdaterRemoved(updater);
    }
}