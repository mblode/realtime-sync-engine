// Issue.ts
import { User } from "./User";
import { createModel, property, manyToOne } from "./models";

export const Issue = createModel({
  id: property(""),
  title: property(""),
  assignee: manyToOne(null as User, "issues"),
});

export type Issue = ReturnType<typeof Issue>;
