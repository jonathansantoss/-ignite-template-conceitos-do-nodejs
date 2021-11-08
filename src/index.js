const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const username = request.headers.username;
  const id = request.params.id;

  const user = users.find((user) => user.username === username);
  
  if (id) {
    const isHasTodo = user.todos.some((todo) => todo.id === id);

    if (!isHasTodo) {
      return response.status(404).json({error: 'User not found'});
    }
  }

  return next();
}

app.post('/users', (request, response) => {
  const id = uuidv4();
  const user = request.body;
  const username = user.username;

  const isHasUserName = users.some((user) => user.username === username);

  if (isHasUserName) {
    return response.status(400).json({error: 'User is exists'})
  } else {
    users.push({id, ...user, todos: []})
    return response.status(201).json({id: id, ...user, todos: []});
  }
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const userName = request.headers.username;

  const user = users.find((user) => user.username == userName);

  return response.status(200).json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const userName = request.headers.username;
  const {deadline, created_at, ...rest} = request.body;

  const user = users.find((user) => user.username == userName);
  const id = uuidv4();

  user.todos.push({
    id,
    ...rest,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()});

  return response.status(201).json(...user.todos);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const userName = request.headers.username;
  const id = request.params.id;

  const user = users.find((user) => user.username == userName);
  const todo = user.todos.find((todo) => todo.id === id);

  todo.title = request.body.title;
  todo.deadline = new Date(request.body.deadline);

  return response.status(200).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const userName = request.headers.username;
  const id = request.params.id;

  const user = users.find((user) => user.username == userName);
  const todo = user.todos.find((todo) => todo.id === id);

  todo.done = true;

  return response.status(200).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const userName = request.headers.username;
  const id = request.params.id;

  const user = users.find((user) => user.username == userName);

  user.todos.pop((todo) => todo.id === id);

  return response.status(204).send();
});

module.exports = app;