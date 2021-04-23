const express = require('express')
const { nanoid } = require("nanoid");
const app = express()
const port = 4000
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const secret = 'Eric Steinke'

// mongoose.connect('mongodb://localhost:27017/test', {useNewUrlParser: true, useUnifiedTopology: true});

const db = {
    users: [
       { 
        username: "john",
        password: "1111",
        created: new Date(),
        id: nanoid(),
        token: '',
        todos: [
            { id: nanoid(), title: "Todo 1", completed: true },
        ]
    }
]
}
app.use(express.json())
app.use(morgan(':method :url :response-time'))

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested_With, Content-Type, Accept"
        )
        res.header(
            "Access-Control-Allow-Methods",
            "GET, POST, OPTIONS, PUT, PATCH, DELETE"
            )
            next();
        })
        
        app.get('/', (req, res) => {
            console.log("get recieved");
            res.send('Hello World!');
        });
        
        //Get all of the users
        app.get('/users', (req, res) => {
            res.status(200).json({
                status: "success",
                users: db.users
            });
        });
        
        //Get a specific user
        app.get('/user/:username', (req, res) => {
            
            oneUser = db.users.find((user) => user.username === req.params.username)
            if (!oneUser) {
                res.status(404).send("user id doesn't exist")
            }
            
            res.status(200).json({
                status: "success",
                user: oneUser
            })
        })
        
        //Post a todo to one user
        app.post('/user/:id', (req, res) => {
            const postUser = db.users.find((user) => user.id === req.params.id)
            if (!req.body.title || !postUser) {
                res.status(400).json({
                    status: "fail",
                    message: "the body can't be parsed"
                })
            }
            
            const newTodo = {
                id: nanoid(),
                title: req.body.title,
                completed: false
            }
            postUser.todos.push(newTodo)
            
            res.status(201).json({
                status: "success",
                todo: newTodo
            })
        })
        
        //Delete a todo
        app.delete("/user/:userId/todo/:todoId", (req, res) => {
            let user = db.users.find((u) => u.id === (req.params.userId)
            )
            
            let filteredTodos = user.todos.filter(todo => todo.id !== req.params.todoId)
            if(!filteredTodos || !user) {
                res.status(400).json({
                    status: "fail",
                    message: "todo or user id doesn't exist"
                })
            }
            user.todos = filteredTodos
            res.status(204).json(filteredTodos)
        })
        
        //Delete a user
        app.delete("/user/:userId", (req, res) => {
            let user = db.users.filter((u) => u.id !== req.params.userId)
            if(!user) {
                res.status(400).json({
                    status: "fail",
                    message: "user id doesn't exist"
                })
            }
            db.users = user
            res.status(204).json(user)
        })
        
        //Patch todo.completed
        app.patch("/user/:userId/todo/:todoId/completed", (req, res) => {
            let user = db.users.find((u) => u.id === (req.params.userId))
            let todo = user.todos.find((todo) => todo.id === (req.params.todoId))
            if(!user) {
                res.status(400).json({
                    status: "fail",
                    message: "user id or todo id doesn't exist"
                })
            }
            todo.completed = req.body.completed
            console.log(req.body.completed)
            res.status(201).json({
                status: "success",
                todo
                
            })
        })
        
        //patch a todo title
        app.patch("/user/:userId/todo/:todoId", (req, res) => {
            let user = db.users.find((u) => u.id === (req.params.userId))
            let todo = user.todos.find((todo) => todo.id === (req.params.todoId))
            if(!user) {
                res.status(400).json({
                    status: "fail",
                    message: "user id or todo id doesn't exist"
                })
            }
            todo.title = req.body.title
            console.log(req.body.title)
            res.status(201).json({
                status: "success",
                todo
                
            })
        })
        ////////////////////////////////////////////////////////////////////
        ////////////////////User Auth and User endpoints////////////////////
        ////////////////////////////////////////////////////////////////////
        
        //Login a User. Returns a token for the user. 
        app.post('/users/auth/login', (req, res) => {
            const {username, password} = req.body
            let loginUser = db.users.find((u) =>  u.username === username)
                
            if(!loginUser || !req.body) {
                res.status(400).json({
                    status: "fail",
                    message: "user id or todo id doesn't exist"
                })
            }
            if (loginUser.password === password) {
                const index = db.users.findIndex((u)=> {
                    return u.id === loginUser.id
                })
                const token = jwt.sign({ foo: 'bar' }, secret)
                db.users[index].token = token
                res.send(token)
            }
        })
        
        //registration
        app.post('/users', (req, res) => {
            // const postUser = db.users.find((user) => user.id === parseInt(req.params.id))
            if (!req.body.username || !req.body.password) {
                res.status(400).json({
                    status: "fail",
                    message: "the body can't be parsed"
                })
            }
            
            const newUser = {
                username: req.body.username,
                password: req.body.password,
                created: new Date(),
                id: nanoid(),
                token: "",
                todos: []
            }
            db.users.push(newUser)
            
            res.status(201).json({
                status: "success",
                 newUser
            })
        })
        
        app.listen(port, () => {
            console.log(`Example app listening at http://localhost:${port}`)
})