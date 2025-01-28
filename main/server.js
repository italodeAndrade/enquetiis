    const express = require('express');
    const path = require('path');
    const db = require('./conn');  
    const app = express();
    const PORT = 3000;


    const WebSocket = require('ws');
    const server = require('http').createServer(app);
    const wss = new WebSocket.Server({ server });

    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.json());


    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'home.html'));
    });


    function add_topic(id_enquete, topicos, res) {
        for (const topico of topicos) {
            const query = 'INSERT INTO opcoes (id_enq, op, votos) VALUES (?, ?, 0)';
            db.query(query, [id_enquete, topico], (err, result) => {
                if (err) {
                    console.error('Erro ao adicionar tópicos:', err);
                    return res.status(500).send('Erro ao adicionar tópicos');
                }
            });
        }
    }


    app.get('/load_topicos/:id_enquete', (req, res) => {
        const id_enquete = req.params.id_enquete;

        const query = 'SELECT id, op, votos FROM opcoes WHERE id_enq = ?';
        db.query(query, [id_enquete], (err, results) => {
            if (err) {
                console.error('Erro ao carregar tópicos:', err);
                return res.status(500).send('Erro ao carregar tópicos');
            }
            res.json(results);
        });
    });


    app.get("/votar/:id", (req, res) => {
        const id = req.params.id;
        const query = `UPDATE opcoes SET votos = votos + 1 WHERE id = ?`;
        
        db.query(query, [id], (err, results) => {
            if (err) {
                console.error("Erro ao votar:", err);
                return res.status(500).send('Erro ao votar.');
            }
            
         
            const selectQuery = `SELECT id, id_enq, op, votos FROM opcoes WHERE id = ?`;
            db.query(selectQuery, [id], (err, result) => {
                if (err) {
                    console.error("Erro ao carregar votos atualizados:", err);
                    return;
                }

                const atualizado = result[0];
                broadcast(JSON.stringify({ type: 'voteUpdate', data: atualizado }));
            });

            res.json({ message: "Voto computado com sucesso!" });
        });
    });


    app.get('/load_enquetes', (req, res) => {
        const query = 'SELECT id, titulo, descricao, data_init, data_term FROM enquete';
        db.query(query, (err, results) => {
            if (err) {
                console.error('Erro ao buscar enquetes:', err);
                return res.status(500).send('Erro ao buscar enquetes');
            }

            const enquetesFormatadas = results.map(enquete => ({
                id: enquete.id,
                titulo: enquete.titulo,
                descricao: enquete.descricao,
                data_init: new Date(enquete.data_init).toLocaleString('pt-BR', {
                    year: 'numeric', month: '2-digit', day: '2-digit',
                    hour: '2-digit', minute: '2-digit', second: '2-digit'
                }),
                data_term: new Date(enquete.data_term).toLocaleString('pt-BR', {
                    year: 'numeric', month: '2-digit', day: '2-digit',
                    hour: '2-digit', minute: '2-digit', second: '2-digit'
                })
            }));

            res.json(enquetesFormatadas);
        });
    });


    app.post('/inserir', (req, res) => {
        const { titulo, descricao, dt_init, dt_term, topicos } = req.body;


        const query = 'INSERT INTO enquete (titulo, descricao, data_init, data_term) VALUES (?, ?, ?, ?)';
        db.query(query, [titulo, descricao, dt_init, dt_term], (err, result) => {
            if (err) {
                console.error('Erro ao adicionar enquete:', err);
                return res.status(500).send('Erro ao adicionar enquete');
            }

            const id_enquete = result.insertId;  

           
            add_topic(id_enquete, topicos, res);

            res.json({ message: 'Enquete e tópicos adicionados' });
        });
    });


    app.delete('/deletar/:id', (req, res) => {
        const id_enquete = req.params.id;
        const query = 'DELETE FROM enquete WHERE id = ?';

        db.query(query, [id_enquete], (err, result) => {
            if (err) {
                console.error('Erro ao deletar enquete:', err);
                return res.status(500).send('Erro ao deletar enquete');
            }
            res.json({ message: `Enquete com ID ${id_enquete} excluída` });
        });
    });



app.put('/editar/:id', (req, res) => {
    const id_enquete = req.params.id;
    const { titulo, descricao } = req.body;

    const query = 'UPDATE enquete SET titulo = ?, descricao = ? WHERE id = ?';
    
    db.query(query, [titulo, descricao, id_enquete], (err, result) => {
        res.json({ message: 'Enquete editada' });
    });
});



    function broadcast(data) {
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    }


    server.listen(PORT, () => {
        console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
