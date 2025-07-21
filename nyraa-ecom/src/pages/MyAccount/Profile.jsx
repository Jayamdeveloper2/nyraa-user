import React, { useState, useEffect } from 'react';
import { 
  MailIcon, 
  PhoneIcon, 
  UserIcon, 
  CalendarIcon
} from '../../components/ui/Myaccounticons/MyAccountIcons';
import { 
  EditAddressButton, 
  SaveAddressButton, 
  CancelButton, 
  SignOutButton
} from '../../components/ui/Myaccountbuttons/MyAccountButtons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ConfirmationModal from '../../components/ui/Myaccountconformodel/ConfirmationModal';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('userData')) || {});
  const [editing, setEditing] = useState({ name: false, phone: false });
  const [tempData, setTempData] = useState({ 
    name: user.name || '', 
    phone: user.phone || ''
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    actionType: 'signout',
    title: 'Confirm Sign Out'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No authentication token found. Please log in.');
          navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Profile data fetched:', response.data); 
        if (response.data.avatar) {
          console.log('Avatar URL:', response.data.avatar); 
        } else {
          console.warn('No avatar URL found in profile data');
        }

        setUser(response.data);
        setTempData({ 
          name: response.data.name || '', 
          phone: response.data.phone || ''
        });
        localStorage.setItem('userData', JSON.stringify(response.data));
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError(error.response?.data?.message || 'Error fetching profile');
        setIsLoading(false);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          localStorage.removeItem('isLoggedIn');
          navigate('/login');
        }
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleEdit = (field) => {
    setEditing({ ...editing, [field]: true });
    setTempData({ ...tempData, [field]: user[field] || '' });
  };

  const handleCancel = (field) => {
    setEditing({ ...editing, [field]: false });
    setTempData({ ...tempData, [field]: user[field] || '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTempData({ ...tempData, [name]: value });
  };

  const handleSave = async (field) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please log in.');
        navigate('/login');
        return;
      }

      const response = await axios.put('http://localhost:5000/api/auth/profile', {
        [field]: tempData[field]
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
      localStorage.setItem('userData', JSON.stringify(response.data));
      setEditing({ ...editing, [field]: false });
      
      toast.success('Profile updated successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating profile', {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleSignOutPrompt = () => {
    setModalConfig({ actionType: 'signout', title: 'Confirm Sign Out' });
    setShowConfirmModal(true);
  };

const handleConfirmAction = () => {
  if (modalConfig.actionType === 'signout') {
    // Clear all auth data
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    localStorage.removeItem('isLoggedIn');
    sessionStorage.clear();
    
    // Force state update before navigation
    setTimeout(() => {
      navigate('/login', { replace: true });
    }, 0);
  }
  setShowConfirmModal(false);
};

  const handleCancelAction = () => {
    setShowConfirmModal(false);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/auth/upload-avatar', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setUser(response.data.user);
      localStorage.setItem('userData', JSON.stringify(response.data.user));
      toast.success('Avatar updated successfully!', {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error uploading avatar', {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleAvatarError = (e) => {
    console.error('Failed to load avatar image:', user.avatar);
    e.target.src = 'https://via.placeholder.com/40'; // Fallback image
  };

  if (isLoading) {
    return (
      <div className="profile-container">
        <div className="text-center">
          <span className="spinner-border spinner-border-lg" role="status" aria-hidden="true"></span>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card mb-4">
        <div className="profile-header">
          <div className="d-flex align-items-center">
            <div className="profile-avatar">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt="User Avatar" 
                  className="avatar-img" 
                  onError={handleAvatarError}
                />
              ) : (
                <UserIcon />
              )}
            </div>
            <h5 className="mb-0 fw-semibold">{user.name || 'User'}</h5>
          </div>
          <div className="avatar-upload">
            <input
              type="file"
              accept="image/*"
              id="avatarUpload"
              onChange={handleAvatarUpload}
              style={{ display: 'none' }}
            />
            <label htmlFor="avatarUpload" className="edit-avatar-btn">
              Change Avatar
            </label>
          </div>
        </div>
        <div className="profile-body">
          <div className="row">
            <div className="col-12">
              <div className="profile-info-item mb-4">
                <div className="d-flex align-items-center mb-2">
                  <MailIcon className="text-gold me-2" />
                  <h6 className="mb-0 fw-semibold">Email Address</h6>
                </div>
                <p className="text-muted mb-0 ps-4">{user.email || 'N/A'}</p>
                <p className="text-muted mb-0 ps-4 small">(Email cannot be changed)</p>
              </div>

              <div className="profile-info-item mb-4">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="d-flex align-items-center">
                    <UserIcon className="text-gold me-2" />
                    <h6 className="mb-0 fw-semibold">Full Name</h6>
                  </div>
                  {!editing.name ? (
                    <EditAddressButton onClick={() => handleEdit('name')} />
                  ) : (
                    <div className="d-flex gap-2">
                      <SaveAddressButton onClick={() => handleSave('name')} />
                      <CancelButton onClick={() => handleCancel('name')} />
                    </div>
                  )}
                </div>
                {!editing.name ? (
                  <p className="text-muted mb-0 ps-4">{user.name || 'N/A'}</p>
                ) : (
                  <div className="ps-4">
                    <input
                      type="text"
                      className="form-control rounded-3"
                      name="name"
                      value={tempData.name}
                      onChange={handleChange}
                    />
                  </div>
                )}
              </div>

              <div className="profile-info-item mb-4">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="d-flex align-items-center">
                    <PhoneIcon className="text-gold me-2" />
                    <h6 className="mb-0 fw-semibold">Phone Number</h6>
                  </div>
                  {!editing.phone ? (
                    <EditAddressButton onClick={() => handleEdit('phone')} />
                  ) : (
                    <div className="d-flex gap-2">
                      <SaveAddressButton onClick={() => handleSave('phone')} />
                      <CancelButton onClick={() => handleCancel('phone')} />
                    </div>
                  )}
                </div>
                {!editing.phone ? (
                  <p className="text-muted mb-0 ps-4">{user.phone || 'N/A'}</p>
                ) : (
                  <div className="ps-4">
                    <input
                      type="tel"
                      className="form-control rounded-3"
                      name="phone"
                      value={tempData.phone}
                      onChange={handleChange} 
                    />
                  </div>
                )}
              </div>

              <div className="profile-info-item mb-4">
                <div className="d-flex align-items-center mb-2"> 
                  <CalendarIcon className="text-gold me-2" />
                  <h6 className="mb-0 fw-semibold">Member Since</h6>
                </div>
                <p className="text-muted mb-0 ps-4">{user.joinDate || 'N/A'}</p> 
              </div>

              {user.type === 'admin' && (
                <div className="profile-info-item mb-4">
                  <div className="d-flex align-items-center mb-2">
                    <h6 className="mb-0 fw-semibold">Department</h6>
                  </div>
                  <p className="text-muted mb-0 ps-4">{user.department || 'N/A'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="settings-card mb-4">
        <div className="settings-body">
          <div className="d-flex align-items-center mb-3">
            <h5 className="mb-0 fw-semibold">Account Settings</h5>
          </div>
          <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
            <div>
              <p className="mb-0 fw-medium">Email Notifications</p>
              <p className="text-muted small mb-0">Receive order updates and promotions</p>
            </div>
            <div className="form-check form-switch">
              <input className="form-check-input" type="checkbox" id="emailNotifications" defaultChecked />
            </div>
          </div>
          <div className="d-flex justify-content-between align-items-center py-2">
            <div>
              <p className="mb-0 fw-medium">Newsletter Subscription</p>
              <p className="text-muted small mb-0">Stay updated with our latest products</p>
            </div>
            <div className="form-check form-switch">
              <input className="form-check-input" type="checkbox" id="newsletter" defaultChecked />
            </div>
          </div>
        </div>
      </div>

      <div className="text-end">
        <SignOutButton onClick={handleSignOutPrompt} />
      </div>

      <ConfirmationModal
        show={showConfirmModal}
        onClose={handleCancelAction}
        onConfirm={handleConfirmAction}
        title={modalConfig.title}
        actionType={modalConfig.actionType}
        confirmButtonText="Sign Out"
      />

      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <style jsx>{`
        .profile-container {
          font-family: 'Open Sans', sans-serif;
          padding: 0;
          max-width: 1200px;
          margin: 0 auto;
        }

        .profile-card, .settings-card {
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease;
        }

        .profile-card:hover, .settings-card:hover {
          transform: translateY(-5px);
        }

        .profile-header {
          padding: 1.5rem;
          background: linear-gradient(135deg, #D47A9D 0%, #BE6992 100%);
          border-radius: 12px 12px 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .profile-avatar {
          width: 60px;
          height: 60px;
          background: #ffffff;
          color: #BE6992;
          box-shadow: 0 2px 8px rgba(197, 164, 126, 0.3);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 1rem;
          overflow: hidden;
        }

        .avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .edit-avatar-btn {
          cursor: pointer;
          color: #ffffff;
          text-decoration: underline;
          font-size: 0.9rem;
        }

        .profile-body, .settings-body {
          padding: 1.5rem;
        }

        .text-gold {
          color: #BE6992 !important;
        }

        .form-control {
          font-size: 0.95rem;
          border-radius: 8px;
          border: 1px solid #ced4da;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }

        .form-control:focus {
          border-color: #BE6992;
          box-shadow: 0 0 8px rgba(197, 164, 126, 0.3);
          outline: none;
        }

        .form-check-input:checked {
          background-color: #BE6992;
          border-color: #BE6992;
        }

        .form-check-input:focus {
          box-shadow: 0 0 8px rgba(197, 164, 126, 0.3);
        }

        .toast-content {
          padding: 0.5rem;
        }

        @media (max-width: 768px) {
          .profile-body, .settings-body {
            padding: 1.25rem;
          }
        }

        @media (max-width: 576px) {
          .profile-avatar {
            width: 48px;
            height: 48px;
          }

          .profile-body, .settings-body {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Profile;