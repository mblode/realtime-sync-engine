// User.ts
import { createModel, property, oneToMany } from "./models";

export const User = createModel({
  id: property(""),
  name: property(""),
  issues: oneToMany([], "assignee"),
});

export type User = ReturnType<typeof User>;
