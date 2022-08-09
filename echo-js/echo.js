// Copyright 2022 Cartesi Pte. Ltd.
//
// SPDX-License-Identifier: Apache-2.0
// Licensed under the Apache License, Version 2.0 (the "License"); you may not use
// this file except in compliance with the License. You may obtain a copy of the
// License at http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software distributed
// under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
// CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.

const rollup_server = tjs.getenv("ROLLUP_HTTP_SERVER_URL");
console.log("HTTP rollup_server url is " + rollup_server);

async function handle_advance(data) {
    console.log("Received advance request data " + JSON.stringify(data));
    console.log("Adding notice");
    const advance_req = await fetch(rollup_server + '/notice', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ payload: data["payload"] })
    });
    const json = await advance_req.json();
    console.log("Received notice status " + advance_req.status + " body " + JSON.stringify(json));
    return "accept";
}

async function handle_inspect(data) {
    console.log("Received inspect request data " + JSON.stringify(data));
    console.log("Adding report");
    const inspect_req = await fetch(rollup_server + '/report', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ payload: data["payload"] })
    });
    console.log("Received report status " + inspect_req.status);
    return "accept";
}

var handlers = {
    advance_state: handle_advance,
    inspect_state: handle_inspect,
}

var finish = { status: "accept" };
var rollup_address = null;

(async () => {
    while (true) {
        console.log("Sending finish")
        const finish_req = await fetch(rollup_server + '/finish', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'accept' })
        });
        console.log("Received finish status " + finish_req.status);

        if (finish_req.status == 202) {
            console.log("No pending rollup request, trying again");
        } else {
            const rollup_req = await finish_req.json();
            const metadata = rollup_req["data"]["metadata"];
            if (metadata && metadata["epoch_index"] == 0 && metadata["input_index"] == 0) {
                rollup_address = metadata["msg_sender"];
                console.log("Captured rollup address: " + rollup_address);
            } else {
                var handler = handlers[rollup_req["request_type"]];
                finish["status"] = await handler(rollup_req["data"]);
            }
        }
    }
})();
