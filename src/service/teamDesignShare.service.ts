import { FilterQuery } from "mongoose";
import { ServiceOptions } from ".";
import TeamDesignShareModel, {
  TeamDesignShareDocument,
  TeamDesignShareInput,
} from "../models/teamDesignShare.model";

const defaultPopulate = ["design", "team", "permission"];

export async function createTeamDesignShare(input: TeamDesignShareInput) {
  if (!input.permission) {
    input.permission = "READ";
  }
  const teamDesignShare = await TeamDesignShareModel.create(input);

  return teamDesignShare.toJSON();
}

export async function findTeamDesignShares(
  query: FilterQuery<TeamDesignShareDocument>
) {
  return TeamDesignShareModel.find(query).lean();
}

export async function findTeamDesignSharesForTeam(
  teamId: string,
  options?: ServiceOptions
) {
  return TeamDesignShareModel.find({ team: teamId })
    .populate(options?.populate || defaultPopulate)
    .lean();
}
