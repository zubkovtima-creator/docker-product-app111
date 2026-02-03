const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

pool.connect((err, client, release) => {
    if (err) {
        console.error('Ошибка подключения к PostgreSQL:', err);
    } else {
        console.log('Успешное подключение к PostgreSQL!');
        release();
    }
});

app.get('/api/products', async (req, res) => {
    try {
        console.log('Получение всех продуктов...');
        const result = await pool.query('SELECT * FROM products ORDER BY id');
        res.json(result.rows);
    } catch (err) {
        console.error('Ошибка:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Продукт не найден' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const { name, price } = req.body;
        if (!name || price === undefined) {
            return res.status(400).json({ error: 'Имя и цена обязательны' });
        }
        const result = await pool.query(
            'INSERT INTO products (name, price) VALUES ($1, $2) RETURNING *',
            [name, parseFloat(price)]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/products/:id', async (req, res) => {
    try {
        const { name, price } = req.body;
        const result = await pool.query(
            'UPDATE products SET name = $1, price = $2 WHERE id = $3 RETURNING *',
            [name, parseFloat(price), req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Продукт не найден' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Продукт не найден' });
        }
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Сервер работает' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
    console.log(`📡 API доступно по адресу: http://localhost:${PORT}/api/products`);
});