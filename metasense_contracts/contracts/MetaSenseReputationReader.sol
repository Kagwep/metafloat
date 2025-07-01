// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;


import "./MetaSenseReputation.sol";
/**
 * @title MetaSenseReputationReader
 * @dev Interface contract for other contracts to easily read reputation data
 */
contract MetaSenseReputationReader {
    MetaSenseReputation public immutable reputationContract;
    
    constructor(address _reputationContract) {
        reputationContract = MetaSenseReputation(_reputationContract);
    }
    
    /**
     * @dev Quick reputation check for other contracts
     */
    function checkUserReputation(address user, uint16 minimumScore) external view returns (bool) {
        return reputationContract.meetsMinimumReputation(user, minimumScore);
    }
    
    /**
     * @dev Get trust level as uint8 for easier integration
     */
    function getUserTrustLevelValue(address user) external view returns (uint8) {
        return uint8(reputationContract.getUserTrustLevel(user));
    }
    
    /**
     * @dev Get user class as uint8 for easier integration
     */
    function getUserClassValue(address user) external view returns (uint8) {
        return uint8(reputationContract.getUserClass(user));
    }
}
