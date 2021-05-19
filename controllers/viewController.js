const Item = require("./../models/itemModel");
const Location = require("./../models/locationModel");
const { body, validationResult } = require("express-validator");

exports.getAllItems = async (req, res) => {
  try {
    console.log("Query object:", req.query);
    // console.log("Request object", req);

    // Filtering
    const queryObj = { ...req.query };
    const excludedFields = ["sort"];
    excludedFields.forEach((el) => delete queryObj[el]);

    console.log(queryObj);

    const title =
      queryObj.location === undefined ? "Overview" : queryObj.location;

    // let query = Item.find(req.query).populate("location").sort("-dateAdded");
    let query = Item.find(queryObj).populate("location");

    // Sorting
    // Check if there is a sort query.
    if (req.query.sort) {
      query = query.sort(req.query.sort);
    } else {
      query = query.sort("-dateAdded");
    }

    const items = await query;
    const locations = await Location.find();

    res.status(200).render("overview", {
      title: title,
      currentLocationId: queryObj.location,
      locations,
      items,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

exports.newItemForm = async (req, res) => {
  try {
    const locations = await Location.find();
    res.status(200).render("create", {
      locations,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

exports.createItem = async (req, res) => {
  try {
    await Item.create({
      name: req.body.itemName,
      startingPortions: req.body.portions,
      remainingPortions: req.body.portions,
      location: req.body.location,
      meal: req.body.meal,
      eatByDate: req.body.eatBy,
    });

    res.status(200).redirect(301, "/");
  } catch (err) {
    res.status(400).json({
      status: "create fail",
      message: "Invalid data sent",
    });
  }
};

exports.eatPortion = async (req, res) => {
  try {
    if (req.body.remainingPortions * 1 < 2) {
      console.log("Delete Item");
      await Item.findByIdAndDelete(req.body.itemId);
    } else {
      const newPortions = req.body.remainingPortions - 1;
      await Item.findByIdAndUpdate(req.body.itemId, {
        remainingPortions: newPortions,
      });
    }

    console.log(req.body);

    res.status(201).redirect(301, "back");
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: "Invalid data sent",
    });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(201).json({
      status: "Success",
      data: {
        item: updatedItem,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: "Invalid data sent",
    });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: "Success",
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: "Invalid data sent",
    });
  }
};
