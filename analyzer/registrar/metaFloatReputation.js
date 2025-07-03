const { ethers } = require('ethers');

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

const METAFLOAT_REPUTATION_ABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "updater",
				"type": "address"
			}
		],
		"name": "addAuthorizedUpdater",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_metaFloatContract",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "OwnableInvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "OwnableUnauthorizedAccount",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "updater",
				"type": "address"
			}
		],
		"name": "AuthorizedUpdaterAdded",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "updater",
				"type": "address"
			}
		],
		"name": "AuthorizedUpdaterRemoved",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "newContract",
				"type": "address"
			}
		],
		"name": "MetaFloatContractUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "pauseUser",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "updater",
				"type": "address"
			}
		],
		"name": "removeAuthorizedUpdater",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_metaFloatContract",
				"type": "address"
			}
		],
		"name": "setMetaFloatContract",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "unpauseUser",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"internalType": "uint16[5]",
				"name": "scores",
				"type": "uint16[5]"
			},
			{
				"internalType": "enum MetaFloatReputation.TrustLevel",
				"name": "trustLevel",
				"type": "uint8"
			},
			{
				"internalType": "enum MetaFloatReputation.UserClass",
				"name": "userClass",
				"type": "uint8"
			},
			{
				"internalType": "string[]",
				"name": "reasoningTags",
				"type": "string[]"
			}
		],
		"name": "updateUserReputation",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint16",
				"name": "overallReputation",
				"type": "uint16"
			},
			{
				"indexed": false,
				"internalType": "enum MetaFloatReputation.TrustLevel",
				"name": "trustLevel",
				"type": "uint8"
			},
			{
				"indexed": false,
				"internalType": "enum MetaFloatReputation.UserClass",
				"name": "userClass",
				"type": "uint8"
			}
		],
		"name": "UserReputationUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "UserVerified",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "authorizedUpdaters",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "getReputationAge",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "getReputationBreakdown",
		"outputs": [
			{
				"internalType": "uint16",
				"name": "consistency",
				"type": "uint16"
			},
			{
				"internalType": "uint16",
				"name": "loyalty",
				"type": "uint16"
			},
			{
				"internalType": "uint16",
				"name": "sophistication",
				"type": "uint16"
			},
			{
				"internalType": "uint16",
				"name": "activity",
				"type": "uint16"
			},
			{
				"internalType": "uint16",
				"name": "reliability",
				"type": "uint16"
			},
			{
				"internalType": "uint16",
				"name": "overall",
				"type": "uint16"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "getUserClass",
		"outputs": [
			{
				"internalType": "enum MetaFloatReputation.UserClass",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "getUserProfile",
		"outputs": [
			{
				"components": [
					{
						"internalType": "address",
						"name": "walletAddress",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "verificationTimestamp",
						"type": "uint256"
					},
					{
						"internalType": "enum MetaFloatReputation.TrustLevel",
						"name": "trustLevel",
						"type": "uint8"
					},
					{
						"internalType": "enum MetaFloatReputation.UserClass",
						"name": "userClass",
						"type": "uint8"
					},
					{
						"components": [
							{
								"internalType": "uint16",
								"name": "consistencyScore",
								"type": "uint16"
							},
							{
								"internalType": "uint16",
								"name": "loyaltyScore",
								"type": "uint16"
							},
							{
								"internalType": "uint16",
								"name": "sophisticationScore",
								"type": "uint16"
							},
							{
								"internalType": "uint16",
								"name": "activityScore",
								"type": "uint16"
							},
							{
								"internalType": "uint16",
								"name": "reliabilityScore",
								"type": "uint16"
							},
							{
								"internalType": "uint16",
								"name": "overallReputation",
								"type": "uint16"
							}
						],
						"internalType": "struct MetaFloatReputation.ReputationScores",
						"name": "scores",
						"type": "tuple"
					},
					{
						"internalType": "bool",
						"name": "isVerified",
						"type": "bool"
					},
					{
						"internalType": "uint256",
						"name": "lastUpdateTimestamp",
						"type": "uint256"
					},
					{
						"internalType": "string[]",
						"name": "reasoningTags",
						"type": "string[]"
					}
				],
				"internalType": "struct MetaFloatReputation.UserProfile",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "getUserReputation",
		"outputs": [
			{
				"internalType": "uint16",
				"name": "",
				"type": "uint16"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "getUserTrustLevel",
		"outputs": [
			{
				"internalType": "enum MetaFloatReputation.TrustLevel",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "isReputationCurrent",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "isUserVerified",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"internalType": "uint16",
				"name": "minimumScore",
				"type": "uint16"
			}
		],
		"name": "meetsMinimumReputation",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "metaFloat",
		"outputs": [
			{
				"internalType": "contract MetaFloat",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "MIN_REPUTATION_FOR_VERIFICATION",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "REPUTATION_VALIDITY_PERIOD",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "userProfiles",
		"outputs": [
			{
				"internalType": "address",
				"name": "walletAddress",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "verificationTimestamp",
				"type": "uint256"
			},
			{
				"internalType": "enum MetaFloatReputation.TrustLevel",
				"name": "trustLevel",
				"type": "uint8"
			},
			{
				"internalType": "enum MetaFloatReputation.UserClass",
				"name": "userClass",
				"type": "uint8"
			},
			{
				"components": [
					{
						"internalType": "uint16",
						"name": "consistencyScore",
						"type": "uint16"
					},
					{
						"internalType": "uint16",
						"name": "loyaltyScore",
						"type": "uint16"
					},
					{
						"internalType": "uint16",
						"name": "sophisticationScore",
						"type": "uint16"
					},
					{
						"internalType": "uint16",
						"name": "activityScore",
						"type": "uint16"
					},
					{
						"internalType": "uint16",
						"name": "reliabilityScore",
						"type": "uint16"
					},
					{
						"internalType": "uint16",
						"name": "overallReputation",
						"type": "uint16"
					}
				],
				"internalType": "struct MetaFloatReputation.ReputationScores",
				"name": "scores",
				"type": "tuple"
			},
			{
				"internalType": "bool",
				"name": "isVerified",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "lastUpdateTimestamp",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]

// Helper function to safely get enum values
function getTrustLevelEnum(trustLevel) {
    const normalizedKey = String(trustLevel).trim();
    if (TrustLevel.hasOwnProperty(normalizedKey)) {
        return TrustLevel[normalizedKey];
    }
    
    // Fallback mapping for potential variations
    const fallbackMapping = {
        'bronze': 0,
        'silver': 1,
        'gold': 2,
        'platinum': 3
    };
    
    const lowerKey = normalizedKey.toLowerCase();
    if (fallbackMapping.hasOwnProperty(lowerKey)) {
        return fallbackMapping[lowerKey];
    }
    
    throw new Error(`Unknown trust level: "${trustLevel}". Available: ${Object.keys(TrustLevel).join(', ')}`);
}

function getUserClassEnum(userClass) {
    const normalizedKey = String(userClass).trim();
    if (UserClass.hasOwnProperty(normalizedKey)) {
        return UserClass[normalizedKey];
    }
    
    // Fallback mapping for potential variations
    const fallbackMapping = {
        'newcomer': 0,
        'casual user': 1,
        'regular user': 2,
        'power user': 3,
        'whale': 4,
        'veteran': 5
    };
    
    const lowerKey = normalizedKey.toLowerCase();
    if (fallbackMapping.hasOwnProperty(lowerKey)) {
        return fallbackMapping[lowerKey];
    }
    
    throw new Error(`Unknown user class: "${userClass}". Available: ${Object.keys(UserClass).join(', ')}`);
}

class MetaFloatReputationContract {
    constructor() {
        // Read from environment variables
        this.rpcUrl = process.env.RPC_URL;
        this.privateKey = process.env.PRIVATE_KEY;
        this.contractAddress = process.env.CONTRACT_ADDRESS;
        
        if (!this.rpcUrl || !this.privateKey || !this.contractAddress) {
            throw new Error('Missing required environment variables: RPC_URL, PRIVATE_KEY, CONTRACT_ADDRESS');
        }
        
        // Initialize provider and wallet
        this.provider = new ethers.JsonRpcProvider(this.rpcUrl);
        this.wallet = new ethers.Wallet(this.privateKey, this.provider);
        
        // Initialize contract
        this.contract = new ethers.Contract(
            this.contractAddress,
            METAFLOAT_REPUTATION_ABI,
            this.wallet
        );
        
        console.log('MetaFloat Reputation Contract initialized');
        console.log('Contract Address:', this.contractAddress);
        console.log('Wallet Address:', this.wallet.address);
    }

	generateReasoningTags(userProfile) {
        const tags = [];
        const scores = userProfile.reputation_scores;
        const metrics = userProfile.behavioral_metrics;
        
        // Trust level tag
        tags.push(`Trust: ${userProfile.trust_level}`);
        
        // User class tag
        tags.push(`Class: ${userProfile.user_class}`);
        
        // Score-based tags
        if (scores.consistency_score >= 700) {
            tags.push("High Consistency");
        } else if (scores.consistency_score <= 200) {
            tags.push("Inconsistent Spending");
        }
        
        if (scores.loyalty_score >= 700) {
            tags.push("Platform Loyal");
        }
        
        if (scores.sophistication_score >= 700) {
            tags.push(`Multi-Token User (${metrics.unique_tokens} tokens)`);
        }
        
        if (scores.activity_score >= 800) {
            tags.push("Highly Active");
        }
        
        // Volume-based tags
        if (metrics.total_volume >= 10000) {
            tags.push("High Volume");
        } else if (metrics.total_volume <= 100) {
            tags.push("Low Volume");
        }
        
        // Tenure-based tags
        if (metrics.platform_tenure >= 180) {
            tags.push("Veteran User");
        } else if (metrics.platform_tenure <= 7) {
            tags.push("New User");
        }
        
        // Activity frequency tags
        if (metrics.transaction_frequency >= 2) {
            tags.push("Daily User");
        }
        
        // Return only first 5 tags to fit contract limits
        return tags.slice(0, 5);
    }
    
    /**
     * Update user reputation on-chain
     * @param {Object} userProfile - User profile from reputation engine
     * @returns {Object} Transaction result
     */
    async updateUserReputation(userProfile) {
        try {
            console.log(`Updating reputation for ${userProfile.wallet_address}...`);
            
            // Prepare contract parameters
            const userAddress = userProfile.wallet_address;
            
            // Convert scores to uint16 array [consistency, loyalty, sophistication, activity, reliability]
            const scores = [
                userProfile.reputation_scores.consistency_score,
                userProfile.reputation_scores.loyalty_score,
                userProfile.reputation_scores.sophistication_score,
                userProfile.reputation_scores.activity_score,
                userProfile.reputation_scores.reliability_score
            ];
            
            // Convert enums to uint8
			const trustLevel = getTrustLevelEnum(userProfile.trust_level);
            const userClass = getUserClassEnum(userProfile.user_class);

            
            // Convert reasoning to string array (truncate if too long)
			const reasoningTags = this.generateReasoningTags(userProfile);

			console.log(
				userAddress,
                scores,
                trustLevel,
                userClass,
                reasoningTags
			);
            
            // Estimate gas
            const gasEstimate = await this.contract.updateUserReputation.estimateGas(
                userAddress,
                scores,
                trustLevel,
                userClass,
                reasoningTags
            );
            
            console.log('Estimated gas:', gasEstimate.toString());
            
            // Execute transaction with gas limit buffer
            const feeData = await this.provider.getFeeData();
            
            const tx = await this.contract.updateUserReputation(
                userAddress,
                scores,
                trustLevel,
                userClass,
                reasoningTags,
                {
                    gasLimit: gasEstimate * 120n / 100n, // 20% buffer
                    maxFeePerGas: feeData.maxFeePerGas,
                    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas
                }
            );
            
            console.log('Transaction submitted:', tx.hash);
            
            // Wait for confirmation
            const receipt = await tx.wait();
            
            console.log(`✅ Reputation updated! Block: ${receipt.blockNumber}, Gas used: ${receipt.gasUsed}`);
            
            return {
                success: true,
                transactionHash: tx.hash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed.toString(),
                userAddress: userAddress,
                overallReputation: userProfile.reputation_scores.overall_reputation,
                trustLevel: userProfile.trust_level,
                userClass: userProfile.user_class
            };
            
        } catch (error) {
            console.error('Error updating reputation:', error);
            
            return {
                success: false,
                error: error.message,
                userAddress: userProfile.wallet_address
            };
        }
    }

}

module.exports = { MetaFloatReputationContract };