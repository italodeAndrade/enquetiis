const express = require('express');
const path = require('path');
const db = require('./conn')
const app = express();
const PORT = "3000";


app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});
app.use(express.json());
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

app.post('/inserir', (req,res)=>{
    const {titulo , descricao, dt_init, dt_term} = req.body;
    const query= " insert into enquete (titulo, descricao, data_init, data_term) values (?,?,?,?)"
    db.query(query,[titulo,descricao,dt_init,dt_term], (err, results) => {
        if (err) {
            console.error('Erro na adição dados:', err);
            res.status(500).send('Erro ao adicionar dados');
        } else {
            res.json(results); 
        }
    });
})

app.delete('/deletar/:id', (req,res)=>{
    const id_enquete = req.params.id
    const query = "delete from enquete where id = ? "
    db.query(query, [id_enquete], (err,result)=>{
        if (err){
            console.error('Erro na exclusão da enquete:', err);
            res.status(500).send('Erro ao excluir enquete');
        }
        else{
            console.log(`enquete com id ${id_enquete} excluida`)
            res.json({ message: `Enquete com ID ${id_enquete} excluída` });
        }
    })
})

app.post('/editar/:id',(req,res) =>{
const id_enquete= req.params.id
const {titulo , descricao, dt_init, dt_term}= req.body;
const query=`update enquete set titulo = '${titulo}' , descricao='${descricao}', data_init= '${dt_init}',data_term = '${dt_term}' where id = ${id_enquete}`
db.query(query,[titulo,descricao,dt_init,dt_term], (err, results) => {
    if (err) {
        console.error('Erro na modificação de dados:', err);
        res.status(500).send('Erro ao modificar dados');
    } else {
        res.json(results); 
    }
});
})