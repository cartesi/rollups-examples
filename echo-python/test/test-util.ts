import * as protoLoader from "@grpc/proto-loader";
import * as grpc from "@grpc/grpc-js";
import { ServiceError } from "@grpc/grpc-js";
import http from "http";
import { ProtoGrpcType } from "./generated-src/proto/server-manager";
import { ServerManagerClient } from "./generated-src/proto/CartesiServerManager/ServerManager";
import { GetEpochStatusRequest } from "./generated-src/proto/CartesiServerManager/GetEpochStatusRequest";
import { GetEpochStatusResponse } from "./generated-src/proto/CartesiServerManager/GetEpochStatusResponse";
import { spawn, SpawnOptions } from "child_process";
import { ProcessedInput } from "./generated-src/proto/CartesiServerManager/ProcessedInput";
import { GetSessionStatusResponse } from "./generated-src/proto/CartesiServerManager/GetSessionStatusResponse";
import { GetSessionStatusRequest } from "./generated-src/proto/CartesiServerManager/GetSessionStatusRequest";

// Utilities

const CONSOLE = `../../frontend-console`;

export enum LogLevel {
    VERBOSE = "verbose",
    DEFAULT = "default",
}

export enum ErrorCodes {
    SESSION_ID_NOT_FOUND = 3,
    CONCURRENT_CALL = 10,
    NO_CONNECTION = 14,
}

export const timer = (s: number) =>
    new Promise((res) => setTimeout(res, s * 1000));

class Logger {
    enabled = true;
    logLevel = LogLevel.DEFAULT;

    log(message: any) {
        if (this.enabled) {
            console.log(message);
        }
    }

    verbose(message: any) {
        if (this.enabled && this.logLevel == LogLevel.VERBOSE) {
            console.log(message);
        }
    }
}
export const logger = new Logger();

interface CommandOutput {
    stderr: string,
    stdout: string
}

const _execCommand = async (
    cmd: string,
    args: string[] = [],
    options: SpawnOptions = {}
): Promise<CommandOutput> => {
    const fullCmd = `${cmd} ${args.join(" ")}`;
    logger.verbose(`${fullCmd}`);

    const process = spawn(cmd, args, options);

    process.on("error", (error) => {
        throw new Error(`Failed to execute "${fullCmd}". ${error}`);
    });

    let stderr = "";
    if (process.stderr) {
        process.stderr.on("data", (data) => {
            stderr += data;
        });
    }

    let stdout = "";
    if (process.stdout) {
        process.stdout.on("data", (data) => {
            stdout += data;
        });
    }

    let exitCode = 0;
    if (options.detached) {
        process.unref();
        process.on("close", (code: number) => {
            logger.verbose(`${fullCmd} exited with code ${code}`);
        });
    } else {
        exitCode = await new Promise((resolve) => {
            process.on("close", resolve);
        });
    }

    if (exitCode) {
        throw new Error(`${fullCmd} exited with code ${exitCode}. ${stderr}`);
    }

    return {
        stdout: stdout,
        stderr: stderr,
    };
}

export interface TestOptions {
    logLevel: LogLevel;
    pollingTimeout: number;
    address: string;
}

export const parseArgs = (argv: string[]): TestOptions => {
    let options: TestOptions = {
        logLevel: LogLevel.DEFAULT,
        pollingTimeout: 60,
        address: ""
    };

    let index = argv.indexOf("--address");
    if (index >= 0) {
        try {
            console.log(argv[index + 1]);
            let address = argv[index + 1];
            options.address = address.toString();
        } catch (error) {
            throw new Error(`Failed to parse arguments. ${error}`);
        }
    }

    index = argv.indexOf("--pollingTimeout");
    if (index >= 0) {
        try {
            let timeout = Number(argv[index + 1]);
            if (timeout >= 0) {
                options.pollingTimeout = timeout;
            }
        } catch (error) {
            throw new Error(`Failed to parse arguments. ${error}`);
        }
    }

    if (argv.includes("--verbose")) {
        options.logLevel = LogLevel.VERBOSE;
    }

    return options;
}

