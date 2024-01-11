const bwipjs = require('bwip-js');
const fs = require('fs');
const PNG = require('pngjs').PNG;

function generateQRCodeWithWhiteBackground(filename) {
    const vCardContent = 'BEGIN:VCARD\n' +
        'VERSION:3.0\n' +
        'N:Smith;John\n' +
        'TEL:+123456789\n' +
        'EMAIL:john@example.com\n' +
        'END:VCARD';

    const barcodeOptions = {
        bcid: 'qrcode',
        text: vCardContent,
        scale: 3,
        height: 10,
    };

    bwipjs.toBuffer(barcodeOptions, function (err, png) {
        if (err) {
            console.error(err);
        } else {
            const width = 300;
            const height = 300;
            const whiteBg = new PNG({ width, height, colorType: 6 });

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const idx = (width * y + x) << 2;
                    whiteBg.data[idx] = 255;
                    whiteBg.data[idx + 1] = 255;
                    whiteBg.data[idx + 2] = 255;
                    whiteBg.data[idx + 3] = 255;
                }
            }

            const qrCodeImage = PNG.sync.read(png);
            const startX = Math.floor((width - qrCodeImage.width) / 2);
            const startY = Math.floor((height - qrCodeImage.height) / 2);

            for (let y = 0; y < qrCodeImage.height; y++) {
                for (let x = 0; x < qrCodeImage.width; x++) {
                    const idx = (qrCodeImage.width * y + x) << 2;
                    const alpha = qrCodeImage.data[idx + 3];

                    if (alpha > 0) {
                        const bgIdx = ((startY + y) * width + (startX + x)) << 2;
                        whiteBg.data[bgIdx] = qrCodeImage.data[idx];
                        whiteBg.data[bgIdx + 1] = qrCodeImage.data[idx + 1];
                        whiteBg.data[bgIdx + 2] = qrCodeImage.data[idx + 2];
                        whiteBg.data[bgIdx + 3] = alpha;
                    }
                }
            }

            whiteBg.pack().pipe(fs.createWriteStream(filename));
            console.log(`QR code with vCard data and white background generated and saved as ${filename}`);
        }
    });
}

const outputFile = 'barcode.png';

generateQRCodeWithWhiteBackground(outputFile);