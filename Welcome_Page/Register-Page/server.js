const express = require('express');
const sql = require('mssql');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// SQL Server Configuration
const config = {
    user: 'swaroop76',
    password: 'C@nfidential',
    server: 'complaint.database.windows.net',
    database: 'User_Credentials',
    options: {
        encrypt: true, // Use this if you're on Windows Azure
    },
};

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Route to handle form submissions
app.post('/submit', async (req, res) => {
    try {
        const { name, username, email, password } = req.body;

        await sql.connect(config);

        const result = await sql.query`INSERT INTO User_Creds (name,username,email,password) VALUES (${name},${username},${email},${password})`;

        console.log('Rows affected:', result.rowsAffected);

        res.send('Data submitted successfully!');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    } finally {
        sql.close();
    }
});

// Route to check if a username exists
app.get('/check-username/:username', async (req, res) => {
    try {
        const usernameToCheck = req.params.username;

        await sql.connect(config);

        const result = await sql.query`SELECT COUNT(*) as count FROM User_Creds WHERE username = ${usernameToCheck}`;

        const usernameExists = result.recordset[0].count > 0;

        res.json({ usernameExists });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        sql.close();
    }
});

// Serve HTML form
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/register.html');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
