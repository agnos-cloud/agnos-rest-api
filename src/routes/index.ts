import { Express, Request, Response } from "express";
import collaborationRoutes from "@routes/collaboration";
import componentRoutes from "@routes/component";
import membershipRoutes from "@routes/membership";
import orgRoutes from "@routes/org";
import projectRoutes from "@routes/project";
import sessionRoutes from "@routes/session";
import settingsRoutes from "@routes/settings";
import userRoutes from "@routes/user";
import functionRoutes from "./function.routes";
import functionVersionRoutes from "./functionVersion.routes";
import invocationRoutes from "./invocation.routes";
import logRoutes from "./log.routes";
import meRoutes from "./me.routes";
import teamRoutes from "./team.routes";

export default function routes(app: Express) {
  /**
   * @openapi
   * /healthcheck:
   *  get:
   *     tags:
   *     - Healthcheck
   *     description: Responds if the app is up and running
   *     responses:
   *       200:
   *         description: App is up and running
   */
  app.get("/healthcheck", (req: Request, res: Response) => res.sendStatus(200));

  app.use(userRoutes);
  app.use(collaborationRoutes);
  app.use(componentRoutes);
  app.use(membershipRoutes);
  app.use(orgRoutes);
  app.use(projectRoutes);
  app.use(sessionRoutes);
  app.use(settingsRoutes);
  app.use(meRoutes);
  app.use(functionRoutes);
  app.use(functionVersionRoutes);
  app.use(invocationRoutes);
  app.use(logRoutes);
  app.use(teamRoutes);
}
