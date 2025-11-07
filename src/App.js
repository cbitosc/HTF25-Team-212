import React, { useState } from 'react';
import './App.css';
import { 
  registerProperty, 
  getPropertiesByOwner, 
  getPropertiesForSale,
  listPropertyForSale,
  buyProperty,
  getPropertyHistory,
  getAllProperties
} from './mockBlockchain';

function App() {
  const [account] = useState('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
  const [mode, setMode] = useState('register'); // 'register', 'sell', 'buy'
   

  const [myProperties, setMyProperties] = useState([]);
    const [statusProperties, setStatusProperties] = useState([]);
  const [selectedPropertyHistory, setSelectedPropertyHistory] = useState(null);

  const [saleProperties, setSaleProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Register form
  const [location, setLocation] = useState('');
  const [size, setSize] = useState('');

  // Register new property
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const propertyData = { location, size, owner: account };
    await registerProperty(propertyData);
    
    setMessage('✅ Property registered on blockchain!');
    setLocation('');
    setSize('');
    setLoading(false);
  };

  // Load my properties (for selling)
  const loadMyProperties = () => {
    const props = getPropertiesByOwner(account);
    setMyProperties(props);
    setMode('sell');
  };

  // Load properties for sale (for buying)
  const loadSaleProperties = () => {
    const props = getPropertiesForSale();
    setSaleProperties(props);
    setMode('buy');
  };

  // List property for sale
  const handleListForSale = async (propertyId) => {
    const price = prompt('Enter sale price (e.g., 50 ETH):');
    if (price) {
      setLoading(true);
      await listPropertyForSale(propertyId, price);
      setMessage('✅ Property listed for sale!');
      loadMyProperties(); // Refresh
      setLoading(false);
    }
  };

  // Buy property
  const handleBuy = async (propertyId, price) => {
    const confirm = window.confirm(`Buy this property for ${price}?`);
    if (confirm) {
      setLoading(true);
      setMessage('💳 Processing payment...');
      
      const result = await buyProperty(propertyId, account);
      
      if (result.success) {
        setMessage('✅ Purchase successful! You are now the owner!');
        loadSaleProperties(); // Refresh
      } else {
        setMessage('❌ Purchase failed!');
      }
      setLoading(false);
    }
  };
    // Load all properties for status check
  const loadAllStatus = () => {
    const props = getAllProperties();
    setStatusProperties(props);
    setMode('status');
  };

  // View property history
  const viewHistory = (propertyId) => {
    const history = getPropertyHistory(propertyId);
    setSelectedPropertyHistory(history);
  };

  // Download certificate
  const downloadCertificate = (property) => {
    const certificate = `
===========================================
   BLOCKCHAIN LAND REGISTRY CERTIFICATE
===========================================

Property ID: ${property.id}
Location: ${property.location}
Size: ${property.size}
Block Number: ${property.blockNumber}

Current Owner: ${property.owner}
Registration Date: ${new Date(property.timestamp).toLocaleString()}

--- TRANSFER HISTORY ---
${property.transferHistory && property.transferHistory.length > 0 
  ? property.transferHistory.map((transfer, index) => `
Transfer #${index + 1}:
  From: ${transfer.from}
  To: ${transfer.to}
  Price: ${transfer.price}
  Date: ${new Date(transfer.timestamp).toLocaleString()}
  Transaction Hash: ${transfer.transactionHash}
`).join('\n')
  : 'No transfers yet - Original Owner'}

===========================================
This is a blockchain-verified certificate.
Generated on: ${new Date().toLocaleString()}
===========================================
    `;

    const blob = new Blob([certificate], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Land_Certificate_${property.id}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="App">
      <header>
        <h1>🏠 Decentralized Land Registry</h1>
        <p>Connected Wallet: {account}</p>
      </header>

      <main>
        {/* Mode Selection Buttons */}
        <div className="mode-buttons">
          <button onClick={() => setMode('register')} className={mode === 'register' ? 'active' : ''}>
            📝 Register Property
          </button>
          <button onClick={loadMyProperties} className={mode === 'sell' ? 'active' : ''}>
            💰 I Want to Sell
          </button>
          <button onClick={loadSaleProperties} className={mode === 'buy' ? 'active' : ''}>
            🛒 I Want to Buy
          </button>
                    <button onClick={loadAllStatus} className={mode === 'status' ? 'active' : ''}>
            📊 Check Status
          </button>

        </div>

        {message && <div className="success-message">{message}</div>}

        {/* REGISTER MODE */}
        {mode === 'register' && (
          <div className="property-form">
            <h2>Register New Property</h2>
            <form onSubmit={handleRegister}>
              <input 
                type="text" 
                placeholder="Property Location (e.g., Plot 123, Hyderabad)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
              <input 
                type="text" 
                placeholder="Size (e.g., 1000 sq ft)"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                required
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Processing...' : 'Register Property'}
              </button>
            </form>
          </div>
        )}

        {/* SELL MODE */}
        {mode === 'sell' && (
          <div>
            <h2>My Properties</h2>
            {myProperties.length === 0 ? (
              <p className="no-data">You don't own any properties yet. Register one first!</p>
            ) : (
              <div className="properties-grid">
                {myProperties.map((prop) => (
                  <div key={prop.id} className="property-card">
                    <h3>{prop.id}</h3>
                    <p><strong>Location:</strong> {prop.location}</p>
                    <p><strong>Size:</strong> {prop.size}</p>
                    <p><strong>Block #:</strong> {prop.blockNumber}</p>
                    <p><strong>Status:</strong> {prop.forSale ? `For Sale (${prop.price})` : 'Not Listed'}</p>
                    {!prop.forSale && (
                      <button onClick={() => handleListForSale(prop.id)} className="sell-btn">
                        List for Sale
                      </button>
                    )}
                    {prop.forSale && (
                      <span className="badge">Listed for Sale</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* BUY MODE */}
        {mode === 'buy' && (
          <div>
            <h2>Properties Available for Sale</h2>
            {saleProperties.length === 0 ? (
              <p className="no-data">No properties available for sale right now.</p>
            ) : (
              <div className="properties-grid">
                {saleProperties.map((prop) => (
                  <div key={prop.id} className="property-card buy-card">
                    <h3>{prop.id}</h3>
                    <p><strong>Location:</strong> {prop.location}</p>
                    <p><strong>Size:</strong> {prop.size}</p>
                    <p><strong>Price:</strong> <span className="price">{prop.price}</span></p>
                    <p className="owner"><strong>Current Owner:</strong> {prop.owner}</p>
                    <button onClick={() => handleBuy(prop.id, prop.price)} className="buy-btn">
                      🛒 Buy Now
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

                {/* STATUS MODE */}
        {mode === 'status' && (
          <div>
            <h2>All Registered Properties & Transaction History</h2>
            {statusProperties.length === 0 ? (
              <p className="no-data">No properties registered yet.</p>
            ) : (
              <div className="properties-grid">
                {statusProperties.map((prop) => (
                  <div key={prop.id} className="property-card status-card">
                    <h3>{prop.id}</h3>
                    <p><strong>Location:</strong> {prop.location}</p>
                    <p><strong>Size:</strong> {prop.size}</p>
                    <p><strong>Block #:</strong> {prop.blockNumber}</p>
                    <p className="owner"><strong>Current Owner:</strong> {prop.owner}</p>
                    <p><strong>Registered:</strong> {new Date(prop.timestamp).toLocaleString()}</p>
                    
                    {prop.transferHistory && prop.transferHistory.length > 0 && (
                      <div className="transfer-history">
                        <h4>🔄 Transfer History ({prop.transferHistory.length})</h4>
                        {prop.transferHistory.map((transfer, index) => (
                          <div key={index} className="transfer-item">
                            <p><strong>Transfer #{index + 1}</strong></p>
                            <p>From: {transfer.from.substring(0, 10)}...</p>
                            <p>To: {transfer.to.substring(0, 10)}...</p>
                            <p>Price: {transfer.price}</p>
                            <p>Date: {new Date(transfer.timestamp).toLocaleString()}</p>
                            <p className="hash">Hash: {transfer.transactionHash}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <button onClick={() => downloadCertificate(prop)} className="download-btn">
                      📥 Download Certificate
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}

export default App;
