# MetaFloat - Reputation-Based DeFi Lending Platform

🚀 **Live Application**: [https://metafloat.vercel.app/](https://metafloat.vercel.app/)

MetaFloat is a DeFi lending platform that uses on-chain reputation scoring based on MetaMask Card transaction history to provide instant, collateral-free loans. Built on Linea, MetaFloat enables users to access credit based on their proven financial behavior and consistency.

## 🌟 Key Features

### 🏆 **Reputation-Based Credit Scoring**
- **MetaMask Card Integration**: Analyzes real-world spending patterns
- **Multi-Factor Scoring**: Consistency, loyalty, sophistication, activity, and reliability metrics
- **Trust Levels**: Bronze, Silver, Gold, and Platinum tiers
- **Dynamic Assessment**: Real-time reputation updates based on transaction history

### 💰 **Instant Loans**
- **No Collateral Required**: Loans based purely on reputation trust
- **Fixed 1% APR**: Transparent, competitive rates for all users
- **Multiple Tiers**: $25 (Micro) to $1,000 (Large) loan amounts
- **30-Day Terms**: Short-term loans with automatic collection
- **Instant Funding**: Receive USDC immediately upon approval

### 🔄 **Smart Contract Automation**
- **Automated Repayment**: Loans auto-collected after 30 days
- **Eligibility Verification**: Real-time qualification checks
- **On-Chain Reputation**: Immutable, verifiable credit scores
- **Gas Optimized**: Efficient contract design for low-cost operations

## 🏗️ Smart Contract Architecture

### Core Contracts

| Contract | Address | Description |
|----------|---------|-------------|
| **MetaFloatID** | [`0x288457a45BD6C6e2dA282B0270210317448E1ECe`](https://sepolia.lineascan.build/address/0x288457a45BD6C6e2dA282B0270210317448E1ECe) | Identity management and user verification |
| **MetaFloatReputation** | [`0x1DF5405f6393058Fec1E78ecb0B1e0F6B6fA68c4`](https://sepolia.lineascan.build/address/0x1DF5405f6393058Fec1E78ecb0B1e0F6B6fA68c4) | Core reputation scoring and storage |
| **MetaFloatReputationReader** | [`0x83C6cfC2C367DCd73707e0F03f1BCe0901235326`](https://sepolia.lineascan.build/address/0x83C6cfC2C367DCd73707e0F03f1BCe0901235326) | Optimized reputation data access |
| **MetaFloatLoanEligibility** | [`0xe235c14329BFe8DF418947361CE856CAf41A584b`](https://sepolia.lineascan.build/address/0xe235c14329BFe8DF418947361CE856CAf41A584b) | Loan qualification and tier determination |
| **MetaFloatLoanManager** | [`0xDC7B6EBBd5da133aFEcC2F8aA256A05Cf03d459A`](https://sepolia.lineascan.build/address/0xDC7B6EBBd5da133aFEcC2F8aA256A05Cf03d459A) | Loan issuance, repayment, and management |

### Contract Flow
```
MetaFloatID → MetaFloatReputation → MetaFloatLoanEligibility → MetaFloatLoanManager
     ↓              ↓                        ↓                        ↓
  Identity      Reputation              Qualification            Loan Management
```

## 💡 How It Works

### 1. **Reputation Building**
- Connect your wallet with MetaMask Card transaction history
- AI analyzes spending patterns, consistency, and financial behavior
- Reputation scores are calculated and stored on-chain
- Regular updates maintain current reputation status

### 2. **Loan Qualification**
- Real-time eligibility check based on reputation scores
- Tier determination (Micro/Small/Medium/Large) based on trust level
- Maximum loan amounts calculated from behavioral analysis
- Instant approval for qualified users

### 3. **Loan Process**
- **Approve**: User approves USDC spending for repayment (principal + interest)
- **Request**: Instant loan issuance upon approval
- **Receive**: USDC deposited directly to user's wallet
- **Repay**: Automatic collection after 30 days or manual early repayment

## 🎯 Loan Tiers & Requirements

| Tier | Amount | Min Overall Score | Min Consistency | Min Trust Level | APR |
|------|--------|------------------|-----------------|-----------------|-----|
| **Micro** | $25 | 600 | 600 | Bronze | 1% |
| **Small** | $50 | 700 | 700 | Bronze | 1% |
| **Medium** | $200 | 800 | 800 | Silver | 1% |
| **Large** | $1,000 | 950 | 950 | Gold | 1% |

### Additional Requirements
- ✅ Minimum 100 activity score
- ✅ Valid MetaFloat ID
- ✅ Current reputation data (recently updated)
- ✅ Maximum 1 active loan per wallet

## 🛠️ Technology Stack

### Frontend
- **React** with TypeScript

### Backend & Infrastructure
- **Vercel** for frontend deployment
- **Line Testnet** for smart contract deployment

### Smart Contracts
- **Solidity 0.8.19**
- **OpenZeppelin** for security standards
- **Hardhat** for development and testing
- **ERC20** token standard for USDC integration

## 🚀 Getting Started

### Prerequisites
- MetaMask wallet with MetaMask Card transaction history
- Some ETH for gas fees
- USDC for loan repayment (acquired after loan approval)

### Using the Platform

1. **Visit** [https://metafloat.vercel.app/](https://metafloat.vercel.app/)
2. **Connect** your MetaMask wallet
3. **Update** your reputation by clicking "Update Reputation"
4. **Check** your loan eligibility and tier
5. **Request** a loan based on your qualification
6. **Approve** USDC spending for repayment
7. **Receive** instant USDC funding

### Development Setup

```bash
# Clone the repository
git clone https://github.com/Kagwep/metafloat.git
cd metafloat/client

# Install dependencies
npm install


# Start development server
npm run dev

# Build for production
npm run build
```



## 📊 Reputation Scoring System

### Core Metrics

**Consistency Score (0-1000)**
- Regularity of spending patterns
- Predictability of financial behavior
- Required minimum: 600 for any loan

**Loyalty Score (0-1000)**
- Duration of platform engagement
- Long-term user value indicator
- Higher scores unlock better terms

**Sophistication Score (0-1000)**
- Token diversity in transactions
- DeFi experience level
- Complex transaction patterns

**Activity Score (0-1000)**
- Recent platform usage frequency
- Minimum 100 required for loans
- Indicates active engagement

**Reliability Score (0-1000)**
- Transaction success rate
- Platform stability indicator
- Consistent user behavior

**Overall Reputation (0-1000)**
- Weighted combination of all metrics
- Primary factor for loan eligibility
- Determines maximum loan tier



## 📈 Roadmap

### Phase 1 (Current) - Core Platform
- ✅ Reputation scoring system
- ✅ Basic loan functionality
- ✅ USDC integration
- ✅ Web application

### Phase 2 - Enhanced Features
- 🔄 Multi-token support (USDT, WETH, etc.)
- 🔄 Mobile application
- 🔄 Credit score improvements
- 🔄 Advanced analytics dashboard

### Phase 3 - Ecosystem Expansion
- 📅 Integration with other DeFi protocols
- 📅 Institutional lending features
- 📅 Cross-chain compatibility
- 📅 Governance token launch

### Phase 4 - Advanced DeFi
- 📅 Yield farming integration
- 📅 Liquidity provision features
- 📅 Insurance products
- 📅 Reputation marketplace

## 🤝 Contributing

We welcome contributions from the community! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on how to submit pull requests, report issues, and suggest improvements.

### Development Areas
- Frontend React components
- Smart contract optimization
- Reputation algorithm improvements
- Security auditing
- Documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

