// app.js

const express = require('express');
const sql = require('mssql');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const port = 3000;

// SQL Server Configuration
const config = {
    user: 'Swaroop76',
    password: 'C@nfidential',
    server: 'complaint.database.windows.net',
    database: 'User_Credentials',
    options: {
        encrypt: true, // Use this if you're on Windows Azure
    },
};

// Use session middleware
app.use(session({
    secret: 'your_secret_key',
    resave: true,
    saveUninitialized: true
}));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Route to handle login form submissions
app.post('/auth', async (req, res) => {
    try {
        const { usernameOrEmail, password } = req.body;

        await sql.connect(config);

        // Check if the username or email and password match a record in the database
        const result = await sql.query`SELECT * FROM User_Creds WHERE (username = ${usernameOrEmail} OR email = ${usernameOrEmail}) AND password = ${password}`;

        if (result.recordset.length > 0) {
            // Set the username in the session
            req.session.user = result.recordset[0].username;

            // Redirect to the homepage
            res.redirect('D:/College work/Hackathon/Home_Page/public/index.html');
        } else {
            // Invalid credentials
            res.status(401).send('Invalid credentials');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    } finally {
        sql.close();
    }
});

// Serve the login HTML page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/login.html');
});

// Serve the homepage
app.get('/homepage', (req, res) => {
    if (!req.session.user) {
        // If user is not logged in, redirect to login page
        res.redirect('/');
        return;
    }

    // Render the homepage with the logged-in username
    res.send(`<h1>Welcome to the Homepage, ${req.session.user}!</h1>`);
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
