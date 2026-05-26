import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import ImageUpload from '../components/ImageUpload';

const CreatePost = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Other',
    status: 'draft'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setError('');
  };

  const handleUpload = (uploadFormData) => {
    console.log('FormData ready:', uploadFormData.get('image'));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // Validate fields
      if (!formData.title.trim()) {
        setError('Title is required');
        setIsLoading(false);
        return;
      }

      if (!formData.content.trim()) {
        setError('Content is required');
        setIsLoading(false);
        return;
      }

      if (formData.content.trim().length < 10) {
        setError('Content must be at least 10 characters');
        setIsLoading(false);
        return;
      }

      const response = await api.post('/api/posts', formData);
      
      if (response.data.success) {
        setSuccess('Post created successfully!');
        toast.success('Post created successfully!');
        
        // Clear form
        setFormData({
          title: '',
          content: '',
          category: 'Other',
          status: 'draft'
        });

        // Redirect to dashboard after 1 second
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create post';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Create post error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={formContainerStyle}>
        <h1 style={titleStyle}>Create New Post</h1>
        
        {error && <div style={errorStyle}>{error}</div>}
        {success && <div style={successStyle}>{success}</div>}

        <div style={{ marginBottom: '1.5rem' }}>
          <ImageUpload onUpload={handleUpload} />
        </div>

        <form onSubmit={handleSubmit} style={formStyle}>
          {/* Title */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter post title"
              maxLength="100"
              required
              style={inputStyle}
            />
            <small style={smallTextStyle}>{formData.title.length}/100 characters</small>
          </div>

          {/* Content */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Content</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Write your post content (minimum 10 characters)..."
              rows="10"
              required
              style={textareaStyle}
            />
            <small style={smallTextStyle}>{formData.content.length} characters</small>
          </div>

          {/* Category */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="Technology">Technology</option>
              <option value="Lifestyle">Lifestyle</option>
              <option value="Travel">Travel</option>
              <option value="Food">Food</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Status */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            style={{
              ...buttonStyle,
              opacity: isLoading ? 0.6 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Creating...' : 'Create Post'}
          </button>
        </form>
      </div>
    </div>
  );
};

const containerStyle = {
  maxWidth: '900px',
  margin: '0 auto',
  padding: '2rem 1rem',
  minHeight: '100vh',
};

const formContainerStyle = {
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  padding: '2rem',
};

const titleStyle = {
  color: '#333',
  marginBottom: '1.5rem',
  fontSize: '1.8rem',
  textAlign: 'center',
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
};

const fieldStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const labelStyle = {
  fontWeight: '600',
  color: '#333',
  fontSize: '0.95rem',
};

const inputStyle = {
  padding: '0.75rem',
  border: '1px solid #ddd',
  borderRadius: '5px',
  fontSize: '1rem',
  fontFamily: 'inherit',
  transition: 'border-color 0.3s ease',
};

const textareaStyle = {
  padding: '0.75rem',
  border: '1px solid #ddd',
  borderRadius: '5px',
  fontSize: '1rem',
  fontFamily: 'inherit',
  resize: 'vertical',
  minHeight: '200px',
  transition: 'border-color 0.3s ease',
};

const smallTextStyle = {
  color: '#999',
  fontSize: '0.85rem',
};

const buttonStyle = {
  padding: '0.75rem 1.5rem',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  fontSize: '1rem',
  fontWeight: '600',
  marginTop: '0.5rem',
  transition: 'background-color 0.3s ease',
};

const errorStyle = {
  padding: '1rem',
  backgroundColor: '#f8d7da',
  color: '#721c24',
  border: '1px solid #f5c6cb',
  borderRadius: '5px',
  marginBottom: '1rem',
};

const successStyle = {
  padding: '1rem',
  backgroundColor: '#d4edda',
  color: '#155724',
  border: '1px solid #c3e6cb',
  borderRadius: '5px',
  marginBottom: '1rem',
};

export default CreatePost;
