import { getProspects } from "../../utils/store";

export default defineEventHandler(() => {
  return getProspects();
});
