import { LogDescription } from "@ethersproject/abi";
import { ethers } from "ethers";

/**
 * Attempts to retrieve the first instance of the specified event from a given event logs array
 * @param eventName name/type of the event being retrieved
 * @param parser contract instance used to parse the event logs
 * @param eventLogs array of event logs (e.g., returned from a transaction)
 * @returns the expected parsed event log, or undefined if no corresponding event was found
 */
export function getEvent(
  eventName: string,
  parser: ethers.Contract,
  eventLogs: Array<any>
): LogDescription | undefined {
  let expectedEvent: LogDescription;
  for (let i = 0; i < eventLogs.length; i++) {
    try {
      expectedEvent = parser.interface.parseLog(eventLogs[i]);
      if (expectedEvent.name == eventName) {
        return expectedEvent;
      }
    } catch (e) {
      // do nothing, just skip to try parsing the next event
    }
  }
  // no corresponding event found
  return undefined;
}
