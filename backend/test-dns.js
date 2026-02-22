
const dns = require('dns');

const host = 'ecommern.mes87.mongodb.net';

console.log(`Resolving ${host}...`);

dns.resolveSrv(`_mongodb._tcp.${host}`, (err, addresses) => {
    if (err) {
        console.error('SRV Resolution failed:', err);
    } else {
        console.log('SRV Records:', JSON.stringify(addresses, null, 2));

        addresses.forEach(addr => {
            dns.lookup(addr.name, (err, address, family) => {
                if (err) {
                    console.error(`Lookup failed for ${addr.name}:`, err);
                } else {
                    console.log(`Lookup for ${addr.name}: ${address} (IPv${family})`);
                }
            });
        });
    }
});
