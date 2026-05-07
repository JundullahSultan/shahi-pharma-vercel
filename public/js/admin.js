document.addEventListener('DOMContentLoaded', () => {
  // 1. Handle User Creation
  const createUserForm = document.getElementById('createUserForm');

  createUserForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // In a real app, you would fetch() data to your backend here
    const formData = new FormData(createUserForm);
    const data = Object.fromEntries(formData.entries());
    // const role = formData.get('role');

    try {
      const response = await fetch('/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Important! Telling server it's JSON
        },
        body: JSON.stringify(data), // Convert object to JSON string
      });

      // 4. Handle the response
      if (response.ok) {
        // Simulating success
        const btn = createUserForm.querySelector('button');
        const originalText = btn.innerText;

        btn.innerText = 'User Created!';
        btn.style.backgroundColor = 'var(--success)';

        setTimeout(() => {
          btn.innerText = originalText;
          btn.style.backgroundColor = 'var(--primary)';
          createUserForm.reset();
        }, 2000);

        // Redirect via JS if needed
      } else {
        const errorText = await response.text();
        alert('Failed: ' + errorText);
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  });

  // 2. Handle Table Quick Actions (Approve/Cancel)
  const actionButtons = document.querySelectorAll('.btn-icon');

  actionButtons.forEach((btn) => {
    btn.addEventListener('click', function () {
      const row = this.closest('tr');
      const statusBadge = row.querySelector('.badge');
      const actionCell = row.querySelector('td:last-child');

      if (this.classList.contains('approve')) {
        // Update UI to Approved
        statusBadge.className = 'badge approved';
        statusBadge.innerText = 'approved';
        actionCell.innerHTML = '<span class="text-muted">-</span>';

        // TODO: Send API request to backend: POST /admin/order/approve
      } else if (this.classList.contains('cancel')) {
        // Update UI to Cancelled
        statusBadge.className = 'badge cancelled';
        statusBadge.innerText = 'cancelled';
        actionCell.innerHTML = '<span class="text-muted">-</span>';

        // TODO: Send API request to backend: POST /admin/order/cancel
      }
    });
  });
});
