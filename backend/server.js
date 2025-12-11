const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

// НАСТРОЙКИ ВАШЕГО SQL SERVER
const dbConfig = {
    user: 'sa', // Ваше имя пользователя SQL (часто sa)
    password: 'supforquapor009', // ВАШ ПАРОЛЬ ОТ SQL SERVER
    server: 'localhost', // Или имя вашего компьютера
    database: 'MaxMiniAppDB',
    options: {
        encrypt: false, // Для локального сервера обычно false
        trustServerCertificate: true
    }
};

// Подключение к БД
sql.connect(dbConfig).then(() => console.log('Connected to SQL Server')).catch(err => console.error('SQL Error:', err));

// 1. ЭНДПОИНТ ДЛЯ БОТА (Сохранение данных)
app.post('/save-user', async (req, res) => {
    const { userId, firstName, lastName, phone } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        // Проверяем, есть ли такой юзер. Если есть - обновляем, нет - создаем.
        const check = await pool.request().input('uid', sql.NVarChar, userId).query('SELECT * FROM UserData WHERE UserId = @uid');
        
        if (check.recordset.length > 0) {
            await pool.request()
                .input('uid', sql.NVarChar, userId)
                .input('fn', sql.NVarChar, firstName)
                .input('ln', sql.NVarChar, lastName)
                .input('ph', sql.NVarChar, phone)
                .query('UPDATE UserData SET FirstName = @fn, LastName = @ln, Phone = @ph WHERE UserId = @uid');
        } else {
            await pool.request()
                .input('uid', sql.NVarChar, userId)
                .input('fn', sql.NVarChar, firstName)
                .input('ln', sql.NVarChar, lastName)
                .input('ph', sql.NVarChar, phone)
                .query('INSERT INTO UserData (UserId, FirstName, LastName, Phone) VALUES (@uid, @fn, @ln, @ph)');
        }
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

// 2. ЭНДПОИНТ ДЛЯ МИНИ-АППА (Получение данных)
app.get('/get-user', async (req, res) => {
    const userId = req.query.userId;
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().input('uid', sql.NVarChar, userId).query('SELECT * FROM UserData WHERE UserId = @uid');
        res.json(result.recordset[0] || {});
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.listen(3000, () => console.log('Backend running on port 3000'));