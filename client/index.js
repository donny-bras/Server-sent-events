const evtSource = new EventSource('/messages-stream');

// Close previously open connection on window refresh
window.addEventListener('beforeunload', () => {
  evtSource.close();
});

evtSource.onopen = e => {
  console.log('Connection Open');
};

evtSource.onerror = err => {
  console.error('EventSource failed:', err);
};

evtSource.addEventListener('new-message', event => {
  const newElement = document.createElement('li');
  const eventList = document.getElementById('list');

  const data = JSON.parse(event.data);

  newElement.dataset['id'] = data.id;
  newElement.textContent = `message: ${event.data}`;

  eventList.appendChild(newElement);
});

evtSource.addEventListener('delete-message', event => {
  const { id } = JSON.parse(event.data);

  document.querySelector(`[data-id="${id}"]`)?.remove();
});

document.getElementById('list')?.addEventListener('click', e => {
  const messageId = e.target.dataset['id'];

  fetch('/message', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: messageId,
    }),
  });
});

document.getElementById('message-form')?.addEventListener('submit', e => {
  e.preventDefault();

  const text = e.target.elements['message-input'].value;

  fetch('message', {
    method: 'POST',
    body: JSON.stringify({ message: text }),
    headers: {
      'content-type': 'application/json',
    },
  });
});
