import { useEffect, useState } from 'react';

const ImageUpload = ({ onUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState('');
  const [isRotating, setIsRotating] = useState(false);

  const validateFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const maxSizeInBytes = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      return 'Please select an image file (JPEG, PNG, WebP, or GIF)';
    }

    if (file.size > maxSizeInBytes) {
      return `File is too large. Maximum size is 5MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB`;
    }

    return null;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setError('');

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    setSelectedFile(file);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const rotateSelectedImage = async (direction = 'right') => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setIsRotating(true);
    setError('');

    try {
      const rotatedFile = await rotateFile(selectedFile, direction);

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setSelectedFile(rotatedFile);
      setPreviewUrl(URL.createObjectURL(rotatedFile));
    } catch (rotationError) {
      setError(rotationError.message || 'Could not rotate image');
    } finally {
      setIsRotating(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedFile);

    if (onUpload) {
      onUpload(formData);
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <label style={labelStyle} htmlFor="image-upload">
        Upload image
      </label>
      <input
        id="image-upload"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        style={inputStyle}
      />

      {error && <p style={errorStyle}>{error}</p>}

      {previewUrl && (
        <div style={previewContainerStyle}>
          <p style={previewLabelStyle}>Preview:</p>
          <img
            src={previewUrl}
            alt="Selected file preview"
            style={previewImageStyle}
          />
          <div style={rotateButtonRowStyle}>
            <button
              type="button"
              onClick={() => rotateSelectedImage('left')}
              disabled={isRotating}
              style={secondaryButtonStyle}
            >
              Rotate left
            </button>
            <button
              type="button"
              onClick={() => rotateSelectedImage('right')}
              disabled={isRotating}
              style={secondaryButtonStyle}
            >
              Rotate right
            </button>
          </div>
        </div>
      )}

      <button type="submit" disabled={!selectedFile || !!error || isRotating} style={buttonStyle}>
        {isRotating ? 'Rotating...' : 'Upload Image'}
      </button>
    </form>
  );
};

const rotateFile = (file, direction) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Could not process image'));
        return;
      }

      const isQuarterTurn = direction === 'left' || direction === 'right';
      canvas.width = isQuarterTurn ? image.height : image.width;
      canvas.height = isQuarterTurn ? image.width : image.height;

      context.translate(canvas.width / 2, canvas.height / 2);

      if (direction === 'left') {
        context.rotate((-90 * Math.PI) / 180);
      } else {
        context.rotate((90 * Math.PI) / 180);
      }

      context.drawImage(image, -image.width / 2, -image.height / 2);

      const outputType = file.type || 'image/jpeg';
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(objectUrl);

          if (!blob) {
            reject(new Error('Could not rotate image'));
            return;
          }

          resolve(new File([blob], file.name, { type: blob.type || outputType }));
        },
        outputType,
        0.92
      );
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Could not load image'));
    };

    image.src = objectUrl;
  });
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  padding: '1.25rem',
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  backgroundColor: '#fff',
};

const labelStyle = {
  fontWeight: 600,
  color: '#111827',
};

const inputStyle = {
  padding: '0.75rem',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  fontSize: '1rem',
  backgroundColor: '#fff',
};

const errorStyle = {
  margin: 0,
  color: '#b91c1c',
};

const previewContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const rotateButtonRowStyle = {
  display: 'flex',
  gap: '0.75rem',
  flexWrap: 'wrap',
};

const previewLabelStyle = {
  margin: 0,
  color: '#374151',
  fontWeight: 500,
};

const previewImageStyle = {
  width: '200px',
  height: '200px',
  objectFit: 'cover',
  borderRadius: '10px',
  border: '1px solid #d1d5db',
  backgroundColor: '#f3f4f6',
};

const buttonStyle = {
  alignSelf: 'flex-start',
  padding: '0.75rem 1.25rem',
  border: 'none',
  borderRadius: '8px',
  backgroundColor: '#111827',
  color: '#fff',
  fontSize: '1rem',
  fontWeight: 600,
  cursor: 'pointer',
};

const secondaryButtonStyle = {
  ...buttonStyle,
  backgroundColor: '#374151',
  fontSize: '0.95rem',
};

export default ImageUpload;