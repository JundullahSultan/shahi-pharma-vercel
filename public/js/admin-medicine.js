document.addEventListener('DOMContentLoaded', () => {
  // =========================================================
  // 1. CREATE MEDICINE LOGIC (With Progress Bar)
  // =========================================================
  const createMedicineForm = document.getElementById('createMedicineForm');
  const progressContainer = document.getElementById('uploadProgressContainer');
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');

  if (createMedicineForm) {
    createMedicineForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const btn = document.querySelector('.addBtn');
      const originalText = btn.innerText;
      const formData = new FormData(createMedicineForm);

      // 1. UI: Disable Button & Show Progress
      btn.disabled = true;
      btn.innerHTML = `<i class="ph ph-spinner ph-spin"></i> Uploading...`;
      btn.style.opacity = '0.7';

      if (progressContainer) {
        progressContainer.style.display = 'block';
        progressBar.style.width = '0%';
        progressText.innerText = '0%';
      }

      // 2. Use XMLHttpRequest for Upload Progress
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/admin/medicines', true);

      // TRACK UPLOAD PROGRESS
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round(
            (event.loaded / event.total) * 100,
          );

          if (progressBar) progressBar.style.width = percentComplete + '%';
          if (progressText) progressText.innerText = percentComplete + '%';
        }
      };

      // HANDLE SUCCESS / ERROR
      xhr.onload = () => {
        if (xhr.status === 201 || xhr.status === 200) {
          // Success Animation
          btn.innerHTML = `<i class="ph ph-check"></i> Done!`;
          btn.style.backgroundColor = 'var(--success)';

          if (progressText) progressText.innerText = 'Processing...';

          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          // Error Handling
          btn.disabled = false;
          btn.innerText = originalText;
          btn.style.opacity = '1';

          // Parse error message
          let errorMessage = 'Upload Failed';
          try {
            const response = JSON.parse(xhr.responseText);
            errorMessage = response.message || errorMessage;
          } catch (e) {}

          alert('Error: ' + errorMessage);
          if (progressContainer) progressContainer.style.display = 'none';
        }
      };

      xhr.onerror = () => {
        console.error('Network Error');
        alert('Network Error occurred.');
        btn.disabled = false;
        btn.innerText = originalText;
        if (progressContainer) progressContainer.style.display = 'none';
      };

      // SEND REQUEST
      xhr.send(formData);
    });
  }

  // =========================================================
  // 2. DELETE MEDICINE LOGIC
  // =========================================================
  const deleteModal = document.getElementById('deleteModal');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
  let deleteId = null; // Store ID to delete

  // A. Attach Click Event to all "Trash" icons
  document.querySelectorAll('.delete-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      deleteId = btn.dataset.id; // Get ID from the data-id attribute
      deleteModal.showModal(); // Open the dialog
    });
  });

  // B. Close Modal on Cancel
  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener('click', () => {
      deleteModal.close();
      deleteId = null;
    });
  }

  // C. Perform Delete on Confirm
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', async () => {
      if (!deleteId) return;

      try {
        const response = await fetch(`/admin/medicines/${deleteId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          // Remove the row from the table immediately
          const row = document.getElementById(`row-${deleteId}`);
          if (row) row.remove();
          deleteModal.close();
        } else {
          alert('Failed to delete medicine.');
        }
      } catch (err) {
        console.error('Error deleting:', err);
      }
    });
  }

  // =========================================================
  // 3. UPDATE MEDICINE LOGIC
  // =========================================================
  const editModal = document.getElementById('editModal');
  const editForm = document.getElementById('editMedicineForm');
  const closeEditBtn = document.getElementById('closeEditBtn');

  if (closeEditBtn) {
    closeEditBtn.addEventListener('click', (e) => {
      e.preventDefault();
      editModal.close();
    });
  }

  // Also allow clicking outside the box to close it (Optional but good UX)
  editModal.addEventListener('click', (e) => {
    if (e.target === editModal) {
      editModal.close();
    }
  });

  // A. Attach Click Event to all "Pencil" icons
  document.querySelectorAll('.edit-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      // Populate the form fields with data from the button's attributes
      document.getElementById('editId').value = btn.dataset.id;
      document.getElementById('editName').value = btn.dataset.name;
      document.getElementById('editCompany').value = btn.dataset.company;
      document.getElementById('editPrice').value = btn.dataset.price;
      document.getElementById('editStock').value = btn.dataset.stock;

      editModal.showModal();
    });
  });

  // B. Close Edit Modal
  if (editForm) {
    editForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // 1. Get the Button & Save Original Text
      const saveBtn = editForm.querySelector('button[type="submit"]');
      const originalText = saveBtn.innerHTML;

      // 2. Show Loading State
      saveBtn.disabled = true;
      saveBtn.innerHTML = `<i class="ph ph-spinner ph-spin"></i> Saving...`;
      saveBtn.style.opacity = '0.7';

      const id = document.getElementById('editId').value;
      const formData = new FormData(editForm); // Handles text AND file

      try {
        const response = await fetch(`/admin/medicines/${id}`, {
          method: 'PUT', // Using PUT for updates
          body: formData,
        });

        if (response.ok) {
          // Optional: Success Green State before reload
          saveBtn.innerHTML = `<i class="ph ph-check"></i> Saved!`;
          saveBtn.style.backgroundColor = 'var(--success)';

          // Wait half a second so user sees the "Saved!" message
          setTimeout(() => {
            window.location.reload();
          }, 500);
        } else {
          const error = await response.json();
          alert('Update failed: ' + (error.message || 'Unknown error'));
          throw new Error('Update failed'); // Triggers catch block to reset button
        }
      } catch (err) {
        console.error('Error updating:', err);

        // 3. Reset Button on Error
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalText;
        saveBtn.style.opacity = '1';
        saveBtn.style.backgroundColor = ''; // Reset color
      }
    });
  }
});
