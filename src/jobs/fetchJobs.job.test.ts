import axios from "axios";
import { runJob } from "./fetchJobs.job.js";
import * as gupyService from "../services/gupy.service.js";
import * as filters from "../utils/filters.js";
import { jest } from "@jest/globals";

jest.mock("axios");
jest.mock("../services/gupy.service.js");
jest.mock("../utils/filters.js");

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedGupy = gupyService as jest.Mocked<typeof gupyService>;
const mockedFilters = filters as jest.Mocked<typeof filters>;

describe("FetchJobs Job", () => {
  it("deve orquestrar a busca e o disparo de webhooks", async () => {
    const mockJobs = [{ id: "1", title: "Vaga 1" }];
    
    mockedGupy.fetchJobs.mockResolvedValue(mockJobs as any);
    mockedFilters.filterNewJobs.mockReturnValue(mockJobs as any);
    mockedAxios.post.mockResolvedValue({ status: 200 } as any);

    await runJob();

    expect(mockedGupy.fetchJobs).toHaveBeenCalled();
    expect(mockedFilters.filterNewJobs).toHaveBeenCalledWith(mockJobs);
    expect(mockedAxios.post).toHaveBeenCalled();
  });
});