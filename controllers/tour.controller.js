const { Tour } = require("../models/tour.model");

exports.createTour = async function (req, res) {
    try {
        const newTour = await Tour.create(req.body);
        return res.status(201).json({
            status: "success",
            data: {
                tour: newTour,
            },
        });
    } catch (error) {
        return res.status(400).json({
            status: "fail",
            error: error,
        });
    }
};

exports.getAllTours = async function (req, res) {
    try {
        const allTours = await Tour.find();
        return res.status(200).json({
            status: "success",
            data: {
                tours: allTours,
            },
        });
    } catch (error) {
        return res.status(400).json({
            status: "fail",
            error: error,
        });
    }
};

exports.getTour = async function (req, res) {
    try {
        const { id } = req.params;
        const tour = await Tour.findById(id);

        return res.status(200).json({
            status: "success",
            tour: tour,
        });
    } catch (error) {
        return res.status(400).json({
            status: "fail",
            error: error,
        });
    }
};

exports.updateTour = async function (req, res) {
    try {
        const { id } = req.params;
        const tour = await Tour.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });
        return res.status(200).json({
            status: "success",
            tour: tour,
        });
    } catch (error) {
        return res.status(400).json({
            status: "fail",
            error: error,
        });
    }
};

exports.deleteTour = async function (req, res) {
    try {
        const { id } = req.params;
        await Tour.findByIdAndDelete(id);

        return res.status(204).json({
            status: "success",
            data: null,
        });
    } catch (error) {
        return res.status(400).json({
            status: "fail",
            error: error,
        });
    }
};
