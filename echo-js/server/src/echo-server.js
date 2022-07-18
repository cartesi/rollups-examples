import fetch from './modules/fetch.js';
import {getenv} from 'std';

const ROLLUP_ADDRESS = getenv('ROLLUP_HTTP_SERVER_URL');

async function handle_advance(data) {
    print(`Received advance request data ${JSON.stringify(data)}`);
    print('Adding notice');
    const response = await fetch(`${ROLLUP_ADDRESS}/notice`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: {
            payload: data.payload,
        },
    });
    print(`Received notice status ${response.status} body ${JSON.stringify(response.json())}`);
    return 'accept';
}

async function handle_inspect(data) {
    print('Received inspect request data ', data);
    print('Adding report');
    const response = await fetch(`${ROLLUP_ADDRESS}/report`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: {
            payload: data.payload,
        },
    });
    print(`Received report status ${response.status}`);
    return 'accept';
}

async function main() {
    print(`HTTP rollup_server url is ${ROLLUP_ADDRESS}`)
    let body = {
        status: 'accept'
    };
    while (true) {
        print('Sending finish');
        const response = await fetch(`${ROLLUP_ADDRESS}/finish`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body,
        });
        print(`Received finish status ${response.status}`);
        if (response.status === 202) {
            print('No pending rollup request, trying again');
        } else {
            let rollup_request = response.json();
            let metadata = rollup_request.data.metadata;

            if (metadata.epoch_index === 0 && metadata.input_index === 0) {
                let rollup_address = metadata.msg_sender;
                print(`Captured rollup address: ${rollup_address}`)
            } else {
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
}

main();


