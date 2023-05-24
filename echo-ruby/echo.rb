# Copyright 2022 Cartesi Pte. Ltd.
#
# SPDX-License-Identifier: Apache-2.0
# Licensed under the Apache License, Version 2.0 (the "License"); you may not use
# this file except in compliance with the License. You may obtain a copy of the
# License at http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software distributed
# under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
# CONDITIONS OF ANY KIND, either express or implied. See the License for the
# specific language governing permissions and limitations under the License.

require 'json'
require 'http'

def log(message)
  puts message
end

def handle_advance(data)
  log("Received advance request data #{data}")
  payload = data['payload']
  log("Adding notice \"#{payload}\"")
  response = HTTP.post(ROLLUP_SERVER + '/notice', {
    headers: {
      'Content-Type': 'application/json'
    },
    json: { payload: payload }
  })
  log("Received notice status #{response.status} with body #{response}")
  return "accept";
end

def handle_inspect(data)
  log("Received inspect request data #{data}");
  payload = data['payload']
  log("Adding report \"#{payload}\"")
  response = HTTP.post(ROLLUP_SERVER + '/report', {
    headers: {
      'Content-Type': 'application/json'
    },
    json: { payload: payload }
  })
  log("Received report status #{response.status}")
  return "accept"
end

ROLLUP_SERVER = ENV.fetch('ROLLUP_HTTP_SERVER_URL', 'http://127.0.0.1:5004')
log("HTTP rollup_server url is #{ROLLUP_SERVER}")

finish = { status: "accept" }

while (true) do
  log("Sending finish")

  response = HTTP.post(ROLLUP_SERVER + '/finish', {
    headers: {
      'Content-Type': 'application/json'
    },
    json: { status: 'accept' }
  });

  log("Received finish status #{response.status}")

  if response.status == 202
    log("No pending rollup request, trying again")
  else
    rollup_req = response.parse
    metadata = rollup_req['data']['metadata']
    if (metadata && metadata['epoch_index'] == 0 && metadata['input_index'] == 0)
      rollup_address = metadata['msg_sender'];
      log("Captured rollup address: #{rollup_address}")
    else
      case rollup_req['request_type']
      when 'advance_state'
        finish[:status] = handle_advance(rollup_req['data'])
      when 'inspect_state'
        finish[:status] = handle_inspect(rollup_req['data'])
      end
    end
  end
end