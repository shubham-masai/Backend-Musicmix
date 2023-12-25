const express = require("express");
const trackrouter = express.Router();
const Track = require("../models/track.model");
const multer = require("multer");
const fs = require("fs");
const mm = require("music-metadata");
const rangeParser = require("range-parser");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Route for creating a new track
trackrouter.post("/create", upload.single("audioFile"), async (req, res) => {
  const { title, artist, album } = req.body;

  try {
    if (!req.file) {
      return res.status(400).json({ message: "Audio file is required." });
    }

    const audioFilePath = req.file.path;

    const track = new Track({
      title,
      artist,
      album,
      audioFile: audioFilePath,
    });

    const savedTrack = await track.save();

    res
      .status(201)
      .json({ message: "Track created successfully", track: savedTrack });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Track creation failed. Please try again." });
  }
});

// Route for getting a list of all tracks
trackrouter.get("/list", async (req, res) => {
  try {
    const tracks = await Track.find();
    res.status(200).json(tracks);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving tracks." });
  }
});

// Route for getting details of a specific track
trackrouter.get("/detail/:trackId", async (req, res) => {
  const { trackId } = req.params;

  try {
    const track = await Track.findById(trackId);

    if (!track) {
      return res.status(404).json({ message: "Track not found." });
    }

    res.status(200).json(track);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving track details." });
  }
});

// Route for streaming audio of a specific track
trackrouter.get("/stream/:trackId", async (req, res) => {
  const { trackId } = req.params;

  try {
    const track = await Track.findById(trackId);

    if (!track) {
      return res.status(404).json({ message: "Track not found." });
    }

    const audioFilePath = track.audioFile;

    res.set("content-type", "audio/mpeg");

    const audioStream = fs.createReadStream(audioFilePath);
    audioStream.pipe(res);
  } catch (error) {
    res.status(500).json({ message: "Error streaming track audio." });
  }
});

// Route for getting audio duration of a specific track
trackrouter.get("/duration/:trackId", async (req, res) => {
  const { trackId } = req.params;

  try {
    const track = await Track.findById(trackId);

    if (!track) {
      return res.status(404).json({ message: "Track not found." });
    }

    const audioFilePath = track.audioFile;

    const metadata = await mm.parseFile(audioFilePath);
    const duration = metadata.format.duration;

    res.json({ duration });
  } catch (error) {
    res.status(500).json({ message: "Error fetching audio duration." });
  }
});

module.exports = trackrouter;