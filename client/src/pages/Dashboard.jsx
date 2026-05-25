import { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import socket from '../services/socket';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, token, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (loading || !user || !token) {
      return;
    }

    console.log('Dashboard route mounted');

    const handleConnect = () => {
      console.log(`Socket connected: ${socket.id}`);
    };

    const handleDisconnect = (reason) => {
      console.log(`Socket disconnected: ${reason}`);
    };

    const handleConnectError = (error) => {
      console.error('Socket connection error:', error.message);
    };

    const handleNewPost = (data) => {
      toast.success(data.message);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('newPost', handleNewPost);

    if (!socket.connected) {
      socket.connect();
    } else {
      handleConnect();
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('newPost', handleNewPost);
      socket.off();
      socket.disconnect();
    };
  }, [loading, token, user]);

  useEffect(() => {
    if (loading || !user || !token) {
      return;
    }

    let isMounted = true;

    const loadPosts = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await api.get(`/api/posts?page=${currentPage}&limit=10`);

        if (!isMounted) {
          return;
        }

        setPosts(response.data.data);
        setPagination(response.data.pagination);
      } catch (err) {
        if (!isMounted) {
          return;
        }

        const errorMessage = err.response?.data?.message || 'Failed to load posts';
        setError(errorMessage);
        toast.error(errorMessage);
        console.error('Fetch posts error:', err);

        if (err.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadPosts();

    return () => {
      isMounted = false;
    };
  }, [currentPage, loading, navigate, token, user]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleDelete = async (postId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this post? This action cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await api.delete(`/api/posts/${postId}`);

      if (response.data.success) {
        setPosts((currentPosts) => currentPosts.filter((post) => post._id !== postId));
        setPagination((currentPagination) => ({
          ...currentPagination,
          total: Math.max((currentPagination.total || 1) - 1, 0)
        }));
        toast.success('Post deleted successfully');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete post';
      setError(errorMessage);
      toast.error(errorMessage);
      if (err.response?.status === 401) {
        navigate('/login');
      }
      console.error('Delete post error:', err);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>;

  if (!user) return <Navigate to="/login" />;

  if (isLoading && posts.length === 0) {
    return <div style={loadingStyle}>Loading posts...</div>;
  }

  return (
    <div style={containerStyle}>
      {/* Header with Create Button */}
      <div style={headerStyle}>
        <h1>Welcome, {user.name}!</h1>
        <div style={headerButtonsStyle}>
          <Link to="/create">
            <button style={createButtonStyle}>
              + Create New Post
            </button>
          </Link>
          <button onClick={logout} style={logoutButtonStyle}>
            Logout
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && <div style={errorStyle}>{error}</div>}

      {/* Posts List */}
      <div style={postsContainerStyle}>
        {posts.length === 0 ? (
          <div style={emptyStateStyle}>
            <h2>No posts yet</h2>
            <p>You haven't created any posts yet. Start sharing your content!</p>
            <Link to="/create">
              <button style={createButtonStyle}>Create your first post</button>
            </Link>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <div key={post._id} style={postCardStyle}>
                <div style={postHeaderStyle}>
                  <h3 style={postTitleStyle}>{post.title}</h3>
                  <div style={statusBadgeStyle(post.status)}>
                    {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                  </div>
                </div>
                <p style={contentPreviewStyle}>
                  {post.content.substring(0, 150)}
                  {post.content.length > 150 ? '...' : ''}
                </p>
                <div style={metaStyle}>
                  <span style={categoryBadgeStyle}>{post.category}</span>
                  <span style={dateStyle}>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div style={actionsStyle}>
                  <Link to={`/edit/${post._id}`} style={editLinkStyle}>
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(post._id)}
                    style={deleteButtonStyle}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div style={paginationStyle}>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  style={{
                    ...paginationButtonStyle,
                    opacity: pagination.hasPrevPage ? 1 : 0.5,
                    cursor: pagination.hasPrevPage ? 'pointer' : 'not-allowed'
                  }}
                >
                  ← Previous
                </button>

                <span style={pageInfoStyle}>
                  Page {pagination.page} of {pagination.totalPages}
                  <br />
                  {pagination.total} total posts
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  style={{
                    ...paginationButtonStyle,
                    opacity: pagination.hasNextPage ? 1 : 0.5,
                    cursor: pagination.hasNextPage ? 'pointer' : 'not-allowed'
                  }}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const containerStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '2rem 1rem',
  minHeight: '80vh',
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '2rem',
  padding: '1.5rem',
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  flexWrap: 'wrap',
  gap: '1rem',
};

const headerButtonsStyle = {
  display: 'flex',
  gap: '1rem',
  flexWrap: 'wrap',
};

const createButtonStyle = {
  padding: '0.6rem 1.2rem',
  backgroundColor: '#28a745',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '0.95rem',
  transition: 'background-color 0.3s ease',
};

const logoutButtonStyle = {
  padding: '0.6rem 1.2rem',
  backgroundColor: '#dc3545',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '0.95rem',
  transition: 'background-color 0.3s ease',
};

const postsContainerStyle = {
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  padding: '1.5rem',
};

const postCardStyle = {
  padding: '1.5rem',
  borderBottom: '1px solid #eee',
  transition: 'background-color 0.2s ease',
};

const postHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '1rem',
  marginBottom: '0.5rem',
};

const postTitleStyle = {
  color: '#333',
  margin: 0,
  fontSize: '1.25rem',
  flex: 1,
};

const statusBadgeStyle = (status) => ({
  padding: '0.25rem 0.75rem',
  backgroundColor: status === 'published' ? '#d4edda' : '#e2e3e5',
  color: status === 'published' ? '#155724' : '#383d41',
  borderRadius: '20px',
  fontSize: '0.8rem',
  fontWeight: '600',
  whiteSpace: 'nowrap',
});

const contentPreviewStyle = {
  color: '#666',
  margin: '0.75rem 0',
  lineHeight: '1.5',
};

const metaStyle = {
  display: 'flex',
  gap: '1rem',
  alignItems: 'center',
};

const categoryBadgeStyle = {
  display: 'inline-block',
  padding: '0.25rem 0.75rem',
  backgroundColor: '#e7f3ff',
  color: '#0066cc',
  borderRadius: '20px',
  fontSize: '0.8rem',
  fontWeight: '600',
};

const dateStyle = {
  fontSize: '0.85rem',
  color: '#999',
};

const actionsStyle = {
  display: 'flex',
  gap: '1rem',
  marginTop: '1rem',
};

const editLinkStyle = {
  padding: '0.5rem 1rem',
  backgroundColor: '#007bff',
  color: 'white',
  borderRadius: '5px',
  textDecoration: 'none',
  display: 'inline-block',
};

const deleteButtonStyle = {
  padding: '0.5rem 1rem',
  backgroundColor: '#dc3545',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

const paginationStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: '2rem',
  paddingTop: '1.5rem',
  borderTop: '1px solid #eee',
};

const paginationButtonStyle = {
  padding: '0.6rem 1.2rem',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontWeight: '600',
  transition: 'background-color 0.3s ease',
};

const pageInfoStyle = {
  textAlign: 'center',
  color: '#666',
  fontSize: '0.9rem',
  fontWeight: '500',
};

const emptyStateStyle = {
  textAlign: 'center',
  padding: '3rem 1rem',
};

const loadingStyle = {
  textAlign: 'center',
  padding: '3rem',
  fontSize: '1.1rem',
  color: '#666',
};

const errorStyle = {
  padding: '1rem',
  backgroundColor: '#f8d7da',
  color: '#721c24',
  border: '1px solid #f5c6cb',
  borderRadius: '5px',
  marginBottom: '1rem',
};

export default Dashboard;
