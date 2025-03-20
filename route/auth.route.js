const { register, login, logout, loginWithGoogle } = require("../controller/auth.controller")

const router = require("express").Router()

router
    .post("/user-register", register)
    .post("/user-login", login)
    .post("/user-logout", logout)
    .post("/oauth", loginWithGoogle)

module.exports = router