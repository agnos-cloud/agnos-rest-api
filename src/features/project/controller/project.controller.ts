import { Request } from "express";
import { IGNORE_LEAST_CARDINALITY } from "@constants/settings";
import { CreateProjectRequest, GetProjectRequest } from "@schemas/project";
import { createProjectDocument, findProject, findProjectDocument, findProjects } from "@services/project";
import { findUserDocument } from "@services/user";
import { Obj, Response, Node } from "@types";
import { FilterQuery, LeanDocument, ObjectId } from "mongoose";
import { ProjectDocument } from "@models/project";
import errorObject from "@utils/error";
import logger from "@utils/logger";
import { OrgDocument } from "@models/org";
import { findOrgDocument } from "@services/org";
import { DESIGN_NOT_FOUND, ORG_NOT_FOUND, PROJECT_NOT_FOUND } from "@constants/errors";
import { createCollaboration } from "@services/collaboration";
import { PermissionName } from "@constants/permissions";
import { ServiceOptions } from "@services";
import { addNodeToCanvas, createCanvas, findCanvas, updateCanvasNode } from "@services/canvas";
import { CreateModelRequest } from "@schemas/model";
import { ModelDocument } from "@models/model";
import { createModel } from "@/features/model/service/model.service";
import { omit } from "lodash";
import { convertModelToNode } from "@utils/flow";
import { UpdateDesignCanvasRequest, UpdateProjectCanvasRequest } from "@schemas/canvas";
import { CanvasDocument } from "@models/canvas";
import { CreateDesignRequest, GetDesignRequest, GetDesignsRequest } from "@schemas/design";
import { DesignDocument } from "@models/design";
import { createDesignDocument, findDesign, findDesigns } from "@services/design";

export async function createProjectHandler(
  req: Request<Obj, Obj, CreateProjectRequest["body"]>,
  res: Response<LeanDocument<ProjectDocument & { _id: ObjectId }>>
) {
  try {
    const userId = res.locals.user?._id;
    const userDoc = await findUserDocument({ _id: userId });

    let org:
      | (OrgDocument & {
          _id: ObjectId;
        })
      | null = null;
    if (req.body.org) {
      org = await findOrgDocument({ _id: req.body.org });
    } else {
      org = await findOrgDocument({ user: userId, personal: true });
    }
    if (!org) {
      throw new Error(ORG_NOT_FOUND);
    }

    const projectDoc = await createProjectDocument({ ...req.body, user: userId, org: org._id, personal: org.personal });
    const collaboration = await createCollaboration({
      org: org._id,
      permission: PermissionName.admin,
      project: projectDoc._id,
      user: userId,
    });

    if (IGNORE_LEAST_CARDINALITY) {
      userDoc?.collaborations?.push(collaboration);
      await userDoc?.save();
      projectDoc.collaborations?.push(collaboration);
      org.collaborations?.push(collaboration);
      org.projects?.push(projectDoc);
      await org.save();
    }

    const canvas = await createCanvas({ project: projectDoc._id, nodes: [] });
    projectDoc.canvas = canvas._id;
    await projectDoc.save();

    const project = await findProject({ _id: projectDoc._id });

    return res.send({ data: project });
  } catch (error: unknown) {
    logger.error(error);
    return res.status(404).send({ error: errorObject(error) });
  }
}

export async function createProjectDesignHandler(
  req: Request<CreateDesignRequest["params"], Obj, CreateDesignRequest["body"]>,
  res: Response<LeanDocument<DesignDocument & { _id: ObjectId }>>
) {
  try {
    const userId = res.locals.user?._id;

    const projectDoc = await findProjectDocument({ _id: req.params.project });
    if (!projectDoc) {
      throw new Error(PROJECT_NOT_FOUND);
    }

    const designDoc = await createDesignDocument({ ...req.body, project: projectDoc._id, user: userId });

    if (IGNORE_LEAST_CARDINALITY) {
      projectDoc.designs?.push(designDoc);
      await projectDoc.save();
    }

    const canvas = await createCanvas({ design: designDoc._id, nodes: [] });
    designDoc.canvas = canvas._id;
    await designDoc.save();

    const design = await findDesign({ _id: designDoc._id });

    return res.send({ data: design });
  } catch (error: unknown) {
    logger.error(error);
    return res.status(404).send({ error: errorObject(error) });
  }
}

export async function createProjectModelHandler(
  req: Request<CreateModelRequest["params"], Obj, CreateModelRequest["body"]>,
  res: Response<LeanDocument<Omit<ModelDocument, "modelSchema"> & { _id: ObjectId }> & { schema: Obj }>
) {
  try {
    const userId = res.locals.user?._id;

    const projectDoc = await findProjectDocument({ _id: req.params.project });
    if (!projectDoc) {
      throw new Error(PROJECT_NOT_FOUND);
    }

    const input = omit(req.body, "events", "schema");

    const model = await createModel({ ...input, modelSchema: req.body.schema, project: projectDoc._id, user: userId });

    if (IGNORE_LEAST_CARDINALITY) {
      projectDoc.models?.push(model);
      await projectDoc.save();
    }

    const node: Node = convertModelToNode(model);
    await addNodeToCanvas({ _id: projectDoc.canvas }, node);
    // TODO: dispatch model event with new model // move to service

    return res.send({ data: { ...omit(model, "modelSchema"), schema: req.body.schema as Obj } });
  } catch (error: unknown) {
    logger.error(error);
    return res.status(404).send({ error: errorObject(error) });
  }
}

