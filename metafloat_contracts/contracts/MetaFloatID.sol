// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title MetaFloat NFT Contract
 * @dev Issues MetaFloat NFTs to new users for identity verification
 */
contract MetaFloat is ERC721, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    // Mapping from wallet address to token ID
    mapping(address => uint256) public userToTokenId;
    mapping(uint256 => address) public tokenIdToUser;
    mapping(address => bool) public authorizedUpdaters;
    
    // Base URI for metadata
    string private _baseTokenURI;
    
    // MetaFloat Reputation contract address
    address public reputationContract;
    
    event MetaFloatIssued(address indexed user, uint256 indexed tokenId);
    event ReputationContractUpdated(address indexed newContract);
    event AuthorizedUpdaterAdded(address indexed updater);
    event AuthorizedUpdaterRemoved(address indexed updater);
    
    constructor(string memory baseURI) ERC721("MetaFloat", "MFLT") Ownable(msg.sender){
        _baseTokenURI = baseURI;
        authorizedUpdaters[msg.sender] = true;
    }

    modifier onlyAuthorizedUpdater() {
        require(authorizedUpdaters[msg.sender], "Not authorized to update reputations");
        _;
    }
    
    
    /**
     * @dev Issue MetaFloat to a new user
     * @param user Address of the user to receive the NFT
     */
    function issueMetaFloat(address user) external onlyOwner nonReentrant {
        require(user != address(0), "Invalid user address");
        require(userToTokenId[user] == 0, "User already has MetaFloat");
        
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        
        userToTokenId[user] = tokenId;
        tokenIdToUser[tokenId] = user;
        
        _safeMint(user, tokenId);
        
        emit MetaFloatIssued(user, tokenId);
    }
    
    /**
     * @dev Check if a user has a MetaFloat
     */
    function hasMetaFloat(address user) external view returns (bool) {
        return userToTokenId[user] != 0;
    }
    
    /**
     * @dev Get MetaFloat token ID for a user
     */
    function getTokenId(address user) external view returns (uint256) {
        return userToTokenId[user];
    }
    
    /**
     * @dev Override approve to prevent approvals (soulbound NFT)
     */
    function approve(address to, uint256 tokenId) pure  public override {
        require(false, "MetaFloat is soulbound - approvals not allowed");
    }
    
    /**
     * @dev Override setApprovalForAll to prevent operator approvals (soulbound NFT)
     */
    function setApprovalForAll(address operator, bool approved) public override {
        require(!approved, "MetaFloat is soulbound - approvals not allowed");
        super.setApprovalForAll(operator, approved);
    }
    
    /**
     * @dev Override transferFrom to prevent transfers (soulbound NFT)
     */
    function transferFrom(address from, address to, uint256 tokenId) public override {
        require(from == address(0), "MetaFloat is soulbound - transfers not allowed");
        super.transferFrom(from, to, tokenId);
    }
    
    /**
     * @dev Set the reputation contract address
     */
    function setReputationContract(address _reputationContract) external onlyOwner {
        reputationContract = _reputationContract;
        emit ReputationContractUpdated(_reputationContract);
    }
    
    /**
     * @dev Set base URI for metadata
     */
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }
    

    /**
     * @dev Get base URI
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    /**
     * @dev Get total supply of MetaFloats
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter.current();
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