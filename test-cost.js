const sheetId = '1u__xYWoWZpmrnquc-Fpk19WtpcrckxSd0-_G35NWxXQ';
const urls = [
    'https://docs.google.com/spreadsheets/d/' + sheetId + '/gviz/tq?tqx=out:csv&sheet=Bookings',
    'https://docs.google.com/spreadsheets/d/' + sheetId + '/gviz/tq?tqx=out:csv&sheet=data',
    'https://docs.google.com/spreadsheets/d/' + sheetId + '/gviz/tq?tqx=out:csv&sheet=Car_model',
    'https://docs.google.com/spreadsheets/d/' + sheetId + '/gviz/tq?tqx=out:csv&sheet=Detail_Installer',
    'https://docs.google.com/spreadsheets/d/' + sheetId + '/gviz/tq?tqx=out:csv&sheet=' + encodeURIComponent('ต้นทุนฟิล์ม')
];
const Papa = require('./node_modules/papaparse');
const dc = require('./temp-dc2.js');

async function test() {
    const fetchCsv = url => new Promise((resolve) => {
        require('https').get(url, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(Papa.parse(data, {header:true, skipEmptyLines:true}).data));
        }).on('error', () => resolve([]));
    });
    
    console.log('Fetching...');
    const [bookings, data, carModels, installers, filmCosts] = await Promise.all(urls.map(fetchCsv));
    
    const mistakeBookings = bookings.filter(b => (b['Pro_ID'] || b['โปรโมชั่น'] || '').toLowerCase().includes('mistake'));
    console.log('Mistake bookings:', mistakeBookings.length);
    
    let filmCostMap = {};
    filmCosts.forEach(row => {
        const vals = Object.values(row);
        if (vals.length >= 2) {
            const film = vals[0];
            const costText = String(vals[1]).replace(/[^\d.-]/g, '');
            const cost = parseFloat(costText);
            if (film && cost > 0) {
                filmCostMap[String(film).replace(/[\s._\-–—/\\]+/g, '').toLowerCase()] = cost;
            }
        }
    });
    
    const rows = dc.buildDamageRows(mistakeBookings, data, installers, [], carModels);
    console.log('Damage rows:', rows.length);
    
    let totalCost = 0;
    rows.forEach(r => {
        const costKey = String(r.film).replace(/[\s._\-–—/\\]+/g, '').toLowerCase();
        const cost = filmCostMap[costKey] || 0;
        const val = cost * (r.sqf || 0);
        totalCost += val;
        console.log(`Film: ${r.film}, Sqf: ${r.sqf}, Cost/Sqf: ${cost}, Value: ${val}`);
    });
    console.log('Total:', totalCost);
}
test();
