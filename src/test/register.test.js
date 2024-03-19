const request = require("supertest");
const app = require("../../server");

describe("POST/ Register", () => {
  it("Repairman finder register successfully with valid information", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({
        full_name: "Phan Băng Châu",
        email: "chau.bang@gmail.com",
        number_phone: "0825030278",
        password: "Chau@123?",
        role: "USR",
      });
    expect(res.body.status).toEqual(201);
  });

  it("Repairman finder can't register successfully with any field is null", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({
        full_name: "",
        email: "chau.bang@gmail.com",
        number_phone: "0825030278",
        password: "Chau@123?",
        role: "USR",
      });

    expect(res.body.status).toEqual(400);
  });

  it("Repairman finder can't register successfully with invalid email", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({
        full_name: "Phan Băng Châu",
        email: "chau.banggmail.com",
        number_phone: "0825030278",
        password: "Chau@123?",
        role: "USR",
      });

    expect(res.body.status).toEqual(400);
  });

  it("Repairman finder can't register successfully with email already exit", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({
        full_name: "Phan Băng Châu",
        email: "loan.hothi24@student.passerellesnumeriques.org",
        number_phone: "0825030278",
        password: "Chau@123?",
        role: "USR",
      });

    expect(res.body.status).toEqual(409);
  });

  it("Repairman finder can't register successfully with number phone already exit", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({
        full_name: "Phan Băng Châu",
        email: "chau.bang@gmail.com",
        number_phone: "0395142866",
        password: "Chau@123?",
        role: "USR",
      });

    expect(res.body.status).toEqual(409);
  });

  it("Repairman finder can't register successfully with number phone <> 10", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({
        full_name: "Phan Băng Châu",
        email: "chau.bang@gmail.com",
        number_phone: "08250302787",
        password: "Chau@123?",
        role: "USR",
      });

    expect(res.body.status).toEqual(400);
  });

  it("Repairman finder can't register successfully with password not strong", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({
        full_name: "Phan Băng Châu",
        email: "chau.bang24@gmail.com",
        number_phone: "0825030272",
        password: "Chau1237",
        role: "USR",
      });

    expect(res.body.status).toEqual(401);
  });

  it("Repairman can't register successfully with category wrong", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({
        full_name: "Phan Băng Châu",
        email: "chau.bang23@gmail.com",
        number_phone: "0825030273",
        password: "Chau@123?",
        role: "RPM",
        address:"Km 34 - Ruộng - Hướng Hiệp - Đakrông - Quảng Trị",
        category_id:"65af6a86048114b05997b86d"
      });

    expect(res.body.status).toEqual(404);
  });

  it("Repairman register successfully with valid information", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({
        full_name: "Phan Băng Châu",
        email: "chau.bang23@gmail.com",
        number_phone: "0825030273",
        password: "Chau@123?",
        role: "RPM",
        address:"Km 34 - Ruộng - Hướng Hiệp - Đakrông - Quảng Trị",
        category_id:"65a233de4676779e4d898a37"
      });

    expect(res.body.status).toEqual(201);
  });
});
