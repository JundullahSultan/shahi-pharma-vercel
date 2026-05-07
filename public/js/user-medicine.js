document.addEventListener('DOMContentLoaded', () => {
  // 1. Select ALL forms, not just one ID
  const orderForms = document.querySelectorAll('.order-form');
  const toast = document.getElementById('toast-notification');

  const showToast = (message, isError = false) => {
    toast.textContent = message;
    if (isError) {
      toast.classList.add('error');
      toast.style.backgroundColor = '#ef4444';
    } else {
      toast.classList.remove('error');
      toast.style.backgroundColor = 'var(--success)';
    }
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  };

  // 2. Loop through every form found on the page
  orderForms.forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Use 'form' (the specific form clicked), not a global variable
      const btn = form.querySelector('button[type="submit"]');

      btn.disabled = true;
      const originalBtnText = btn.innerText;
      btn.innerText = 'Processing...';

      // 3. Create FormData from the SPECIFIC form that was submitted
      const formData = new FormData(form);
      const plainFormData = Object.fromEntries(formData.entries());

      try {
        const response = await fetch('/user/dashboard', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(plainFormData),
        });

        if (response.ok) {
          form.reset(); // Reset only this form
          showToast('Order Placed Successfully!');
        } else {
          // Careful: use .json() if your backend sends json, or .text() if string
          const errorData = await response.json();
          showToast(`Failed: ${errorData.message || 'Error'}`, true);
        }
      } catch (error) {
        console.log('Network error:', error);
        showToast('Network error occurred', true);
      } finally {
        btn.disabled = false;
        btn.innerText = originalBtnText;
      }
    });
  });
});
