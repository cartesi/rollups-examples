-- Copyright 2022 Cartesi Pte. Ltd.
--
-- SPDX-License-Identifier: Apache-2.0
-- Licensed under the Apache License, Version 2.0 (the "License"); you may not use
-- this file except in compliance with the License. You may obtain a copy of the
-- License at http://www.apache.org/licenses/LICENSE-2.0
--
-- Unless required by applicable law or agreed to in writing, software distributed
-- under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
-- CONDITIONS OF ANY KIND, either express or implied. See the License for the
-- specific language governing permissions and limitations under the License.

local http = require("socket.http")
local ltn12 = require("ltn12")
local json = require("dkjson")

local rollup_server = assert(os.getenv("ROLLUP_HTTP_SERVER_URL"), "missing ROLLUP_HTTP_SERVER_URL")

local function info(...)
    print(string.format(...))
end

local function http_post(url, body)
    local request_body = json.encode(body)
    local response_body = {}
    local result, code = http.request {
        method = "POST",
        url = url,
        source = ltn12.source.string(request_body),
        headers = {
            ["Content-Type"] = "application/json",
            ["Content-Length"] = #request_body
        },
        sink = ltn12.sink.table(response_body)
    }
    if result == nil then error("HTTP POST Request to " .. url .. " failed. " .. code) end
    return code, table.concat(response_body)
end

local handlers = {}
function handlers.advance_state(data)
    info("Received advance request data %s", json.encode(data))
    info("Adding notice")
    local notice = {payload = data.payload}
    local code, response = http_post(rollup_server .. "/notice", notice)
    info("Received notice status %d body %s", code, response)
    return "accept"
end

function handlers.inspect_state(data)
    info("Received inspect request data %s", json.encode(data))
    info("Adding report")
    local report = {payload = data.payload}
    local code, response = http_post(rollup_server .. "/report", report)
    info("Received report status %d body %s", code, response)
    return "accept"
end

local mt = {__index = function(t, k) error("Invalid request type: " .. k) end}
setmetatable(handlers, mt)

local finish = {status = "accept"}
while true do
    info("Sending finish")
    local code, response = http_post(rollup_server .. "/finish", finish)
    info("Received finish status %d", code)
    if code == 202 then
        info("No pending rollup request, trying again")
    else
        local rollup_request = json.decode(response)
        
        finish.status = handlers[rollup_request.request_type](rollup_request.data)
        
    end
end
