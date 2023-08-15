const { randomUUID } = require('crypto');
const express = require('express');
const path = require('path');
const app = express();

const port = process.env.PORT || 5000;

app.use(express.static(path.join(__dirname, 'client')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const messages = [];
const responseObjs = new Set();

const sendClientEvent = (eventName, data) => {
  if (responseObjs.size > 0) {
    for (let client of responseObjs) {
      client.write(
        `event: ${eventName}\ndata: ${JSON.stringify(
          data
        )}\nid: ${randomUUID()}\n\n`
      );
    }
  }
};

app.get('/messages-stream', (req, res) => {
  responseObjs.add(res);

  console.log('Active Clients count: ' + responseObjs.size);

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  res.addListener('close', () => {
    console.log('CONNECTION CLOSED');
    responseObjs.delete(res);

    console.log('Active Clients count: ' + responseObjs.size);
  });
});

app.get('/messages', (req, res) => {
  res.status(200).json({ messages });
});

app.post('/message', (req, res) => {
  const { message } = req.body;
  const newMessage = { id: randomUUID(), message };

  sendClientEvent('new-message', newMessage);

  messages.push(newMessage);

  res.status(201).json({ newMessage });
});

app.delete('/message', (req, res) => {
  const { id } = req.body;

  sendClientEvent('delete-message', { id });

  res.status(200).json({ id });
});

app.listen(port, () => console.log(`Server started on port ${port}`));
