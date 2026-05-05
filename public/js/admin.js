function openAddUserModal() {
  document.getElementById('addUserForm').reset();
  document.getElementById('credentials-display').classList.add('hidden');
  openModal('addUserModal');
}

function createUser(e) {
  e.preventDefault();
  var data = {
    fullName: document.getElementById('add-fullName').value,
    email: document.getElementById('add-email').value,
    roleId: document.getElementById('add-roleId').value
  };

  ajaxRequest('POST', '/admin/users', data, function(status, res) {
    if (res.success) {
      document.getElementById('cred-login').textContent = res.credentials.login;
      document.getElementById('cred-password').textContent = res.credentials.password;
      document.getElementById('credentials-display').classList.remove('hidden');
      showNotification(res.message, 'success');
    } else {
      showNotification(res.error, 'error');
    }
  });
}

function openEditUserModal(userId) {
  ajaxRequest('GET', '/admin/users/' + userId, null, function(status, res) {
    if (status === 200) {
      document.getElementById('edit-userId').value = res.ID_User;
      document.getElementById('edit-fullName').value = res.FullName;
      document.getElementById('edit-email').value = res.Email;
      openModal('editUserModal');
    } else {
      showNotification(res.error, 'error');
    }
  });
}

function updateUser(e) {
  e.preventDefault();
  var userId = document.getElementById('edit-userId').value;
  var data = {
    fullName: document.getElementById('edit-fullName').value,
    email: document.getElementById('edit-email').value
  };

  ajaxRequest('PUT', '/admin/users/' + userId, data, function(status, res) {
    if (res.success) {
      showNotification(res.message, 'success');
      closeModal('editUserModal');
      setTimeout(function() { location.reload(); }, 1000);
    } else {
      showNotification(res.error, 'error');
    }
  });
}

function deleteUser(userId) {
  document.getElementById('confirm-text').textContent = 'Вы уверены, что хотите удалить эту учётную запись?';
  document.getElementById('confirm-btn').onclick = function() {
    ajaxRequest('DELETE', '/admin/users/' + userId, null, function(status, res) {
      if (res.success) {
        showNotification(res.message, 'success');
        closeModal('confirmModal');
        var row = document.getElementById('user-row-' + userId);
        if (row) row.remove();
      } else {
        showNotification(res.error, 'error');
        closeModal('confirmModal');
      }
    });
  };
  openModal('confirmModal');
}

function changeRole(userId, roleId) {
  ajaxRequest('PUT', '/admin/users/' + userId + '/role', { roleId: roleId }, function(status, res) {
    if (res.success) {
      showNotification(res.message, 'success');
    } else {
      showNotification(res.error, 'error');
      location.reload();
    }
  });
}

function openPhotoModal(userId) {
  document.getElementById('photo-userId').value = userId;
  document.getElementById('photo-file').value = '';

  ajaxRequest('GET', '/admin/users/' + userId, null, function(status, res) {
    if (status === 200) {
      var preview = document.getElementById('photo-preview');
      var deleteBtn = document.getElementById('delete-photo-btn');
      if (res.Photo) {
        preview.innerHTML = '<img src="/uploads/' + res.Photo + '" alt="Фото" class="photo-preview-img">';
        deleteBtn.style.display = 'inline-block';
      } else {
        preview.innerHTML = '<div class="user-photo-placeholder-lg">' + res.FullName.charAt(0) + '</div>';
        deleteBtn.style.display = 'none';
      }
      openModal('photoModal');
    }
  });
}

function uploadPhoto(e) {
  e.preventDefault();
  var userId = document.getElementById('photo-userId').value;
  var formData = new FormData();
  var fileInput = document.getElementById('photo-file');

  if (!fileInput.files[0]) {
    showNotification('Выберите файл', 'error');
    return;
  }

  formData.append('photo', fileInput.files[0]);

  ajaxRequest('POST', '/admin/users/' + userId + '/photo', formData, function(status, res) {
    if (res.success) {
      showNotification(res.message, 'success');
      closeModal('photoModal');
      setTimeout(function() { location.reload(); }, 1000);
    } else {
      showNotification(res.error, 'error');
    }
  });
}

function deletePhoto() {
  var userId = document.getElementById('photo-userId').value;

  ajaxRequest('DELETE', '/admin/users/' + userId + '/photo', null, function(status, res) {
    if (res.success) {
      showNotification(res.message, 'success');
      closeModal('photoModal');
      setTimeout(function() { location.reload(); }, 1000);
    } else {
      showNotification(res.error, 'error');
    }
  });
}
