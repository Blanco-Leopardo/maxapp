import { useState, useEffect } from 'react';
// ИСПРАВЛЕНИЕ ОШИБКИ: Импортируем все как один объект, чтобы получить доступ к методам
import * as bridge from '@instant-messengers/vk-teams-bridge'; 
import './App.css'; // Импорт стилей

// Интерфейс для данных пользователя из SQL Server
interface UserData {
  FirstName: string;
  LastName: string;
  Phone: string;
}

function App() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // URL вашего бэкенда Node.js
  const API_URL = 'http://localhost:3000'; 

  useEffect(() => {
    setLoading(true);
    setError('');

    // Шаг 1: Получаем ID текущего пользователя из Max
    // ИСПРАВЛЕНИЕ ОШИБКИ: Используем приведение типа (bridge as any)
    (bridge as any).send('GetSelfId', {})
      .then((data: any) => {
        // ID пользователя Max — это либо email, либо уникальный ID
        const userId = data.email || data.id; 
        
        if (!userId) {
            setError('Не удалось получить ID пользователя Max.');
            setLoading(false);
            return;
        }

        // Шаг 2: Запрашиваем данные у НАШЕГО бэкенда (Node.js)
        fetch(`${API_URL}/get-user?userId=${userId}`)
          .then(res => {
              if (!res.ok) {
                  throw new Error(`Ошибка сети: ${res.status}`);
              }
              return res.json();
          })
          .then(result => {
            if (result.FirstName) {
              setUserData(result);
            } else {
              setError('Данные не найдены. Пожалуйста, пройдите опрос у бота.');
            }
            setLoading(false);
          })
          // ИСПРАВЛЕНИЕ ОШИБКИ 2: Добавлено : any для 'err'
          .catch((err: any) => {
            console.error('Fetch Error:', err);
            setError(`Ошибка подключения к серверу: ${err.message}`);
            setLoading(false);
          });
      })
      // ИСПРАВЛЕНИЕ ОШИБКИ 2: Добавлено : any для 'err'
      .catch((err: any) => {
        console.error('Bridge Error:', err);
        setError('Ошибка при взаимодействии с VK Teams Bridge.');
        setLoading(false);
      });
  }, []);

  return (
    <div className="app-container">
      <div className="data-card">
        <h1 className="card-header">Личные данные</h1>
        
        {loading && <p className="message-loading">Загрузка данных профиля...</p>}
        
        {error && <p className="message-error">Ошибка: {error}</p>}

        {userData && (
          <div>
            <div className="detail-row">
              <span className="label">Имя:</span> 
              <span>{userData.FirstName}</span>
            </div>
            <div className="detail-row">
              <span className="label">Фамилия:</span> 
              <span>{userData.LastName}</span>
            </div>
            <div className="detail-row">
              <span className="label">Телефон:</span> 
              <span>{userData.Phone}</span>
            </div>
          </div>
        )}
        
        {!loading && !userData && !error && (
           <p>Данные отсутствуют. Пожалуйста, используйте чат-бота для ввода информации.</p>
        )}
      </div>
    </div>
  );
}

export default App;