export async function getProjectHandler(
  req: Request<GetProjectRequest["params"]>,
  res: Response<LeanDocument<ProjectDocument & { _id: ObjectId }>>
) {
  try {
    const parsedQuery = (res.locals as Obj).query;
    const project = await findProject({ _id: req.params.project }, parsedQuery as ServiceOptions);

    if (!project) {
      throw new Error(PROJECT_NOT_FOUND);
    }

    return res.send({ data: project });
  } catch (error: unknown) {
    logger.error(error);
    return res.status(404).send({ error: errorObject(error) });
  }
}

export async function getProjectsHandler(
  req: Request,
  res: Response<LeanDocument<Array<ProjectDocument & { _id: ObjectId }>>>
) {
  const parsedQuery = (res.locals as Obj).query;

  const projects = await findProjects(
    { ...((parsedQuery as Obj).filter as Obj), private: false } as FilterQuery<ProjectDocument>,
    parsedQuery as ServiceOptions
  );

  const size = (parsedQuery as Obj).limit as number;
  const page = ((parsedQuery as Obj).skip as number) / size + 1; // skip = (page - 1) * size // => page = skip / size + 1
  return res.send({
    data: projects,
    meta: { pagination: { size, page, prev: Math.max(0, page - 1), next: page + 1 } },
  });
}

export async function getProjectDesignHandler(
  req: Request<GetDesignRequest["params"]>,
  res: Response<LeanDocument<DesignDocument & { _id: ObjectId }>>
) {
  try {
    const parsedQuery = (res.locals as Obj).query;
    const design = await findDesign(
      { _id: req.params.design, project: req.params.project },
      parsedQuery as ServiceOptions
    );

    if (!design) {
      throw new Error(DESIGN_NOT_FOUND);
    }

    return res.send({ data: design });
  } catch (error: unknown) {
    logger.error(error);
    return res.status(404).send({ error: errorObject(error) });
  }
}

export async function getProjectDesignsHandler(
  req: Request<GetDesignsRequest["params"]>,
  res: Response<LeanDocument<Array<DesignDocument & { _id: ObjectId }>>>
) {
  const parsedQuery = (res.locals as Obj).query;

  const designs = await findDesigns(
    { ...((parsedQuery as Obj).filter as Obj), project: req.params.project } as FilterQuery<ProjectDocument>,
    parsedQuery as ServiceOptions
  );

  const size = (parsedQuery as Obj).limit as number;
  const page = ((parsedQuery as Obj).skip as number) / size + 1; // skip = (page - 1) * size // => page = skip / size + 1
  return res.send({
    data: designs,
    meta: { pagination: { size, page, prev: Math.max(0, page - 1), next: page + 1 } },
  });
}

export async function updateProjectCanvasHandler(
  req: Request<UpdateProjectCanvasRequest["params"], Obj, UpdateProjectCanvasRequest["body"]>,
  res: Response<LeanDocument<CanvasDocument & { _id: ObjectId }>>
) {
  try {
    const project = await findProject({ _id: req.params.project });
    if (!project) {
      throw new Error(PROJECT_NOT_FOUND);
    }

    const nodes: Array<Partial<Node>> = req.body.nodes;
    await updateCanvasNode({ _id: project.canvas }, nodes);

    const canvas = await findCanvas({ _id: project.canvas });

    return res.send({ data: canvas });
  } catch (error: unknown) {
    logger.error(error);
    return res.status(404).send({ error: errorObject(error) });
  }
}

export async function updateProjectDesignCanvasHandler(
  req: Request<UpdateDesignCanvasRequest["params"], Obj, UpdateDesignCanvasRequest["body"]>,
  res: Response<LeanDocument<CanvasDocument & { _id: ObjectId }>>
) {
  try {
    const design = await findDesign({ _id: req.params.design, project: req.params.project });
    if (!design) {
      throw new Error(DESIGN_NOT_FOUND);
    }

    const nodes: Array<Partial<Node>> = req.body.nodes;
    await updateCanvasNode({ _id: design.canvas }, nodes);

    const canvas = await findCanvas({ _id: design.canvas });

    return res.send({ data: canvas });
  } catch (error: unknown) {
    logger.error(error);
    return res.status(404).send({ error: errorObject(error) });
  }
}

// when searching for resources (orgs, projects, resources, etc) private resources should not be returned
// when searching for non-root resources (models, designs, etc) go through their parent resource (e.g. project)
// when searching for associations (memberships, collaborations, teams, etc) only personal associations (user=userId) should be returned
// to find all associations in a resource use the resource's memberships or collaborations endpoints (u need the right role or permission to access those endpoints)
