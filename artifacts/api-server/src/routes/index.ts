import { Router, type IRouter } from "express";
import healthRouter from "./health";
import teamsRouter from "./teams";
import liveRouter from "./live";

const router: IRouter = Router();

router.use(healthRouter);
router.use(teamsRouter);
router.use(liveRouter);

export default router;
