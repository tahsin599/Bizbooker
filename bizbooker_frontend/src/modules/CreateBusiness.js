import React, { useState } from 'react';
import './CreateBusiness.css';
import Navbar from './Navbar';
import { ArrowRight, X, Image as ImageIcon } from 'lucide-react';

const CreateBusiness = () => {
  const [formData, setFormData] = useState({
    businessName: '',
    description: '',
    businessCategory: '',
    image: null
  });

  const [errors, setErrors] = useState({});

  const businessCategories = [
    'Healthcare',
    'Beauty & Wellness',
    'Restaurant & Food',
    'Education',
    'Fitness',
    'Professional Services',
    'Automotive',
    'Home Services',
    'Event Planning',
    'Technology',
    'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      image: file
    }));
    
    // Clear error when user selects image
    if (errors.image) {
      setErrors(prev => ({
        ...prev,
        image: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.businessCategory) {
      newErrors.businessCategory = 'Business category is required';
    }
    
    if (!formData.image) {
      newErrors.image = 'Business image is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Create JavaScript object and log to console
      const businessData = {
        businessName: formData.businessName,
        description: formData.description,
        businessCategory: formData.businessCategory,
        image: formData.image ? formData.image.name : null,
        createdAt: new Date().toISOString()
      };
      
      console.log('Business Account Data:', businessData);
      
      // You can add success message or redirect here
      alert('Business account created successfully! Check console for data.');
    }
  };

  return (
    <div className="create-business-container">
      <Navbar />
      
      <div className="create-business-content">
        <div className="create-business-header">
          <h1>Create Your Business Account</h1>
          <p>Start offering your services to customers on BizzBooker</p>
        </div>
        
        <div className="create-business-form-container">
          <form onSubmit={handleSubmit} className="create-business-form">
            <div className="form-group">
              <label htmlFor="businessName" className="form-label">
                Business Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                className={`form-input ${errors.businessName ? 'error' : ''}`}
                placeholder="Enter your business name"
              />
              {errors.businessName && <span className="error-message">{errors.businessName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Business Description <span className="required">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className={`form-textarea ${errors.description ? 'error' : ''}`}
                placeholder="Describe your business and services..."
                rows="4"
              />
              {errors.description && <span className="error-message">{errors.description}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="businessCategory" className="form-label">
                Business Category <span className="required">*</span>
              </label>
              <select
                id="businessCategory"
                name="businessCategory"
                value={formData.businessCategory}
                onChange={handleInputChange}
                className={`form-select ${errors.businessCategory ? 'error' : ''}`}
              >
                <option value="">Select a category</option>
                {businessCategories.map((category, index) => (
                  <option key={index} value={category}>{category}</option>
                ))}
              </select>
              {errors.businessCategory && <span className="error-message">{errors.businessCategory}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="image" className="form-label">
                Business Image <span className="required">*</span>
              </label>
              <div className="file-input-container">
                <input
                  type="file"
                  id="image"
                  name="image"
                  onChange={handleImageChange}
                  className={`form-file-input ${errors.image ? 'error' : ''}`}
                  accept="image/*"
                />
                <label htmlFor="image" className="file-input-label">
                  <div className="file-input-icon">
                    <ImageIcon size={20} />
                  </div>
                  <span>{formData.image ? formData.image.name : 'Choose business image'}</span>
                  {formData.image && (
                    <button 
                      type="button" 
                      className="clear-file-btn"
                      onClick={() => setFormData(prev => ({ ...prev, image: null }))}
                    >
                      <X size={16} />
                    </button>
                  )}
                </label>
              </div>
              {errors.image && <span className="error-message">{errors.image}</span>}
            </div>

            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={() => window.history.back()}>
                Cancel
              </button>
              <button type="submit" className="submit-btn">
                Create Business Account <ArrowRight size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateBusiness;