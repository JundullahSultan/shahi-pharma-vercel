document.addEventListener('DOMContentLoaded', () => {
  // 1. Select all status buttons
  const statusButtons = document.querySelectorAll('.status-btn');

  statusButtons.forEach((btn) => {
    btn.addEventListener('click', async function () {
      const orderId = this.dataset.id;
      const newStatus = this.dataset.status;

      // Visual feedback: Disable buttons to prevent double-clicks
      const actionDiv = document.getElementById(`actions-${orderId}`);
      actionDiv.style.opacity = '0.5';
      actionDiv.style.pointerEvents = 'none';

      try {
        // 2. Send Request to Backend
        const response = await fetch(`/admin/orders/${orderId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        });

        const result = await response.json();

        if (response.ok) {
          // 3. Success! Update UI
          updateRowUI(orderId, newStatus);
          showToast(`Order ${newStatus} successfully!`, 'success');
        } else {
          // Re-enable buttons if failed
          actionDiv.style.opacity = '1';
          actionDiv.style.pointerEvents = 'auto';
          showToast(result.message || 'Update failed', 'error');
        }
      } catch (error) {
        console.error('Error:', error);
        actionDiv.style.opacity = '1';
        actionDiv.style.pointerEvents = 'auto';
        showToast('Network error occurred', 'error');
      }
    });
  });
});

// Helper: Update the Table Row visually without reloading
function updateRowUI(orderId, status) {
  // 1. Find the row
  const actionDiv = document.getElementById(`actions-${orderId}`);
  const row = actionDiv.closest('tr');

  // 2. Find the Badge and update it
  const badge = row.querySelector('.badge');
  badge.className = `badge ${status}`; // e.g., "badge approved"
  badge.innerText = status;

  // 3. Replace Buttons with "View Details" (since it's no longer pending)
  // OR just remove the buttons.
  actionDiv.parentElement.innerHTML =
    '<button class="btn-text">View Details</button>';
}

// Helper: Toast Notification
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');

  // Icon selection
  const icon = type === 'success' ? 'ph-check-circle' : 'ph-warning-circle';

  toast.className = `toast ${type}`;
  toast.innerHTML = `
        <i class="ph ${icon}"></i>
        <span>${message}</span>
    `;

  container.appendChild(toast);

  // Trigger Animation
  setTimeout(() => (toast.style.opacity = '1'), 10);

  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
