import * as https from 'https';
import * as fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8');
const urlMatch = env.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

if (urlMatch && keyMatch) {
    const url = urlMatch[1].trim() + '/rest/v1/messages?select=*&limit=1';
    const key = keyMatch[1].trim();

    https.get(url, {
        headers: {
            'apikey': key,
            'Authorization': 'Bearer ' + key
        }
    }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => console.log('RESPONSE:', data));
    }).on('error', (e) => console.error(e));
}