// General

export const sendInput = async (input: string): Promise<string> => {
    const cmd = "yarn";
    const args = ["start", "input", "send", "--payload", input];
    const options = { cwd: CONSOLE };
    const io = await _execCommand(cmd, args, options);

    return io.stdout;
}

//FIXME: keeps sending commands even after mocha dies with timeout 
export const queryNotices = async (
    epoch: number,
    input: number,
    timeout: number
): Promise<any[]> => {
    const cmd = "yarn";
    const args = [
        "start",
        "notice",
        "list",
        "--epoch",
        epoch.toString(),
        "--input",
        input.toString(),
    ];
    const options = { cwd: CONSOLE };

    let count = 0;
    do {
        await timer(1);
        logger.verbose(`Attempt: ${count}`);
        const output = await _execCommand(cmd, args, options);

        if (output.stderr) {
            throw new Error(`Failed to get notices. ${output.stderr}`);
        }

        try {
            const notices = _parseNoticesOutput(output.stdout);
            if (notices.length > 0) {
                return notices;
            }
            logger.verbose(`No notice retrieved`);
            count++;
        } catch (error) {
            throw new Error(`Failed to parse notices. ${error}`);
        }
    } while (count < timeout);
    return [];
}

/**
 * Extracts Notices as a JSON array from the output generated by front-end console 
 * @param output the command line output from front-end console
 * @returns JSON array with the Notices
 */
const _parseNoticesOutput = (output: string): any => {
    const splitOut = output.split("\n");
    splitOut.splice(-1); //remove the last (empty) line
    const noticesStr = splitOut.pop() ?? "[]";
    logger.verbose(`Notices: ${noticesStr}`);
    return JSON.parse(noticesStr);
}

export const isQueryServerReady = async (timeout: number): Promise<boolean> => {
    let count = 0;
    do {
        await timer(1);
        try {
            logger.verbose(`Attempt: ${count}`);
            const ping = await pingQueryServer();
            if (ping) return true;
        } catch (error: any) {
            if (error.code != "ECONNRESET" && error.code != "ECONNREFUSED") {
                throw error;
            }
        }
        count++;
    } while (count < timeout);
    return false;
}

export function pingQueryServer(): Promise<boolean> {
    const options = {
        hostname: "localhost",
        port: 4000,
        path: "/graphql",
        method: "GET",
    };

    return _sendRequest(options);
}

export const advanceEpoch = async (time = 864010): Promise<void> => {
    await _hardhatAdvanceTime(time);
    await _hardhatEvmMine();
}

const _hardhatAdvanceTime = async (time: number): Promise<void> => {
    const data = JSON.stringify({
        id: 1337,
        jsonrpc: "2.0",
        method: "evm_increaseTime",
        params: [time],
    });
    const options: http.RequestOptions = {
        hostname: "localhost",
        port: 8545,
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Content-Length": data.length,
        },
    };

    await _sendRequest(options, data);
}

const _hardhatEvmMine = async (): Promise<void> => {
    const data = JSON.stringify({
        id: 1337,
        jsonrpc: "2.0",
        method: "evm_mine",
    });
    const options: http.RequestOptions = {
        hostname: "localhost",
        port: 8545,
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Content-Length": data.length,
        },
    };

    await _sendRequest(options, data);
}

const _sendRequest = async (
    options: http.RequestOptions,
    data?: any
): Promise<any> => {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res: any) => {
            res.on("data", (d: any) => {
                logger.verbose(`Status code: ${res.statusCode}. Data: ${d}`);
                resolve(d);
            });
        });

        req.on("error", (error: any) => {
            logger.verbose(`Request failed: ${JSON.stringify(error)}`);
            reject(error);
        });

        if (data) {
            req.write(data);
        }
        req.end();
    });
}

