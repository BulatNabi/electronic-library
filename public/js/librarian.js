// Librarian documents JS

function openAddDocModal() {
  document.getElementById('addDocForm').reset();
  openModal('addDocModal');
}

function uploadDocument(e) {
  e.preventDefault();
  var form = document.getElementById('addDocForm');
  var formData = new FormData(form);

  ajaxRequest('POST', '/librarian/documents', formData, function(status, res) {
    if (res.success) {
      showNotification(res.message, 'success');
      closeModal('addDocModal');
      setTimeout(function() { location.reload(); }, 1000);
    } else {
      showNotification(res.error, 'error');
    }
  });
}

function openEditDocModal(docId) {
  ajaxRequest('GET', '/librarian/documents/' + docId, null, function(status, res) {
    if (status === 200) {
      document.getElementById('edit-docId').value = res.ID_Document;
      document.getElementById('edit-title').value = res.Title;
      document.getElementById('edit-author').value = res.Author;
      document.getElementById('edit-year').value = res.Year;
      document.getElementById('edit-annotation').value = res.Annotation;
      document.getElementById('edit-categoryId').value = res.ID_Category;
      openModal('editDocModal');
    } else {
      showNotification(res.error, 'error');
    }
  });
}

function updateDocument(e) {
  e.preventDefault();
  var docId = document.getElementById('edit-docId').value;
  var data = {
    title: document.getElementById('edit-title').value,
    author: document.getElementById('edit-author').value,
    year: document.getElementById('edit-year').value,
    annotation: document.getElementById('edit-annotation').value,
    categoryId: document.getElementById('edit-categoryId').value
  };

  ajaxRequest('PUT', '/librarian/documents/' + docId, data, function(status, res) {
    if (res.success) {
      showNotification(res.message, 'success');
      closeModal('editDocModal');
      setTimeout(function() { location.reload(); }, 1000);
    } else {
      showNotification(res.error, 'error');
    }
  });
}

function deleteDocument(docId) {
  document.getElementById('confirm-text').textContent = 'Вы уверены, что хотите удалить этот документ?';
  document.getElementById('confirm-btn').onclick = function() {
    ajaxRequest('DELETE', '/librarian/documents/' + docId, null, function(status, res) {
      if (res.success) {
        showNotification(res.message, 'success');
        closeModal('confirmModal');
        var row = document.getElementById('doc-row-' + docId);
        if (row) row.remove();
      } else {
        showNotification(res.error, 'error');
        closeModal('confirmModal');
      }
    });
  };
  openModal('confirmModal');
}
