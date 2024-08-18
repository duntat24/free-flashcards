const StudySet = require("../Models/StudySet.model");

const mongoose = require("mongoose");
const express = require("express");
const createError = require("http-errors");

// define the needed functions in the module exports
module.exports = {
    createStudySet : async (request, response, next) => { // add a study set to the database
        console.log(request.body);
        try {
            const set = new StudySet(request.body); // this works, assuming the input is valid
            const result = await set.save();
            response.send(result);
        } catch (error) {
            console.log(error.message);
            if (error.name === "ValidationError") { // catching invalid input
                next(createError(422, error.message))
            }
            next(error);
        }
    },
}