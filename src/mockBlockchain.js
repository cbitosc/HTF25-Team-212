// Mock blockchain data storage
let blockchain = [];
let blockCounter = 0;

// Simulate blockchain delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock: Generate blockchain hash
const generateMockHash = () => {
  return '0x' + Math.random().toString(36).substring(2, 15);
};

// Mock: Register property on blockchain
export const registerProperty = async (propertyData) => {
  await delay(1000);
  
  const block = {
    blockNumber: ++blockCounter,
    timestamp: new Date().toISOString(),
    propertyId: `PROP-${blockCounter}`,
    data: {
      ...propertyData,
      forSale: false,
      price: 0,
      transferHistory: [],
    },
    hash: generateMockHash(),
    previousHash: blockchain.length > 0 ? blockchain[blockchain.length - 1].hash : '0x000',
  };
  
  blockchain.push(block);
  console.log('Block added to chain:', block);
  return block;
};

// Mock: Get all properties
export const getAllProperties = () => {
  return blockchain.map(block => ({
    id: block.propertyId,
    blockNumber: block.blockNumber,
    ...block.data,
    timestamp: block.timestamp,
  }));
};

// Mock: Get properties by owner
export const getPropertiesByOwner = (ownerAddress) => {
  return blockchain
    .filter(block => block.data.owner === ownerAddress)
    .map(block => ({
      id: block.propertyId,
      blockNumber: block.blockNumber,
      ...block.data,
      timestamp: block.timestamp,
    }));
};

// Mock: Get properties for sale
export const getPropertiesForSale = () => {
  return blockchain
    .filter(block => block.data.forSale === true)
    .map(block => ({
      id: block.propertyId,
      blockNumber: block.blockNumber,
      ...block.data,
      timestamp: block.timestamp,
    }));
};

// Mock: List property for sale
export const listPropertyForSale = async (propertyId, price) => {
  await delay(1000);
  
  const propertyBlock = blockchain.find(b => b.propertyId === propertyId);
  if (propertyBlock) {
    propertyBlock.data.forSale = true;
    propertyBlock.data.price = price;
  }
  
  return { success: true };
};

// Mock: Buy property (transfer with payment)
export const buyProperty = async (propertyId, buyerAddress) => {
  await delay(1500);
  
  const propertyBlock = blockchain.find(b => b.propertyId === propertyId);
  if (propertyBlock && propertyBlock.data.forSale) {
    const previousOwner = propertyBlock.data.owner;
    const price = propertyBlock.data.price;
    
    // Record transfer history
    if (!propertyBlock.data.transferHistory) {
      propertyBlock.data.transferHistory = [];
    }
    
    propertyBlock.data.transferHistory.push({
      from: previousOwner,
      to: buyerAddress,
      price: price,
      timestamp: new Date().toISOString(),
      transactionHash: generateMockHash(),
    });
    
    propertyBlock.data.owner = buyerAddress;
    propertyBlock.data.forSale = false;
    propertyBlock.data.price = 0;
    
    return { 
      success: true, 
      property: propertyBlock.data,
      receipt: {
        from: previousOwner,
        to: buyerAddress,
        price: price,
        propertyId: propertyId,
        transactionHash: propertyBlock.data.transferHistory[propertyBlock.data.transferHistory.length - 1].transactionHash,
      }
    };
  }
  
  return { success: false };
};

// Mock: Get property transfer history
export const getPropertyHistory = (propertyId) => {
  const propertyBlock = blockchain.find(b => b.propertyId === propertyId);
  if (propertyBlock) {
    return {
      propertyId: propertyId,
      currentOwner: propertyBlock.data.owner,
      blockNumber: propertyBlock.blockNumber,
      hash: propertyBlock.hash,
      timestamp: propertyBlock.timestamp,
      transferHistory: propertyBlock.data.transferHistory || [],
    };
  }
  return null;
};
