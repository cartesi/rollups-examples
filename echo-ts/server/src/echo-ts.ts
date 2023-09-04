import fetch from './modules/fetch.js';
import { getenv } from 'std';
import {
    Advance,
    IndexResponse,
    Inspect,
    Metadata,
    RollupRequest,
    RollupRequestRequestTypeEnum
} from './interfaces/rollup-api.interface.js';
import { FetchInterface } from './interfaces/fetch.interface.js';

const ROLLUP_ADDRESS = getenv('ROLLUP_HTTP_SERVER_URL');

async function handle_advance(data: Advance) {
    console.log(`Received advance request data ${JSON.stringify(data)}`);
    console.log('Adding notice');

    const response: FetchInterface<IndexResponse> = await fetch(`${ROLLUP_ADDRESS}/notice`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: {
            payload: data.payload,
        },
    });

    console.log(`Received notice status ${response.status} body ${JSON.stringify(response.json())}`);

    return 'accept';
}

async function handle_inspect(data: Inspect) {
    console.log('Received inspect request data ', JSON.stringify(data));
    console.log('Adding report');

    const response: FetchInterface<null> = await fetch(`${ROLLUP_ADDRESS}/report`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: {
            payload: data.payload,
        },
    });

    console.log(`Received report status ${response.status}`);

    return 'accept';
}

async function main() {
    console.log(`HTTP rollup_server url is ${ROLLUP_ADDRESS}`);

    let body = {
        status: 'accept'
    };

    while (true) {
        console.log('Sending finish');

        const response: FetchInterface<RollupRequest> = await fetch(`${ROLLUP_ADDRESS}/finish`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body,
        });

        console.log(`Received finish status ${response.status}`);

        if (response.status === 202) {
            console.log('No pending rollup request, trying again');
            continue;
        }

        const rollup_request = response.json();
        let metadata: Metadata|null = null;

        if ("metadata" in rollup_request.data) {
            metadata = rollup_request.data.metadata;
        }

        if (metadata?.epoch_index === 0 && metadata?.input_index === 0) {
            console.log(`Captured rollup address: ${metadata?.msg_sender}`)
            continue;
        }

        switch (rollup_request.request_type) {
            case RollupRequestRequestTypeEnum.AdvanceState:
                body.status = await handle_advance(rollup_request.data as Advance);
                break;
            case RollupRequestRequestTypeEnum.InspectState:
                body.status = await handle_inspect(rollup_request.data as Inspect);
                break;
        }
    }
}

main();


