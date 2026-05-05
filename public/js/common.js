function showNotification(message, type) {
  var el = document.getElementById('notification');
  var textEl = document.getElementById('notification-text');
  if (!el || !textEl) return;

  textEl.textContent = message;
  el.className = 'notification ' + (type || 'success');

  setTimeout(function() {
    el.className = 'notification hidden';
  }, 4000);
}

function hideNotification() {
  var el = document.getElementById('notification');
  if (el) el.className = 'notification hidden';
}

function openModal(id) {
  document.getElementById(id).classList.remove('hidden');
}

function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}

function ajaxRequest(method, url, data, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open(method, url, true);

  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      var response;
      try {
        response = JSON.parse(xhr.responseText);
      } catch (e) {
        response = { error: 'Ошибка сервера' };
      }
      callback(xhr.status, response);
    }
  };

  if (data instanceof FormData) {
    xhr.send(data);
  } else if (data) {
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(data));
  } else {
    xhr.send();
  }
}
