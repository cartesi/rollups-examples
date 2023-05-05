import chai from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
const expect = chai.expect;

import {
    logger,
    advanceEpoch,
    queryNotices,
    isQueryServerReady,
    sendInput,
    PollingServerManagerClient,
    assertEpoch,
    parseArgs,
    CommandOutput,
    spawnCommandAsync,
} from "../test-util";

const SERVER_MANAGER_PROTO = `../grpc-interfaces/server-manager.proto`;

let serverManager: PollingServerManagerClient;
let runBackendProcess: CommandOutput;

const { logLevel, pollingTimeout, address, environment } = parseArgs(
    process.argv
);
logger.logLevel = logLevel;

describe("Echo-Rust DApp Integration Tests", () => {
    before(async function () {
        if (environment == "host") {
            //Execute Server Manager on host mode
            this.runBackendProcess = await spawnCommandAsync(
                "cd ../echo-rust && ROLLUP_HTTP_SERVER_URL=http://127.0.0.1:5004 cargo run > ../integration-tests/echo.log 2>&1 &",
                [],
                { shell: true, detached: true }
            );
        }

        serverManager = new PollingServerManagerClient(
            address,
            SERVER_MANAGER_PROTO
        );
        logger.log("\tWaiting for Server Manager");
        expect(
            await serverManager.isReady(pollingTimeout),
            "Failed to connect to Server Manager"
        ).to.be.true;
    });

    after(async function () {
        if (environment == "host") {
            this.runBackendProcess?.process.kill();
        }
    });

    it("should process an input", async () => {
        await sendInput("cartesi");
        const inputs = await serverManager.getProcessedInputs(
            0,
            pollingTimeout,
            1
        );
        expect(inputs.length).to.eq(1);

        const sentInputs = inputs.pop();
        expect(
            sentInputs?.acceptedData?.notices?.pop()?.payload?.toString()
        ).to.eq("cartesi");
    });

    it("should generate a notice", async () => {
        expect(
            await isQueryServerReady(pollingTimeout),
            "Timed out waiting Query Server to respond"
        ).to.be.true;

        const notices = await queryNotices(0, pollingTimeout);
        expect(notices.length).to.eq(1);

        const notice = notices.pop();
        expect(notice.index).to.eq(0);
        expect(notice.input).to.eq(0);
        expect(notice.payload).to.eq("cartesi");
    });

    it("should advance the epoch", async () => {
        await advanceEpoch();
        return expect(assertEpoch(1, serverManager, pollingTimeout)).to
            .eventually.be.true;
    });
});
