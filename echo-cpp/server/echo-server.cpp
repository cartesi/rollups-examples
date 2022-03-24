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

int main(int argc, char** argv) {
    std::cout << "Echo server started" << std::endl;
    int dapp_port = atoi(getenv("DAPP_PORT"));
    httplib::Server svr;

    svr.Post("/advance", [&](const httplib::Request & req, httplib::Response &res) {
        std::cout << "Received advance request body:" << req.body << std::endl;
        std::cout << "Adding notice" << std::endl;
        picojson::value json;
        picojson::parse(json, req.body);
        auto payload = json.get("payload").get<std::string>();        
        httplib::Client cli(getenv("HTTP_DISPATCHER_URL"));
        auto r = cli.Post("/notice", std::string("{\"payload\":\"") + payload + std::string("\"}"), "application/json");        
        std::cout << "Received notice status " << r.value().status << " body " << r.value().body << std::endl;
        std::cout << "Finishing" << std::endl;
        r = cli.Post("/finish", "{\"status\":\"accept\"}", "application/json");        
        std::cout << "Received finish status " << r.value().status << std::endl;
        res.set_content("", "application/json");
        res.status = 202;        
    });

    svr.Get(R"(/inspect/(.+))", [&](const httplib::Request& req, httplib::Response& res) {
        auto payload = req.matches[1];
        std::cout << "Received inspect request payload " << payload << std::endl;
        auto json_response = std::string("{\"reports\": [{\"payload\": \"") + std::string(payload) + std::string("\"}]}");
        res.set_content(json_response, "application/json");
        res.status = 200;
    });

    std::cout << "Echo server is listening on port " << dapp_port  << std::endl;
    svr.listen("0.0.0.0", dapp_port);
    return 0;
}
