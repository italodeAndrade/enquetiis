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

app.get('/load_enquetes', (req, res) => {
    const query = 'SELECT id, titulo, descricao, data_init,data_term FROM enquete';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Erro na consulta de dados dados:', err);
            res.status(500).send('Erro ao buscar dados');
        } else {
            res.json(results); 
        }
    });
});