const Community = require("../models/communityModel");

async function createCommunity(req, res) {
  try {
    const { name, description, domain, tags, createdBy, dominentCluster } =
      req.body;
    if (req.userId != createdBy) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
        data: null,
      });
    }

    const community = await Community.createCommunity(
      name,
      description,
      domain,
      tags,
      createdBy,
      dominentCluster
    );

    res.status(201).json({
      success: true,
      message: "Community created successfully",
      data: community,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: e.message,
      data: null,
    });
  }
}

async function getCommunity(req, res) {
  try {
    const { id } = req.params;
    const community = await Community.getCommunityById(id);
    res.status(200).json({
      success: true,
      message: "Community found successfully",
      data: community,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: e.message,
      data: null,
    });
  }
}

module.exports = {
  createCommunity,
  getCommunity,
};
