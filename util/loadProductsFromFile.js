import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export async function loadProductsFromFile(filename) {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const filePath = path.join(__dirname, '..', 'public', filename);

    const fileContent = await fs.promises.readFile(filePath, 'utf-8');
    const lines = fileContent.trim().split('\n').slice(1);

    return lines.map(line => {
        let [name, price, quantity, promotion] = line.split(',');

        return {
            name,
            price: parseInt(price, 10),
            quantity: parseInt(quantity, 10),
            promotion
        };
    });
}
