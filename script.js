// Global configuration
const API_BASE = '/api';

// Utility functions
function showMessage(message, type = 'info', elementId = 'message') {
    const messageEl = document.getElementById(elementId);
    if (messageEl) {
        messageEl.textContent = message;
        messageEl.className = `message ${type}`;
        messageEl.style.display = 'block';
        
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 5000);
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

// Authentication functions
document.addEventListener('DOMContentLoaded', function() {
    // Login form handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleLogin();
        });
    }

    // Register form handler
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleRegister();
        });
    }

    // Upload form handler
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleFileUpload();
        });
    }

    // Dashboard initialization
    if (window.location.pathname === '/dashboard') {
        initializeDashboard();
    }
});

async function handleLogin() {
    const formData = new FormData(document.getElementById('loginForm'));
    const data = {
        username: formData.get('username'),
        password: formData.get('password')
    };

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            showMessage('Login successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1000);
        } else {
            showMessage(result.error, 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('An error occurred. Please try again.', 'error');
    }
}

async function handleRegister() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        showMessage('Passwords do not match!', 'error');
        return;
    }

    const formData = new FormData(document.getElementById('registerForm'));
    const data = {
        username: formData.get('username'),
        password: formData.get('password')
    };

    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            showMessage('Registration successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1000);
        } else {
            showMessage(result.error, 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showMessage('An error occurred. Please try again.', 'error');
    }
}

async function logout() {
    try {
        const response = await fetch(`${API_BASE}/auth/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();
        if (result.success) {
            window.location.href = '/';
        }
    } catch (error) {
        console.error('Logout error:', error);
        showMessage('Logout failed. Please try again.', 'error');
    }
}

async function initializeDashboard() {
    try {
        // Check if user is authenticated
        const response = await fetch(`${API_BASE}/auth/me`);
        if (!response.ok) {
            window.location.href = '/login';
            return;
        }

        const userData = await response.json();
        document.getElementById('usernameDisplay').textContent = userData.user.username;

        // Load user files
        await loadUserFiles();
    } catch (error) {
        console.error('Dashboard initialization error:', error);
        window.location.href = '/login';
    }
}

async function loadUserFiles() {
    try {
        const response = await fetch(`${API_BASE}/files/my-files`);
        
        if (!response.ok) {
            throw new Error('Failed to load files');
        }

        const result = await response.json();
        displayFiles(result.files);
    } catch (error) {
        console.error('Load files error:', error);
        document.getElementById('filesList').innerHTML = 
            '<div class="message error">Failed to load files. Please try again.</div>';
    }
}

function displayFiles(files) {
    const filesList = document.getElementById('filesList');
    
    if (!files || files.length === 0) {
        filesList.innerHTML = `
            <div class="no-files">
                <p>No files uploaded yet.</p>
                <p>Upload your first file using the form above!</p>
            </div>
        `;
        return;
    }

    filesList.innerHTML = files.map(file => `
        <div class="file-card">
            <div class="file-name">${file.originalName}</div>
            <div class="file-info">
                <div>Size: ${formatFileSize(file.size)}</div>
                <div>Uploaded: ${formatDate(file.uploadedAt)}</div>
                <div>Type: ${file.mimetype}</div>
            </div>
            <div class="file-actions">
                <button onclick="downloadFile('${file._id}')" class="btn btn-primary">Download</button>
                <button onclick="deleteFile('${file._id}')" class="btn btn-secondary">Delete</button>
            </div>
        </div>
    `).join('');
}

async function handleFileUpload() {
    const fileInput = document.getElementById('fileInput');
    const files = fileInput.files;

    if (files.length === 0) {
        showMessage('Please select at least one file to upload.', 'error', 'uploadMessage');
        return;
    }

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append('file', files[i]);
    }

    try {
        const response = await fetch(`${API_BASE}/files/upload`, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            showMessage('File uploaded successfully!', 'success', 'uploadMessage');
            fileInput.value = ''; // Clear file input
            await loadUserFiles(); // Refresh files list
        } else {
            showMessage(result.error, 'error', 'uploadMessage');
        }
    } catch (error) {
        console.error('File upload error:', error);
        showMessage('File upload failed. Please try again.', 'error', 'uploadMessage');
    }
}

async function downloadFile(fileId) {
    // In a real implementation, this would download the file
    showMessage('Download functionality would be implemented here', 'info');
}

async function deleteFile(fileId) {
    if (!confirm('Are you sure you want to delete this file?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/files/${fileId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            showMessage('File deleted successfully!', 'success');
            await loadUserFiles(); // Refresh files list
        } else {
            showMessage(result.error, 'error');
        }
    } catch (error) {
        console.error('Delete file error:', error);
        showMessage('Failed to delete file. Please try again.', 'error');
    }
}