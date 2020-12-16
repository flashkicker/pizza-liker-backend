const request = require("supertest")
const app = require("../src/app")
const jwt = require("jsonwebtoken")

let TOKEN = ""
const USERNAME = "John"
const PASSWORD = "redredred"

test("Should get initial seed data", async () => {
	const response = await request(app).get("/getSeedData")

	expect(response.statusCode).toBe(200)
	expect(response.body.length).toBeGreaterThanOrEqual(10)
	expect(response.body[0]).toEqual(
		expect.objectContaining({
			username: expect.any(String),
			likes: expect.any(Number),
		})
	)
})

test("Should sign up a user", async () => {
	const response = await request(app)
		.post("/signup")
		.send({ username: USERNAME, password: PASSWORD })

	const data = response.body.data

	TOKEN = response.body.token
	const { username, likes } = jwt.decode(TOKEN)

	expect(response.statusCode).toBe(200)
	expect(username).toEqual(USERNAME)
	expect(likes).toEqual(10)
	expect(data.length).toBeGreaterThanOrEqual(11)
	expect(data[data.length - 1]).toEqual(
		expect.objectContaining({
			username: USERNAME,
			likes: 10,
			password: expect.any(String),
		})
	)
})

test("Should not be able to sign up without username and password", async () => {
	const response = await request(app)
		.post("/signup")
		.send({ username: "", password: "" })

	expect(response.statusCode).toBe(422)
})

test("Should be able to like pizza", async () => {
	const response = await request(app)
		.post("/like")
		.set("authorization", `Bearer ${TOKEN}`)

	const user = response.body.user

	expect(response.statusCode).toBe(200)
	expect(user.username).toEqual(USERNAME)
	expect(user.likes).toBeGreaterThanOrEqual(11)
})

test("Should not be able to like pizza without a token", async () => {
	const response = await request(app).post("/like")

	expect(response.statusCode).toBe(401)
})

test("Should not be able to like pizza with invalid token", async () => {
	const response = await request(app)
		.post("/like")
		.set("authorization", `Bearer ${TOKEN}xyz`)

	expect(response.statusCode).toBe(401)
})

test("Should be able to sign in with same credentials", async () => {
	const response = await request(app)
		.post("/signin")
		.send({ username: USERNAME, password: PASSWORD })

	TOKEN = response.body.token
	const { username, likes } = jwt.decode(TOKEN)

	expect(response.statusCode).toBe(200)
	expect(username).toEqual(USERNAME)
	expect(likes).toBeGreaterThanOrEqual(11)
})

test("Should not be able to sign in with incorrect password", async () => {
	const response = await request(app)
		.post("/signin")
		.send({ username: USERNAME, password: "abcdefg" })

	expect(response.statusCode).toBe(422)
})
