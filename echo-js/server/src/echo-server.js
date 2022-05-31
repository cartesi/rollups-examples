import fetch from './modules/fetch.js';
import {getenv} from 'std';

const ROLLUP_ADDRESS = getenv('ROLLUP_HTTP_SERVER_URL');

async function handle_advance(data) {
    console.log(`Received advance request data ${JSON.stringify(data)}`);
    console.log('Adding notice');
    const response = await fetch(`${ROLLUP_ADDRESS}/notice`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: {
            payload: data.payload,
        },
    });
    console.log(`Received notice status ${response.status} body ${JSON.stringify(response.json())}`);
    return 'accept';
}

async function handle_inspect(data) {
    console.log('Received inspect request data ', data);
    console.log('Adding report');
    const response = await fetch(`${ROLLUP_ADDRESS}/report`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: {
            payload: data.payload,
        },
    });
    console.log(`Received report status ${response.status}`);
    return 'accept';
}

async function send_finish() {
    let body = {status: 'accept'};
    while (true) {
        console.log('Sending finish');
        const response = await fetch(`${ROLLUP_ADDRESS}/finish`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body,
        });
        if (response.status === 202) {
            console.log('No pending rollup request, trying again');
        } else {
            let rollup_request = response.json();

            switch (rollup_request.request_type) {
                case 'advance_state':
                    body.status = await handle_advance(rollup_request.data);
                    break;
                case 'inspect_state':
                    body.status = await handle_inspect(rollup_request.data);
                    break;
            }
        }
    }
}

send_finish();
