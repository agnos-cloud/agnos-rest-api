import { Request } from "express";
import { RoleName } from "@constants/permissions";
import { IGNORE_LEAST_CARDINALITY } from "@constants/settings";
import { CreateOrgRequest, GetOrgRequest } from "@schemas/org";
import { createMembership } from "@services/membership";
import { createOrgDocument, findOrg, findOrgs } from "@services/org";
import { findUserDocument } from "@services/user";
import { Obj, Response } from "@types";
import { OrgDocument } from "@models/org";
import { FilterQuery, LeanDocument, ObjectId } from "mongoose";
import { ServiceOptions } from "@services";
import { ORG_NOT_FOUND } from "@constants/errors";
import { createSettings } from "@services/settings";
import logger from "@utils/logger";
import errorObject from "@utils/error";

export async function createOrgHandler(
  req: Request<Obj, Obj, CreateOrgRequest["body"]>,
  res: Response<LeanDocument<OrgDocument & { _id: ObjectId }>>
) {
  const userId = res.locals.user?._id;
  const userDoc = await findUserDocument({ _id: userId });

  const orgDoc = await createOrgDocument({ ...req.body, user: userId });
  const membership = await createMembership({
    user: userId,
    org: orgDoc._id,
    role: RoleName.owner,
  });
  const orgSettings = await createSettings({ org: orgDoc._id });

  if (IGNORE_LEAST_CARDINALITY) {
    userDoc?.memberships?.push(membership);
    await userDoc?.save();
    orgDoc.memberships?.push(membership);
  }
  orgDoc.settings = orgSettings._id;
  await orgDoc.save();

  const org = await findOrg({ _id: orgDoc._id });

  return res.send({ data: org });
}

export async function getOrgHandler(
  req: Request<GetOrgRequest["params"]>,
  res: Response<LeanDocument<OrgDocument & { _id: ObjectId }>>
) {
  try {
    const org = await findOrg({ _id: req.params.org });

    if (!org) {
      throw new Error(ORG_NOT_FOUND);
    }

    return res.send({ data: org });
  } catch (error: unknown) {
    logger.error(error);
    return res.status(404).send({ error: errorObject(error) });
  }
}

export async function getOrgsHandler(
  req: Request,
  res: Response<LeanDocument<Array<OrgDocument & { _id: ObjectId }>>>
) {
  const parsedQuery = (res.locals as Obj).query;

  const orgs = await findOrgs(
    { ...((parsedQuery as Obj).filter as Obj), private: false } as FilterQuery<OrgDocument>,
    parsedQuery as ServiceOptions
  );

  const size = (parsedQuery as Obj).limit as number;
  const page = ((parsedQuery as Obj).skip as number) / size + 1;
  return res.send({
    data: orgs,
    meta: { pagination: { size, page, prev: Math.max(0, page - 1), next: page + 1 } },
  });
}

export async function getMyOrgHandler(req: Request, res: Response<LeanDocument<OrgDocument & { _id: ObjectId }>>) {
  const userId = res.locals.user?._id;

  const org = await findOrg({ personal: true, user: userId });
  return res.send({ data: org });
}
