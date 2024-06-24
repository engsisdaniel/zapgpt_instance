import Axios from 'axios';

const path = require('node:path');
const FormData = require('form-data');
const { spawn } = require('node:child_process');

require('dotenv').config()

const ls = spawn(process.execPath, ['dist/index.cjs'], {
    cwd: path.resolve(__dirname, '..'),
    stdio: ["inherit", "pipe", "pipe"]
}).on('error', (error) => {
    // console.log(error);
});

ls.stdout.on('data', async (output) => {
    const form = new FormData();
    form.append('output', output);

    const requestConfig = {
        headers: {
            ...form.getHeaders()
        }
    };

    try {
        const response = await Axios.post(`${process.env.CONNECT_URL}/api/setlog/${process.env.LIGHTSAIL_ID}`, form, requestConfig);
        console.log(`DATA:`);
        console.log(response.data);
    } catch (error) {
        console.log(`ERROR: ${error.message}`);
    }
});

ls.on('close', (code) => {
    // console.log(`child process exited with code ${code}`);
}); 