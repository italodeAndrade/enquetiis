const express = require('express');
const path = require('path');
const db = require('./conn')
const app = express();
const PORT = "3000";

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});


app.listen(PORT, () => {
    console.log(`rodando: http://localhost:${PORT}`);
});