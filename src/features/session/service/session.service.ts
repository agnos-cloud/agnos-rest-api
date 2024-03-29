import { FilterQuery, FlattenMaps, LeanDocument, Types, UpdateQuery } from "mongoose";
import SessionModel, { SessionDocument, SessionInput } from "@models/session";

export async function createSession(input: SessionInput) {
  const session = await SessionModel.create(input);

  return session.toJSON() as FlattenMaps<
    LeanDocument<
      SessionDocument & {
        _id: Types.ObjectId;
      }
    >
  >;
}

export async function findSession(query: FilterQuery<SessionDocument>) {
  return SessionModel.findOne(query).lean();
}

export async function findSessions(query: FilterQuery<SessionDocument>) {
  return SessionModel.find(query).lean();
}

export async function updateSession(query: FilterQuery<SessionDocument>, update: UpdateQuery<SessionDocument>) {
  return SessionModel.updateOne(query, update);
}
