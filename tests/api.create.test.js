const request = require("supertest");
const app = require("../app");

const Api = require("../models/api");
const Tag = require("../models/tag");
const User = require("../models/user");


jest.mock("../middlewares/checkToken", () =>
  (req, res, next) => {
    req.user = { id: "user123" };
    next();
  }
);

jest.mock("../configs/cloudinary", () => ({
  uploader: {
    upload: jest.fn().mockResolvedValue({
      secure_url: "http://fake-image-url.com/image.jpg",
    }),
  },
}));

jest.mock("../models/api");
jest.mock("../models/tag");
jest.mock("../models/user");

describe("POST /api/create", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("crée une API avec succès", async () => {
    Api.findOne.mockResolvedValue(null);
    Api.create.mockResolvedValue({ _id: "api123", name: "Test API" });

    Tag.findOne.mockResolvedValue(null);
    Tag.create.mockResolvedValue({ _id: "tag123" });

    User.findByIdAndUpdate.mockResolvedValue(true);

    const res = await request(app)
      .post("/apis/create")
      .send({
        name: "Test API",
        description: "Une API de test",
        officialLink: "https://example.com",
        documentationLink: "https://docs.example.com",
        category: "Tools",
        tags: ["test", "api"],
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe(true);
    expect(Api.create).toHaveBeenCalled();
    expect(User.findByIdAndUpdate).toHaveBeenCalled();
  });
});
