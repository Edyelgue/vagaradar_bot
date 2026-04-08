import axios from "axios";
import { fetchJobs } from "./gupy.service.js";
import { jest } from "@jest/globals";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Gupy Service", () => {
  it("deve buscar e mapear as vagas corretamente", async () => {
    const mockResponse = {
      data: {
        data: [
          {
            id: 123,
            name: "Desenvolvedor Backend",
            companyName: "Empresa X",
            location: "São Paulo",
            jobUrl: "https://vaga.gupy.io/123"
          }
        ]
      }
    };
    mockedAxios.get.mockResolvedValue(mockResponse);

    const jobs = await fetchJobs();

    expect(jobs).toHaveLength(1);
    expect(jobs[0]?.title).toBe("Desenvolvedor Backend");
    expect(jobs[0]?.company).toBe("Empresa X");
    expect(jobs[0]?.url).toBe("https://vaga.gupy.io/123");
  });
});