import request from "supertest";
import express from "express";
import router from "./webhook.js";
import * as telegramService from "./services/telegram.service.js";
import { jest } from "@jest/globals";

const app = express();
app.use(express.json());
app.use(router);

jest.mock("./services/telegram.service.js");
const mockedTelegram = telegramService as jest.Mocked<typeof telegramService>;

describe("Webhook Router", () => {
  it("deve responder 200 ao receber uma vaga válida", async () => {
    const job = { 
      title: "Dev Node", 
      company: "Startup", 
      location: "Remoto", 
      url: "http://link.com" 
    };
    mockedTelegram.sendMessage.mockResolvedValue(undefined as any);

    const response = await request(app).post("/webhook/new-job").send(job);

    expect(response.status).toBe(200);
    expect(mockedTelegram.sendMessage).toHaveBeenCalled();
  });
});