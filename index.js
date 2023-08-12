(async () => {
    const Canvas = require('canvas');
    const fs = require('fs');
    const crypto = require('crypto');
    const encrypt = (text, key, iv) => {
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        let encrypted = cipher.update(text, 'utf8', 'base64');
        encrypted += cipher.final('base64');
        return encrypted;
    }
    const decrypt = (text, key, iv) => {
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(text, 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    const profiles = {
        settings: {
            width: 64,
            height: 64
        }
    }
    const charSet = "UTF-8"

    const readImg = async (base64) => {
        return new Promise((resolve, reject) => {
            const img = new Canvas.Image();
            img.onload = () => {
                const canvas = Canvas.createCanvas(img.width, img.height);
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, img.width, img.height);
                const data = imageData.data;
                const binaryMap = [];
                for (var i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    if (r === 255 && g === 0 && b === 0) {
                        break;
                    }
                    binaryMap.push(r === 0 ? 0 : 1);
                }
                resolve({
                    width: img.width,
                    height: img.height,
                    data: binaryMap.join('').match(/.{1,8}/g).map((binary) => String.fromCharCode(parseInt(binary, 2))).join('')
                });
            }
            img.onerror = (err) => {
                reject(err);
            }
            img.src = base64;
        })
    }

    const generateImg = async (text, width, height) => {
        return new Promise(async (resolve, reject) => {
            const textBinaryMap = text.split('').map((char) => char.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
            const textPixelMapArrays = textBinaryMap.split(' ').map((binary) => binary.split('').map((bit) => bit === '0' ? 0 : 255))
            const textPixelMap = textPixelMapArrays.flat();
            const canvas = Canvas.createCanvas(width, height);
            const ctx = canvas.getContext('2d');
            var row = 0;
            var col = 0;
            console.log(`Vytvářím obrázek ${width}x${height}...`);
            for (var i = 0; i < textPixelMap.length; i++) {
                if (col >= width) {
                    col = 0;
                    row++;
                }
                ctx.fillStyle = `rgb(${textPixelMap[i]}, ${textPixelMap[i]}, ${textPixelMap[i]})`;
                ctx.fillRect(col, row, 1, 1);
                col++;
                if (i === textPixelMap.length - 1) {
                    // mark end
                    ctx.fillStyle = `rgb(255, 0, 0)`;
                    ctx.fillRect(col, row, 1, 1);
                    const imageDataBase64 = canvas.toDataURL('image/png');
                    const imageData = imageDataBase64.replace(/^data:image\/\w+;base64,/, "");
                    console.log("Ověřuji integritu dat...");
                    fs.writeFileSync('test.png', imageData, 'base64');
                    const imageVerify = await readImg(imageDataBase64);
                    if (imageVerify.width !== width || imageVerify.height !== height || imageVerify.data !== text) {
                        reject(new Error("Integrita dat se nepodařila ověřit!", imageVerify));
                    }
                    console.log("Integrita dat ověřena!");
                    resolve(imageData);

                }
            }
        })
    }
    const ask = (question) => {
        return new Promise((resolve, reject) => {
            const rl = require('readline').createInterface({
                input: process.stdin,
                output: process.stdout
            });
            rl.question(question, (answer) => {
                rl.close();
                resolve(answer);
            });
        })
    }
    var key = crypto.randomBytes(32);
    var iv = crypto.randomBytes(16);
    console.log("Vítej v programu pro vytváření šifrovaných zpráv v obrázcích!");
    console.log("Tento program je zatím ve vývoji, takže může obsahovat chyby.");
    console.log("Pokud narazíš na nějakou chybu, dej mi vědět na Discordu (misaliba).");
    const main = async () => {
        console.log()
        console.log("Chceš načíst nebo vytvořit obrázek? (load/create)");
        var action = await ask("Akce: ");
        console.log()
        action = action.toLowerCase();
        if (action === 'create') {
            const textAsk = await ask("Text: ");
            console.log()
            var text = textAsk;
            const encrypted = await ask("Zašifrovat? (y/n): ");
            console.log()
            if (encrypted === 'y') {
                text = encrypt(text, key, iv);
            }
            const minimumExpected = text.length * 8;
            const width = Math.ceil(Math.sqrt(minimumExpected + 1));
            const height = Math.ceil(minimumExpected / width);
            console.log(`Minimální očekávané rozměry: ${width}x${height} | ${minimumExpected} bitů (${text.length} znaků)`);
            console.log()
            const settingsText = `${encrypted === 'y' ? '1' : '0'}|${key.toString('base64')}|${iv.toString('base64')}`
            const settingsMinimumExpected = settingsText.length * 8;
            const settingsWidth = Math.ceil(Math.sqrt(settingsMinimumExpected + 1));
            const settingsHeight = Math.ceil(settingsMinimumExpected / settingsWidth);
            const settingsImage = await generateImg(settingsText, settingsWidth, settingsHeight).catch((err) => {
                console.error("Nepodařilo se vytvořit obrázek s nastavením!");
                console.error(err);
                return main();
            });
            if (!settingsImage) {return;}
            fs.writeFileSync('./tajné šifrovací informace.png', settingsImage, 'base64');
            const dataImage = await generateImg(text, width, height).catch((err) => {
                console.error("Nepodařilo se vytvořit obrázek s daty!");
                console.error(err);
                return main();
            });
            if (!dataImage) {return;}
            fs.writeFileSync('./Zpráva.png', dataImage, 'base64');
            main();
        } else if (action === 'load') {
            var settingsImage = await ask("Cesta k obrázku s nastavením (Enter pro výchozí): ");
            if (settingsImage === '') settingsImage = './tajné šifrovací informace.png';
            const settings = await readImg(settingsImage).catch((err) => {
                console.error("Nepodařilo se načíst obrázek s nastavením!");
                console.error(err);
                return main();
            });
            if (!settings) {return;}
            var dataImage = await ask("Cesta k obrázku s daty (Enter pro výchozí): ");
            if (dataImage === '') dataImage = './Zpráva.png';
            const data = await readImg(dataImage).catch((err) => {
                console.error("Nepodařilo se načíst obrázek s daty!");
                console.error(err);
                return main();
            });
            if (!data) {return;}
            const settingsText = settings.data;
            const settingsTextSplitted = settingsText.split('|');
            const encrypted = settingsTextSplitted[0] === '1';
            const key = Buffer.from(settingsTextSplitted[1], 'base64');
            const iv = Buffer.from(settingsTextSplitted[2], 'base64');
            var text = data.data;
            if (encrypted) {
                text = decrypt(text, key, iv);
            }
            console.log(text);
            main();
        } else {
            console.log("Neplatná akce!");
            main();
        }
    }
    main();
})();