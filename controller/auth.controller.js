const asyncHandler = require("express-async-handler")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const { OAuth2Client } = require("google-auth-library")

exports.register = asyncHandler(async (req, res) => {

    const { email, password } = req.body

    const result = await User.findOne({ email })

    if (result) {
        return res.status(401).json({ mesage: "email already exist" })
    }

    const hash = await bcrypt.hash(password, 10)

    await User.create({ ...req.body, password: hash })

    res.json({ message: "User Register Successfully" })
})

exports.login = asyncHandler(async (req, res) => {

    const { email, password } = req.body

    const result = await User.findOne({ email })

    if (!result) {
        return res.status(401).json({ message: "invalid email" })
    }

    const verify = await bcrypt.compare(password, result.password)

    if (!verify) {
        res.status(401).json({ message: "invalid password" })
    }

    const token = jwt.sign({ _id: result._id, name: result.name }, process.env.JWT_KEY)

    res.cookie("USER", token, { maxage: 1000 * 60 * 60 * 24, httpOnly: true, secure: false })

    res.json({
        message: "User Login Successfully", result: {
            _id: result._id,
            name: result.name
        }
    })
})

exports.loginWithGoogle = asyncHandler(async (req, res) => {
    const { credential } = req.body

    const client = new OAuth2Client({ clientId: process.env.GOOGLE_CLIENT_ID })

    const result = await client.verifyIdToken({ idToken: credential })

    if (!result) {
        return res.status(401).json({ message: "unable to login" })
    }

    // console.log(result)

    const { name, email, picture } = result.payload

    const data = await User.findOne({ email })

    if (data) {
        // login
        const token = jwt.sign({ _id: data._id }, process.env.JWT_KEY)

        res.cookie("USER", token, { maxage: 1000 * 60 * 60 * 24, httpOnly: true, secure: false })

        res.json({
            message: "User Login Successfully", result: {
                name: data.name,
                email: data.email,
                profile: data.profile,
            }
        })

    } else {
        // register
        const found = await User.create({ name, email, profile: picture })

        const token = jwt.sign({ _id: found._id }, process.env.JWT_KEY)

        res.cookie("USER", token, { maxage: 1000 * 60 * 60 * 24, httpOnly: true, secure: false })

        res.json({
            message: "User Login Successfully", result: {
                name: found.name,
                email: found.email,
                profile: found.profile,
            }
        })
    }

})

exports.logout = asyncHandler(async (req, res) => {
    res.clearCookie("USER")
    res.json({ message: "User logout Successfully" })
})