function toggleFavorite(docId, btn) {
  var isFav = btn.getAttribute('data-fav') === 'true';

  if (isFav) {
    ajaxRequest('DELETE', '/reader/favorites/' + docId, null, function(status, res) {
      if (res.success) {
        btn.setAttribute('data-fav', 'false');
        btn.classList.remove('active');
        btn.innerHTML = '&#9734; В избранное';
        showNotification(res.message, 'success');
      } else {
        showNotification(res.error, 'error');
      }
    });
  } else {
    ajaxRequest('POST', '/reader/favorites/' + docId, {}, function(status, res) {
      if (res.success) {
        btn.setAttribute('data-fav', 'true');
        btn.classList.add('active');
        btn.innerHTML = '&#9733; В избранном';
        showNotification(res.message, 'success');
      } else {
        showNotification(res.error, 'error');
      }
    });
  }
}

function removeFavoriteFromList(docId) {
  ajaxRequest('DELETE', '/reader/favorites/' + docId, null, function(status, res) {
    if (res.success) {
      var card = document.getElementById('fav-card-' + docId);
      if (card) card.remove();
      showNotification(res.message, 'success');

      var grid = document.querySelector('.documents-grid');
      if (grid && grid.children.length === 0) {
        grid.innerHTML = '<p class="empty-state">В вашем списке избранного пока нет документов.</p>';
      }
    } else {
      showNotification(res.error, 'error');
    }
  });
}
