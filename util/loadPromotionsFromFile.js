import fs from 'fs';
import path from 'path';

export async function loadPromotionsFromFile(filePath) {
    const fileContent = await fs.promises.readFile(path.resolve('public', filePath), 'utf-8');
    const lines = fileContent.trim().split('\n').slice(1);

    return lines.map(line => {
        const [name, buy, get, startDate, endDate] = line.split(',');

        return { name, buy: +buy, get: +get, startDate: new Date(startDate), endDate: new Date(endDate) };
    })
}