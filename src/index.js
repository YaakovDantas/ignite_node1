const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;
  const user = users.find(u => u.username === username);

  if (user) {
    request.user = user;
    return next();
  }

  return response.status(404).json({error : 'Not Found'});

}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const user_exists = users.find(u => u.username === username);

  if (user_exists) {
    return response.status(400).json({error : 'Username already has been taken'});
  }

  const user = {
    id: uuidv4(),
    name, 
    username,
    todos: []
  }

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  
  if (!user) {
    return response.status(404).json({error : 'Not Found'});
  }

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {title, deadline} = request.body;

  const todo = {
    id: uuidv4(),
    title, 
    deadline: new Date(deadline),
    created_at: new Date(),
    done: false
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;
  const {title, deadline} = request.body;

  const todoIndex = user.todos.findIndex(todo => todo.id === id);

  if (todoIndex < 0) {
    return response.status(404).json({error : 'Not Found'});
  }

  const todo = user.todos[todoIndex];

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.status(202).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;
  
  const todoIndex = user.todos.findIndex(todo => todo.id === id);

  if (todoIndex < 0) {
    return response.status(404).json({error : 'Not Found'});
  }

  const todo = user.todos[todoIndex];

  todo.done = true;

  return response.status(202).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;
  
  const todoIndex = user.todos.findIndex(todo => todo.id === id);

  if (todoIndex < 0) {
    return response.status(404).json({error : 'Not Found'});
  }

  const todo = user.todos[todoIndex];

  user.todos.splice(todo, 1);

  return response.status(204).json(user.todos);
});

module.exports = app;