const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("MetaFloatModule", (m) => {
  // Configuration parameters
  const baseURI = m.getParameter("baseURI", "https://api.metafloat.io/metadata/");
  
  // 1. Deploy MetaFloat NFT contract first
  const metaFloat = m.contract("MetaFloat", [baseURI]);
  
  // 2. Deploy MetaFloatReputation contract with MetaFloat address
  const metaFloatReputation = m.contract("MetaFloatReputation", [metaFloat]);
  
  // 3. Deploy MetaFloatReputationReader with both addresses
  const metaFloatReputationReader = m.contract("MetaFloatReputationReader", [
    metaFloatReputation,
    metaFloat
  ]);
  
  // 4. Deploy MetaFloatLoanEligibility with reader and reputation addresses
  const metaFloatLoanEligibility = m.contract("MetaFloatLoanEligibility", [
    metaFloatReputationReader,
    metaFloatReputation
  ]);
  
  // 5. Set up cross-contract connections after deployment
  // Set the reputation contract address in MetaFloat (if needed)
  m.call(metaFloat, "setReputationContract", [metaFloatReputation]);
  
  return {
    metaFloat,
    metaFloatReputation,
    metaFloatReputationReader,
    metaFloatLoanEligibility
  };
});