import React from 'react';

const PropertyModal = ({ property, isOpen, onClose, onSaveFavorite, favorites = [] }) => {
  if (!isOpen || !property) return null;

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return 'Price not available';
    return `₹${amount.toLocaleString()}`;
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="property-modal">
        <div className="modal-header">
          <h2>{property.title}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        
        <div className="modal-content">
          <div className="modal-image-section">
            <img src={property.image_url} alt={property.title} className="modal-property-image" />
          </div>
          
          <div className="modal-details">
            <div className="detail-section">
              <h3>📍 Location</h3>
              <p>{property.location}</p>
            </div>

            <div className="detail-section">
              <h3>💰 Price</h3>
              <p className="price-highlight">{formatCurrency(property.price)}</p>
            </div>

            {property.bedrooms && (
              <div className="detail-section">
                <h3>🛏️ Bedrooms</h3>
                <p>{property.bedrooms} BHK</p>
              </div>
            )}

            {property.bathrooms && (
              <div className="detail-section">
                <h3>🚿 Bathrooms</h3>
                <p>{property.bathrooms}</p>
              </div>
            )}

            {property.size_sqft && (
              <div className="detail-section">
                <h3>📐 Area</h3>
                <p>{property.size_sqft} sq ft</p>
              </div>
            )}

            {property.property_type && (
              <div className="detail-section">
                <h3>🏠 Property Type</h3>
                <p>{property.property_type}</p>
              </div>
            )}

            {property.amenities && property.amenities.length > 0 && (
              <div className="detail-section">
                <h3>✨ Amenities</h3>
                <div className="amenities-list">
                  {property.amenities.map((amenity, index) => (
                    <span key={index} className="amenity-tag">{amenity}</span>
                  ))}
                </div>
              </div>
            )}

            {property.description && (
              <div className="detail-section">
                <h3>📝 Description</h3>
                <p>{property.description}</p>
              </div>
            )}

            {property.year_built && (
              <div className="detail-section">
                <h3>🏗️ Year Built</h3>
                <p>{property.year_built}</p>
              </div>
            )}

            {property.parking && (
              <div className="detail-section">
                <h3>🅿️ Parking</h3>
                <p>{property.parking}</p>
              </div>
            )}

            {property.furnished && (
              <div className="detail-section">
                <h3>🛋️ Furnished</h3>
                <p>{property.furnished}</p>
              </div>
            )}

            <div className="detail-section contact-section">
              <h3>👨‍💼 Contact Dealer</h3>
              <p className="dealer-info">
                <strong>Phone:</strong> 
                <a href="tel:7982323147" className="phone-link">📞 7982323147</a>
              </p>
              <p className="contact-note">Available 9 AM - 8 PM for property inquiries</p>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button 
            className={`action-btn ${favorites.includes(String(property.id)) ? 'secondary-btn' : 'save-btn'}`}
            onClick={() => onSaveFavorite && onSaveFavorite(property.id)}
            disabled={favorites.includes(String(property.id))}
          >
            {favorites.includes(String(property.id)) ? '✓ Favorited' : '💚 Save to Favorites'}
          </button>
          <button 
            className="action-btn contact-btn"
            onClick={() => window.open('tel:7982323147', '_self')}
            title="Call dealer at 7982323147"
          >
            📞 Call Agent
          </button>
          <button className="action-btn secondary-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default PropertyModal;