/**
 * FetchToCurl Strongly inspired by https://github.com/leoek/fetch-to-curl
 */

import * as std from "std";

function generateMethod(options) {
    const method = options.method;
    if (!method) return '';
    const type = {
        GET: ' -X "GET"',
        POST: ' -X "POST"',
        PUT: ' -X "PUT"',
        PATCH: ' -X "PATCH"',
        DELETE: ' -X "DELETE"',
        HEAD: ' -X "HEAD"',
        OPTIONS: ' -X "OPTIONS"'
    };
    return type[method.toUpperCase()] || '';
}

function isInstanceOfHeaders(val) {
    if (typeof Headers !== "function") {
        /**
         * Environment does not support the Headers constructor
         * old internet explorer?
         */
        return false;
    }
    return val instanceof Headers;
}

function getHeaderString(name, val) {
    return ` -H "${name}: ${`${val}`.replace(/(\\|")/g, '\\$1')}"`;
}

function generateHeader(options = {}) {
    const {headers} = options;
    let isEncode = false;
    let headerParam = '';
    if (isInstanceOfHeaders(headers)) {
        headers.forEach((val, name) => {
            if (name.toLocaleLowerCase() !== 'content-length') {
                headerParam += getHeaderString(name, val);
            }
            if (name.toLocaleLowerCase() === 'accept-encoding') {
                isEncode = true;
            }
        })
    } else if (headers) {
        Object.keys(headers).map(name => {
            if (name.toLocaleLowerCase() !== 'content-length') {
                headerParam += getHeaderString(name, headers[name]);
            }
            if (name.toLocaleLowerCase() === 'accept-encoding') {
                isEncode = true;
            }
        });
    }
    return {
        params: headerParam,
        isEncode,
    };
}

function generateBody(body) {
    if (!body) return '';
    if (typeof body === "object") {
        return ` -d '${JSON.stringify(body)}'`;
    }
    return ` -d '${body}'`;
}

function generateCompress(isEncode) {
    return isEncode ? ' --compressed' : '';
}

function fetchToCurl(requestInfo, requestInit) {
    let url, options;
    /**
     * initialization with an empty object is done here to
     * keep everything backwards compatible to 0.4.0 and below
     */
    if (typeof requestInfo === "string" || requestInfo instanceof URL) {
        url = requestInfo;
        options = requestInit || {};
    } else {
        url = (requestInfo || {}).url
        options = requestInfo || {}
    }
    const {body} = options;
    const headers = generateHeader(options);
    return `curl -s --connect-timeout 99999 -w '%{json}' '${url}'${generateMethod(options)}${headers.params || ''}${generateBody(body)}${generateCompress(headers.isEncode)}`;
}

/**
 * @template T
 * @param resource {string}
 * @param options {{
 *     method: 'GET'|'POST'|'PUT'|'PATCH'|'DELETE'|'HEAD'|'OPTIONS',
 *     headers: {[key: string]: string},
 *     body: object|null
 * }}
 * @returns {Promise<FetchInterface>}
 */
export default (resource, options) => {
    // curl command
    let curlCmd = fetchToCurl(resource, options);
    // exec curl command in subprocess
    let spErr = {};
    let curlOutputFile = std.popen(curlCmd, 'r', spErr);
    let curlOutput = curlOutputFile.readAsString();
    curlOutputFile.close();

    if (curlOutput.indexOf('}{') > -1) {
        curlOutput = curlOutput.replace('}{', '},{');
    }

    if (curlOutput.indexOf('[]') === 0) {
        curlOutput = '{},' + curlOutput.substring(2);
    }

    if (curlOutput.indexOf(']{') > -1) {
        curlOutput = curlOutput.replace(']{', '],{');
    }

    if (curlOutput.charAt(0) !== '{' && curlOutput.charAt(0) !== '[') {
        curlOutput = '{},' + curlOutput.substring(curlOutput.indexOf("{"));
    }

    let data, meta;

    [
        data,
        meta,
    ] = JSON.parse(`[${curlOutput}]`);

    const responseUrl = resource;
    let responseStatus = meta.http_code;
    let responseOk = responseStatus >= 200 && responseStatus < 300;

    return new Promise((resolve, reject) => {
        const response = { // TODO fill properties (https://developer.mozilla.org/en-US/docs/Web/API/Response)
            headers: {}, // TODO
            ok: responseOk,
            url: responseUrl,
            status: responseStatus,
            type: 'json',
            text: () => JSON.stringify(data),
            json: () => data,
        };

        if (responseOk) {
            resolve(response);
        } else {
            reject(response);
        }
    });
};
