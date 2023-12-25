const express = require("express");
const playerRouter = express.Router();
const Playlist = require("../models/playlist.model");
const { auth } = require("../middleware/auth.middleware");

// Create a new playlist
playerRouter.use(auth);
playerRouter.post("/create", async (req, res) => {
    const { name, description } = req.body;
    const owner = req.userId; // Extract the owner from the authenticated user

    try {
        // Create a new playlist
        const playlist = new Playlist({
            name,
            description,
            owner,
            tracks: [],
        });

        await playlist.save();

        res.status(201).json({ message: "Playlist created successfully." });
    } catch (error) {
        res
            .status(500)
            .json({ message: "Playlist creation failed. Please try again." });
    }
});

// Update a playlist (e.g., change name or description)

playerRouter.put("/update/:playlistId", async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    try {
        // Find the playlist by ID and owner
        const playlist = await Playlist.findOneAndUpdate(
            { _id: playlistId, owner: req.userId },
            { name, description },
            { new: true } // Return the updated playlist
        );

        if (!playlist) {
            return res.status(404).json({ message: "Playlist not found." });
        }

        res.status(200).json(playlist);
    } catch (error) {
        res.status(500).json({ message: "Error updating playlist." });
    }
});

// Delete a playlist
playerRouter.delete("/delete/:playlistId",  async (req, res) => {
    const { playlistId } = req.params;

    try {
        // Find and delete the playlist by ID and owner
        const playlist = await Playlist.findOneAndDelete({
            _id: playlistId,
            owner: req.userId,
        });

        if (!playlist) {
            return res.status(404).json({ message: "Playlist not found." });
        }

        res.status(200).json({ message: "Playlist deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Error deleting playlist." });
    }
});

// Add a track to a playlist
playerRouter.post("/addtrack/:playlistId", async (req, res) => {
    const { playlistId } = req.params;
    const { trackId } = req.body;

    try {
        // Find the playlist by ID and owner
        const playlist = await Playlist.findOne({
            _id: playlistId,
            owner: req.userId,
        });

        if (!playlist) {
            return res.status(404).json({ message: "Playlist not found." });
        }

        // Add the track to the playlist
        playlist.tracks.push(trackId);
        await playlist.save();

        res.status(200).json(playlist);
    } catch (error) {
        res.status(500).json({ message: "Error adding track to playlist." });
    }
});

// Remove a track from a playlist
playerRouter.delete("/removetrack/:playlistId/:trackId", async (req, res) => {
    const { playlistId, trackId } = req.params;

    try {
        // Find the playlist by ID and owner
        const playlist = await Playlist.findOne({
            _id: playlistId,
            owner: req.userId,
        });

        if (!playlist) {
            return res.status(404).json({ message: "Playlist not found." });
        }

        // Remove the track from the playlist
        playlist.tracks = playlist.tracks.filter((t) => t.toString() !== trackId);
        await playlist.save();

        res.status(200).json(playlist);
    } catch (error) {
        res.status(500).json({ message: "Error removing track from playlist." });
    }
});

// Get a user's playlists
playerRouter.get("/userplaylists", async (req, res) => {
    try {
        const playlists = await Playlist.find({ owner: req.userId });
        res.status(200).json(playlists);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving user playlists." });
    }
});

module.exports = playerRouter;
