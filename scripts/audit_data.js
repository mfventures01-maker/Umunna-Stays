
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, '../umunna_properties_20.json');

try {
    console.log(`Reading file: ${filePath}`);
    const rawData = fs.readFileSync(filePath, 'utf8');
    const properties = JSON.parse(rawData);

    if (!Array.isArray(properties)) {
        console.error('❌ Error: Root element is not an array.');
        process.exit(1);
    }

    console.log(`✅ File parsed. Found ${properties.length} properties.`);

    let errors = 0;
    const ids = new Set();

    properties.forEach((p, index) => {
        const context = `Index ${index} (ID: ${p.id || 'MISSING'})`;

        // Check ID uniqueness
        if (!p.id) {
            console.error(`❌ ${context}: Missing 'id'`);
            errors++;
        } else {
            if (ids.has(p.id)) {
                console.warn(`⚠️ ${context}: Duplicate ID found: ${p.id}`);
            }
            ids.add(p.id);
        }

        // Check required fields
        if (!p.name) { console.error(`❌ ${context}: Missing 'name'`); errors++; }
        if (!p.images || !Array.isArray(p.images) || p.images.length === 0) {
            console.warn(`⚠️ ${context}: No images or invalid images array`);
        }
    });

    if (errors === 0) {
        console.log('✅ Data integrity check passed. No critical errors found.');
    } else {
        console.error(`❌ Data integrity check failed with ${errors} critical errors.`);
        process.exit(1);
    }

} catch (err) {
    console.error('❌ An error occurred:', err.message);
    process.exit(1);
}
