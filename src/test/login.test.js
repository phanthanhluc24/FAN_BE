const request = require("supertest");
const app = require("../../server");
describe("POST /login", () => {
  it("should login with correct credentials", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "loan.hothi24@student.passerellesnumeriques.org", password: "Loan@123?" });
       expect(res.status).toEqual(201);
    // Kiểm tra nội dung hoặc token trả về, tùy thuộc vào triển khai của bạn
  });

  it("should can't login with invalid email",async () =>{
    const res = await request(app)
    .post("/auth/login")
    .send({email:"loan.hothi24@gmail.com",password:"Loan@123?"})
    expect(res.body.status).toEqual(404)
  })

  it("should can't login with invalid password",async () =>{
    const res = await request(app)
    .post("/auth/login")
    .send({email:"loan.hothi24@student.passerellesnumeriques.org",password:"Loan@1234?"})
    expect(res.body.status).toEqual(401)
  })

  it("should can't login with password and email is null",async () =>{
    const res = await request(app)
    .post("/auth/login")
    .send({email:"",password:""})
    expect(res.body.status).toEqual(400)
  })

  it("should can't login with password is null",async () =>{
    const res = await request(app)
    .post("/auth/login")
    .send({email:"loan.hothi24@student.passerellesnumeriques.org",password:""})
    expect(res.body.status).toEqual(400)
  })

  it("should can't login with email is null",async () =>{
    const res = await request(app)
    .post("/auth/login")
    .send({email:"",password:"Loan@123?"})
    expect(res.body.status).toEqual(400)
  })

  it("should can't login with email wrong format",async () =>{
    const res = await request(app)
    .post("/auth/login")
    .send({email:"loan.hothi24@student",password:"Loan@123?"})
    expect(res.body.status).toEqual(400)
  })
});