export async function assertEpoch(
    epoch: number,
    client: PollingServerManagerClient,
    timeout: number
) {
    let count = 0;
    let status: GetSessionStatusResponse;
    do {
        await timer(1);
        try {
            logger.verbose(`Attempt: ${count}`);
            status = await client.getSessionStatus();
            if (status.activeEpochIndex == epoch) return true;
        } catch (error: any) {
            if (error.code != ErrorCodes.CONCURRENT_CALL) {
                throw error;
            }
        }
        count++;
    } while (count < timeout);
    return false;
}

//gRPC

export class PollingServerManagerClient {
    private client: ServerManagerClient;

    constructor(client: ServerManagerClient);
    constructor(address: string, pathToProto: string);
    constructor(...args: any[]) {
        switch (args.length) {
            case 1: {
                this.client = args[0];
                logger.verbose(`Using provided server manager gRPC client`);
                break;
            }
            case 2: {
                const address = args[0];
                const protoFile = args[1];

                const definition = protoLoader.loadSync(protoFile);
                const proto = grpc.loadPackageDefinition(
                    definition
                ) as unknown as ProtoGrpcType;

                this.client = new proto.CartesiServerManager.ServerManager(
                    address,
                    grpc.credentials.createInsecure()
                );

                logger.verbose(
                    `Created server manager gRPC client with URL: ${address}`
                );
                break;
            }
            default:
                throw new Error("Undefined constructor");
        }
    }

    async isReady(timeout: number): Promise<boolean> {
        let count = 0;
        do {
            await timer(1);
            try {
                logger.verbose(`Attempt: ${count}`);
                await this.getEpochStatus(0);
                return true;
            } catch (error: any) {
                if (
                    error.code != ErrorCodes.SESSION_ID_NOT_FOUND &&
                    error.code != ErrorCodes.CONCURRENT_CALL &&
                    error.code != ErrorCodes.NO_CONNECTION
                ) {
                    throw error;
                }
            }
            count++;
        } while (count < timeout);
        return false;
    }

    async getProcessedInputs(
        epoch: number,
        timeout: number,
        expectedInputCount: number
    ): Promise<ProcessedInput[]> {
        let count = 0;
        let status: GetEpochStatusResponse;
        do {
            await timer(1);
            try {
                logger.verbose(`Attempt: ${count}`);
                status = await this.getEpochStatus(epoch);

                let pendingInputsCount = status.pendingInputCount ?? 0;
                let processedInputsCount = status.processedInputs?.length ?? 0;

                if (pendingInputsCount == 0 && processedInputsCount >= expectedInputCount) {
                    return status.processedInputs ?? [];
                }
            } catch (error: any) {
                if (error.code != ErrorCodes.CONCURRENT_CALL) {
                    throw error;
                }
            }
            count++;
        } while (count < timeout);
        throw new Error("Timed out waiting Server Manager to process inputs");
    }

    async getEpochStatus(
        index: number,
        sessionId = "default_rollups_id"
    ): Promise<GetEpochStatusResponse> {
        let request: GetEpochStatusRequest = {
            sessionId: sessionId,
            epochIndex: index,
        };

        return new Promise((resolve, reject) => {
            this.client?.getEpochStatus(
                request,
                (
                    err: grpc.ServiceError | null,
                    output: GetEpochStatusResponse | undefined
                ) => {
                    if (err || !output) {
                        logger.verbose(err);
                        reject(err);
                    } else {
                        logger.verbose(output);
                        resolve(output);
                    }
                }
            );
        });
    }

    async getSessionStatus(
        sessionId = "default_rollups_id"
    ): Promise<GetSessionStatusResponse> {
        let request: GetSessionStatusRequest = {
            sessionId: sessionId,
        };

        return new Promise((resolve, reject) => {
            this.client.getSessionStatus(
                request,
                (
                    err: ServiceError | null,
                    output: GetSessionStatusResponse | undefined
                ) => {
                    if (err || !output) {
                        logger.log(err);
                        reject(err);
                    } else {
                        logger.verbose(output);
                        resolve(output);
                    }
                }
            );
        });
    }
}
