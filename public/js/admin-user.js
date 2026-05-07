// ===== 1. Searching user =====
const searchInput = document.getElementById('searchInput');
const tableRows = document.querySelectorAll('tbody tr');

searchInput.addEventListener('keyup', function (event) {
  const query = event.target.value.toLowerCase();

  tableRows.forEach((row) => {
    const rowText = row.innerHTML.toLowerCase();

    if (rowText.includes(query)) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
});

// ===== 1. Searching user =====
// Helper: Creates and displays a toast message
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');

  // Icon selection based on type
  const icon = type === 'success' ? 'ph-check-circle' : 'ph-warning-circle';

  toast.className = `toast ${type}`;
  toast.innerHTML = `
        <i class="ph ${icon}"></i>
        <span>${message}</span>
    `;

  container.appendChild(toast);

  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease-out forwards';
    toast.addEventListener('animationend', () => toast.remove());
  }, 3000);
}

// Helper: Custom Confirm Modal that returns a Promise
function confirmDelete() {
  return new Promise((resolve) => {
    const modal = document.getElementById('deleteModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const confirmBtn = document.getElementById('confirmDeleteBtn');

    // Bulletproof open for Android APKs
    modal.style.display = 'flex'; 

    // Handle interactions
    const close = (result) => {
      modal.style.display = 'none'; // Hide modal
      // Remove listeners to prevent memory leaks or double clicks
      cancelBtn.removeEventListener('click', handleCancel);
      confirmBtn.removeEventListener('click', handleConfirm);
      resolve(result);
    };

    const handleCancel = () => close(false);
    const handleConfirm = () => close(true);

    cancelBtn.addEventListener('click', handleCancel);
    confirmBtn.addEventListener('click', handleConfirm);
  });
}

// The Main Function
async function deleteUser(userId) {
  // 1. Wait for Custom Modal Confirmation
  const isConfirmed = await confirmDelete();
  if (!isConfirmed) return;

  try {
    const response = await fetch(`/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    const result = await response.json();

    if (response.ok) {
      // 2. Remove row from table smoothly
      const row = document.getElementById(`row-${userId}`); // Ensure your TR has this ID
      if (row) {
        row.style.opacity = '0'; // Fade out
        setTimeout(() => row.remove(), 300);
      }
      // 3. Show Beautiful Success Message
      showToast('User successfully deleted', 'success');
    } else {
      showToast(result.message || 'Failed to delete user', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    showToast('Network error occurred', 'error');
  }
}
