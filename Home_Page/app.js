// app.js

const express = require('express');
const session = require('express-session');
const app = express();
const port = 3000;

// Use session middleware
app.use(session({
    secret: 'your_secret_key',
    resave: true,
    saveUninitialized: true
}));

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// Route to check if a user is logged in
app.get('/checkLogin', (req, res) => {
    const loggedIn = !!req.session.user;
    res.json({ loggedIn, username: req.session.user });
});

// Route to handle logout
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

// Serve the home page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
