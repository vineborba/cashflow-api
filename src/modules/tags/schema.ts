import * as v from "valibot";

import { insertTagsSchema } from "@app/db/schemas/tags.schema";

export const newTagSchema = v.pick(insertTagsSchema, ["name"]);
