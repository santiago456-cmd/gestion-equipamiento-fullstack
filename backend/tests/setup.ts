import { afterAll, beforeAll } from "vitest";
import { sequelize } from "../src/config/dataBase.js";
import { setupAssociations } from "../src/models/associations.js";

beforeAll(async () => {
  setupAssociations()
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});