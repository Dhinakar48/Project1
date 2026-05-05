const { getAuthToken } = require('../utils/shiprocket');

async function test() {
    try {
        console.log('Using Email:', process.env.SHIPROCKET_EMAIL);
        console.log('Using Password:', process.env.SHIPROCKET_PASSWORD);
        const token = await getAuthToken();
        console.log('✅ Shiprocket Auth Success!');
        console.log('Token Length:', token.length);
        process.exit(0);
    } catch (error) {
        console.error('❌ Shiprocket Auth Failed:', error.message);
        process.exit(1);
    }
}

test();
