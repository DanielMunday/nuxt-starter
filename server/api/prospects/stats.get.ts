import { getPipelineStats } from "../../utils/store";

export default defineEventHandler(() => {
  return getPipelineStats();
});
