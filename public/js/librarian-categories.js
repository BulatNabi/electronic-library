// Librarian categories JS

function openAddCategoryModal() {
  document.getElementById('addCategoryForm').reset();
  openModal('addCategoryModal');
}

function createCategory(e) {
  e.preventDefault();
  var name = document.getElementById('add-cat-name').value;

  ajaxRequest('POST', '/librarian/categories', { name: name }, function(status, res) {
    if (res.success) {
      showNotification(res.message, 'success');
      closeModal('addCategoryModal');
      setTimeout(function() { location.reload(); }, 1000);
    } else {
      showNotification(res.error, 'error');
    }
  });
}

function openEditCategoryModal(catId, name) {
  document.getElementById('edit-catId').value = catId;
  document.getElementById('edit-cat-name').value = name;
  openModal('editCategoryModal');
}

function updateCategory(e) {
  e.preventDefault();
  var catId = document.getElementById('edit-catId').value;
  var name = document.getElementById('edit-cat-name').value;

  ajaxRequest('PUT', '/librarian/categories/' + catId, { name: name }, function(status, res) {
    if (res.success) {
      showNotification(res.message, 'success');
      closeModal('editCategoryModal');
      setTimeout(function() { location.reload(); }, 1000);
    } else {
      showNotification(res.error, 'error');
    }
  });
}

function deleteCategory(catId, docCount) {
  var msg = 'Вы уверены, что хотите удалить эту категорию?';
  if (docCount > 0) {
    msg = 'Категория используется документами (' + docCount + '). Удалить? Документы будут перемещены в "Без категории".';
  }

  document.getElementById('confirm-text').textContent = msg;
  document.getElementById('confirm-btn').onclick = function() {
    ajaxRequest('DELETE', '/librarian/categories/' + catId, null, function(status, res) {
      if (res.success) {
        showNotification(res.message, 'success');
        closeModal('confirmModal');
        var row = document.getElementById('cat-row-' + catId);
        if (row) row.remove();
      } else {
        showNotification(res.error, 'error');
        closeModal('confirmModal');
      }
    });
  };
  openModal('confirmModal');
}
