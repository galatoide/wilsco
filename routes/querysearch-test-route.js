const express = require('express');
const router = express.Router();
const axios = require('axios');

const bcrypt = require("bcrypt");
const bcryptSalt = 10;
const User = require("../models/user");
require('dotenv').config();

const webCamsApi = axios.create({
    baseURL: 'https://api.windy.com/api/webcams/v2/',
    timeout: 1000,
    headers: {
        'x-windy-key': 'RQlJ46jN1goFYopS9Jgln9igeqHVS1FL' //pr ocess.env.API_KEY
    }
});

router.get("/search", (req, res, next) => {
    const region = req.query;
    console.log(region)
    webCamsApi.get(`list/region=${region}?show=webcams:location,statistics,image`)
        .then(responseFromApi => {
            res.render("list-cameras", {
                responseFromApi
            })
        }).catch(error => {
            res.render("dashboard")
        })
})