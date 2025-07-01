
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title MetaSenseID NFT Contract
 * @dev Issues MetaSenseID NFTs to new users for identity verification
 */
contract MetaSenseID is ERC721, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    // Mapping from wallet address to token ID
    mapping(address => uint256) public userToTokenId;
    mapping(uint256 => address) public tokenIdToUser;
    
    // Base URI for metadata
    string private _baseTokenURI;
    
    // MetaSense Reputation contract address
    address public reputationContract;
    
    event MetaSenseIDIssued(address indexed user, uint256 indexed tokenId);
    event ReputationContractUpdated(address indexed newContract);
    
    constructor(string memory baseURI) ERC721("MetaSenseID", "MSID") Ownable(msg.sender){
        _baseTokenURI = baseURI;
    }
    
    /**
     * @dev Issue MetaSenseID to a new user
     * @param user Address of the user to receive the NFT
     */
    function issueMetaSenseID(address user) external onlyOwner nonReentrant {
        require(user != address(0), "Invalid user address");
        require(userToTokenId[user] == 0, "User already has MetaSenseID");
        
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        
        userToTokenId[user] = tokenId;
        tokenIdToUser[tokenId] = user;
        
        _safeMint(user, tokenId);
        
        emit MetaSenseIDIssued(user, tokenId);
    }
    
    /**
     * @dev Check if a user has a MetaSenseID
     */
    function hasMetaSenseID(address user) external view returns (bool) {
        return userToTokenId[user] != 0;
    }
    
    /**
     * @dev Get MetaSenseID token ID for a user
     */
    function getTokenId(address user) external view returns (uint256) {
        return userToTokenId[user];
    }
    
    /**
     * @dev Override approve to prevent approvals (soulbound NFT)
     */
    function approve(address to, uint256 tokenId) pure  public override {
        require(false, "MetaSenseID is soulbound - approvals not allowed");
    }
    
    /**
     * @dev Override setApprovalForAll to prevent operator approvals (soulbound NFT)
     */
    function setApprovalForAll(address operator, bool approved) public override {
        require(!approved, "MetaSenseID is soulbound - approvals not allowed");
        super.setApprovalForAll(operator, approved);
    }
    
    /**
     * @dev Override transferFrom to prevent transfers (soulbound NFT)
     */
    function transferFrom(address from, address to, uint256 tokenId) public override {
        require(from == address(0), "MetaSenseID is soulbound - transfers not allowed");
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
     * @dev Get total supply of MetaSenseIDs
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter.current();
    }
}
