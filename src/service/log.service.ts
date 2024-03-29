import { FilterQuery } from "mongoose";
import { ServiceOptions } from ".";
import LogModel, { LogDocument, LogInput } from "../models/log.model";
import { websocket } from "../index";

const defaultPopulate: string[] = [];

export async function createLog(input: LogInput, options?: { accessToken?: string }) {
  const log = await createLogDocument(input, options);

  return log.toJSON();
}
export async function createLogDocument(input: LogInput, options?: { accessToken?: string }) {
  const log = await LogModel.create(input);

  websocket.emit(`log:${log.source}`, log);
  if (log.meta && log.meta["version"]) websocket.emit(`log:${log.meta["version"]}`, log);
  if (log.meta && log.meta["version"] && log.meta["user"])
    websocket.emit(`log:${log.meta["user"]}@${log.meta["version"]}`, log);
  if (log.meta && log.meta["version"] && options?.accessToken)
    websocket.emit(`log:${options.accessToken}@${log.meta["version"]}`, log);

  return log;
}

export async function findLog(query: FilterQuery<LogDocument>) {
  return LogModel.findOne(query).lean();
}

export async function findLogs(query: FilterQuery<LogDocument>, options?: ServiceOptions) {
  return LogModel.find(query)
    .populate(options?.populate || defaultPopulate)
    .limit(1000)
    .sort({ createdAt: -1 })
    .lean();
}
