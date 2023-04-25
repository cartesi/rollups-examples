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

#include <stdio.h>
#include <iostream>

#include "3rdparty/cpp-httplib/httplib.h"
#include "3rdparty/picojson/picojson.h"

std::string handle_advance(httplib::Client &cli, picojson::value data) {
    std::cout << "Received advance request data " << data << std::endl;
    std::cout << "Adding notice" << std::endl;
    auto payload = data.get("payload").get<std::string>();
    auto notice = std::string("{\"payload\":\"") + payload + std::string("\"}");
    auto r = cli.Post("/notice", notice, "application/json");
    std::cout << "Received notice status " << r.value().status << " body " << r.value().body << std::endl;
    return "accept";
}

std::string handle_inspect(httplib::Client &cli, picojson::value data) {
    std::cout << "Received inspect request data " << data << std::endl;
    std::cout << "Adding report" << std::endl;
    auto payload = data.get("payload").get<std::string>();
    auto report = std::string("{\"payload\":\"") + payload + std::string("\"}");
    auto r = cli.Post("/report", report, "application/json");
    std::cout << "Received report status " << r.value().status << " body " << r.value().body << std::endl;
    return "accept";
}

int main(int argc, char** argv) {
    std::map<std::string, decltype(&handle_advance)> handlers = {
        {std::string("advance_state"), &handle_advance},
        {std::string("inspect_state"), &handle_inspect},
    };
    httplib::Client cli(getenv("ROLLUP_HTTP_SERVER_URL"));
    cli.set_read_timeout(20, 0);
    std::string status("accept");
    while (true) {
        std::cout << "Sending finish" << std::endl;
        auto finish = std::string("{\"status\":\"") + status + std::string("\"}");
        auto r = cli.Post("/finish", finish, "application/json");
        std::cout << "Received finish status " << r.value().status << std::endl;
        if (r.value().status == 202) {
            std::cout << "No pending rollup request, trying again" << std::endl;
        } else {
            picojson::value rollup_request;
            picojson::parse(rollup_request, r.value().body);

            auto request_type = rollup_request.get("request_type").get<std::string>();
            auto handler = handlers.find(request_type)->second;
            auto data = rollup_request.get("data");
            status = (*handler)(cli, data);
        }
    }
    return 0;
}
