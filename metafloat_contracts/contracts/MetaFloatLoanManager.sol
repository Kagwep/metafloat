// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./MetaFloatLoanEligibility.sol";

/**
 * @title MetaFloat Loan Manager Contract
 * @dev Handles loan issuance, repayment, and collection with authorized collectors
 */
contract MetaFloatLoanManager is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    MetaFloatLoanEligibility public  eligibilityContract;
    
    struct Loan {
        address borrower;
        address tokenAddress;
        uint256 principalAmount;
        uint256 interestAmount;
        uint256 totalAmount; // principal + interest
        uint256 issueTimestamp;
        uint256 dueTimestamp;
        bool isActive;
        bool isRepaid;
        bool isDefaulted;
    }
    
    // Loan tracking
    mapping(address => mapping(uint256 => uint256)) public userLoans; // borrower => loanId => loanId
    mapping(address => uint256) public userLoanCount;
    mapping(uint256 => Loan) public loans;
    uint256 public nextLoanId = 1;
    
    // Authorized collectors
    mapping(address => bool) public authorizedCollectors;
    
    // Supported tokens
    mapping(address => bool) public supportedTokens;
    
    // Loan parameters
    uint256 public constant LOAN_DURATION_DAYS = 30; // 30 days loan term
    uint256 public constant SECONDS_PER_DAY = 86400;
    uint256 public constant INTEREST_RATE_BASIS_POINTS = 100; // 1% APR
    uint256 public constant DAYS_PER_YEAR = 365;
    
    // Limits
    mapping(address => uint256) public userActiveLoans; // borrower => count of active loans
    uint256 public constant MAX_ACTIVE_LOANS_PER_USER = 1; // Only 1 active loan per user
    
    // Events
    event LoanRequested(
        uint256 indexed loanId,
        address indexed borrower,
        address indexed tokenAddress,
        uint256 principalAmount,
        uint256 totalAmount
    );
    
    event LoanRepaid(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 repaidAmount
    );
    
    event LoanDefaulted(
        uint256 indexed loanId,
        address indexed borrower,
        address indexed collector
    );
    
    event CollectorAuthorized(address indexed collector, bool authorized);
    event TokenSupported(address indexed token, bool supported);
    event LoanCollected(uint256 indexed loanId, address indexed collector, uint256 amount);
    event MetaFloatLoanEligibilityContractUpdated(address indexed newContract);
    
    constructor(
        address _eligibilityContract
    ) Ownable(msg.sender) {
        eligibilityContract = MetaFloatLoanEligibility(_eligibilityContract);
    }
    
    /**
     * @dev Request a loan with specified amount and token
     * User must approve tokens before calling this function
     */
    function requestLoan(
        uint256 amount,
        address tokenAddress
    ) external nonReentrant {
        require(supportedTokens[tokenAddress], "Token not supported");
        require(amount > 0, "Amount must be greater than 0");
        require(userActiveLoans[msg.sender] < MAX_ACTIVE_LOANS_PER_USER, "Too many active loans");
        
        // Check loan eligibility
        MetaFloatLoanEligibility.LoanEligibility memory eligibility = 
            eligibilityContract.checkLoanEligibility(msg.sender);
        
        require(eligibility.eligible, "Not eligible for loans");
        require(amount <= eligibility.maxAmount, "Amount exceeds maximum loan limit");
        
        // Calculate interest (1% APR for 30 days)
        uint256 interestAmount = (amount * INTEREST_RATE_BASIS_POINTS * LOAN_DURATION_DAYS) / 
                                (10000 * DAYS_PER_YEAR);
        uint256 totalAmount = amount + interestAmount;
        
        // Check that user has approved the contract to collect totalAmount
        uint256 allowance = IERC20(tokenAddress).allowance(msg.sender, address(this));
        require(allowance >= totalAmount, "Insufficient token approval for loan + interest");
        
        // Create loan record
        uint256 loanId = nextLoanId++;
        uint256 dueTimestamp = block.timestamp + (LOAN_DURATION_DAYS * SECONDS_PER_DAY);
        
        loans[loanId] = Loan({
            borrower: msg.sender,
            tokenAddress: tokenAddress,
            principalAmount: amount,
            interestAmount: interestAmount,
            totalAmount: totalAmount,
            issueTimestamp: block.timestamp,
            dueTimestamp: dueTimestamp,
            isActive: true,
            isRepaid: false,
            isDefaulted: false
        });
        
        // Track user loans
        userLoans[msg.sender][userLoanCount[msg.sender]] = loanId;
        userLoanCount[msg.sender]++;
        userActiveLoans[msg.sender]++;
        
        // Transfer tokens to borrower
        IERC20(tokenAddress).safeTransfer(msg.sender, amount);
        
        emit LoanRequested(loanId, msg.sender, tokenAddress, amount, totalAmount);
    }
    
    /**
     * @dev Request loan with permit (EIP-2612) - single transaction
     * For tokens that support permit functionality
     */
    function requestLoanWithPermit(
        uint256 amount,
        address tokenAddress,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external nonReentrant {
        require(supportedTokens[tokenAddress], "Token not supported");
        require(amount > 0, "Amount must be greater than 0");
        require(userActiveLoans[msg.sender] < MAX_ACTIVE_LOANS_PER_USER, "Too many active loans");
        
        // Check loan eligibility
        MetaFloatLoanEligibility.LoanEligibility memory eligibility = 
            eligibilityContract.checkLoanEligibility(msg.sender);
        
        require(eligibility.eligible, "Not eligible for loans");
        require(amount <= eligibility.maxAmount, "Amount exceeds maximum loan limit");
        
        // Calculate interest (1% APR for 30 days)
        uint256 interestAmount = (amount * INTEREST_RATE_BASIS_POINTS * LOAN_DURATION_DAYS) / 
                                (10000 * DAYS_PER_YEAR);
        uint256 totalAmount = amount + interestAmount;
        
        // Execute permit to approve totalAmount
        IERC20Permit(tokenAddress).permit(
            msg.sender,
            address(this),
            totalAmount,
            deadline,
            v,
            r,
            s
        );
        
        // Create loan record
        uint256 loanId = nextLoanId++;
        uint256 dueTimestamp = block.timestamp + (LOAN_DURATION_DAYS * SECONDS_PER_DAY);
        
        loans[loanId] = Loan({
            borrower: msg.sender,
            tokenAddress: tokenAddress,
            principalAmount: amount,
            interestAmount: interestAmount,
            totalAmount: totalAmount,
            issueTimestamp: block.timestamp,
            dueTimestamp: dueTimestamp,
            isActive: true,
            isRepaid: false,
            isDefaulted: false
        });
        
        // Track user loans
        userLoans[msg.sender][userLoanCount[msg.sender]] = loanId;
        userLoanCount[msg.sender]++;
        userActiveLoans[msg.sender]++;
        
        // Transfer tokens to borrower
        IERC20(tokenAddress).safeTransfer(msg.sender, amount);
        
        emit LoanRequested(loanId, msg.sender, tokenAddress, amount, totalAmount);
    }
    
    /**
     * @dev Repay a loan
     */
    function repayLoan(uint256 loanId) external nonReentrant {
        Loan storage loan = loans[loanId];
        require(loan.isActive, "Loan is not active");
        require(loan.borrower == msg.sender, "Not your loan");
        require(!loan.isRepaid, "Loan already repaid");
        require(!loan.isDefaulted, "Loan is defaulted");
        require(block.timestamp <= loan.dueTimestamp, "Loan is past due");
        
        // Transfer repayment from borrower
        IERC20(loan.tokenAddress).safeTransferFrom(
            msg.sender,
            address(this),
            loan.totalAmount
        );
        
        // Mark loan as repaid
        loan.isRepaid = true;
        loan.isActive = false;
        userActiveLoans[msg.sender]--;
        
        emit LoanRepaid(loanId, msg.sender, loan.totalAmount);
    }
    
    /**
     * @dev Auto-collect loan repayment (authorized collectors only)
     */
    function autoCollectLoan(uint256 loanId) external nonReentrant {
        require(authorizedCollectors[msg.sender], "Not authorized collector");
        
        Loan storage loan = loans[loanId];
        require(loan.isActive, "Loan is not active");
        require(!loan.isRepaid, "Loan already repaid");
        require(!loan.isDefaulted, "Loan is defaulted");
        
        // Check if borrower has sufficient balance and approval
        IERC20 token = IERC20(loan.tokenAddress);
        uint256 borrowerBalance = token.balanceOf(loan.borrower);
        uint256 allowance = token.allowance(loan.borrower, address(this));
        
        require(borrowerBalance >= loan.totalAmount, "Borrower has insufficient balance");
        require(allowance >= loan.totalAmount, "Insufficient approval for auto-collection");
        
        // Transfer repayment from borrower
        token.safeTransferFrom(loan.borrower, address(this), loan.totalAmount);
        
        // Mark loan as repaid
        loan.isRepaid = true;
        loan.isActive = false;
        userActiveLoans[loan.borrower]--;
        
        emit LoanRepaid(loanId, loan.borrower, loan.totalAmount);
        emit LoanCollected(loanId, msg.sender, loan.totalAmount);
    }
    
    /**
     * @dev Collect defaulted loan (only authorized collectors)
     */
    function collectDefaultedLoan(uint256 loanId) external nonReentrant {
        require(authorizedCollectors[msg.sender], "Not authorized collector");
        
        Loan storage loan = loans[loanId];
        require(loan.isActive, "Loan is not active");
        require(!loan.isRepaid, "Loan already repaid");
        require(block.timestamp > loan.dueTimestamp, "Loan is not past due");
        
        // Mark loan as defaulted
        loan.isDefaulted = true;
        loan.isActive = false;
        userActiveLoans[loan.borrower]--;
        
        emit LoanDefaulted(loanId, loan.borrower, msg.sender);
        emit LoanCollected(loanId, msg.sender, loan.totalAmount);
    }
    
    /**
     * @dev Check if borrower can be auto-collected
     */
    function canAutoCollect(uint256 loanId) external view returns (bool) {
        Loan memory loan = loans[loanId];
        
        if (!loan.isActive || loan.isRepaid || loan.isDefaulted) {
            return false;
        }
        
        IERC20 token = IERC20(loan.tokenAddress);
        uint256 borrowerBalance = token.balanceOf(loan.borrower);
        uint256 allowance = token.allowance(loan.borrower, address(this));
        
        return borrowerBalance >= loan.totalAmount && allowance >= loan.totalAmount;
    }
    
    /**
     * @dev Check if loan is past due and mark as defaulted
     */
    function markLoanAsDefaulted(uint256 loanId) external {
        Loan storage loan = loans[loanId];
        require(loan.isActive, "Loan is not active");
        require(!loan.isRepaid, "Loan already repaid");
        require(block.timestamp > loan.dueTimestamp, "Loan is not past due");
        
        loan.isDefaulted = true;
        loan.isActive = false;
        userActiveLoans[loan.borrower]--;
        
        emit LoanDefaulted(loanId, loan.borrower, address(0));
    }
    
    // Admin functions
    function authorizeCollector(address collector, bool authorized) external onlyOwner {
        authorizedCollectors[collector] = authorized;
        emit CollectorAuthorized(collector, authorized);
    }
    
    function setSupportedToken(address token, bool supported) external onlyOwner {
        supportedTokens[token] = supported;
        emit TokenSupported(token, supported);
    }

    function setMetaFloatReputionContract(address _metaFloatLoanEligibility) external onlyOwner {
        eligibilityContract = MetaFloatLoanEligibility(_metaFloatLoanEligibility);
        emit MetaFloatLoanEligibilityContractUpdated(_metaFloatLoanEligibility);
    }
    
    /**
     * @dev Withdraw collected funds (owner only)
     */
    function withdrawFunds(address tokenAddress, uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        IERC20(tokenAddress).safeTransfer(msg.sender, amount);
    }
    
    /**
     * @dev Fund the contract with tokens for lending
     */
    function fundContract(address tokenAddress, uint256 amount) external onlyOwner {
        require(supportedTokens[tokenAddress], "Token not supported");
        require(amount > 0, "Amount must be greater than 0");
        
        IERC20(tokenAddress).safeTransferFrom(msg.sender, address(this), amount);
    }
    
    // View functions
    function getLoan(uint256 loanId) external view returns (Loan memory) {
        return loans[loanId];
    }
    
    function getUserLoans(address user) external view returns (uint256[] memory) {
        uint256[] memory userLoanIds = new uint256[](userLoanCount[user]);
        
        for (uint256 i = 0; i < userLoanCount[user]; i++) {
            userLoanIds[i] = userLoans[user][i];
        }
        
        return userLoanIds;
    }
    
    function getUserActiveLoansCount(address user) external view returns (uint256) {
        return userActiveLoans[user];
    }
    
    function isLoanOverdue(uint256 loanId) external view returns (bool) {
        Loan memory loan = loans[loanId];
        return loan.isActive && !loan.isRepaid && block.timestamp > loan.dueTimestamp;
    }
    
    function getContractBalance(address tokenAddress) external view returns (uint256) {
        return IERC20(tokenAddress).balanceOf(address(this));
    }
    
    function calculateLoanCost(uint256 principalAmount) external pure returns (
        uint256 interestAmount,
        uint256 totalAmount
    ) {
        interestAmount = (principalAmount * INTEREST_RATE_BASIS_POINTS * LOAN_DURATION_DAYS) / 
                        (10000 * DAYS_PER_YEAR);
        totalAmount = principalAmount + interestAmount;
    }
    
    /**
     * @dev Get required approval amount for a loan
     */
    function getRequiredApproval(uint256 principalAmount) external pure returns (uint256) {
        uint256 interestAmount = (principalAmount * INTEREST_RATE_BASIS_POINTS * LOAN_DURATION_DAYS) / 
                                (10000 * DAYS_PER_YEAR);
        return principalAmount + interestAmount;
    }
    
    /**
     * @dev Check user's current token approval for this contract
     */
    function getUserApproval(address user, address tokenAddress) external view returns (uint256) {
        return IERC20(tokenAddress).allowance(user, address(this));
    }
    
    // Emergency functions
    function emergencyPause() external onlyOwner {
        // Could implement pausable functionality if needed
    }
}