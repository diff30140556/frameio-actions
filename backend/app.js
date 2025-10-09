require('dotenv').config();
const express = require('express');
const cors = require('cors');
const FrameioAPI = require('./utils/frameio');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Frame.io API
const frameio = new FrameioAPI(process.env.FRAMEIO_TOKEN);

// ============================================
// Health Check Endpoint
// ============================================
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Frame.io Actions API',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// API Health Check
app.get('/api/health', async (req, res) => {
    let frameioStatus = false;

    // Test Frame.io connection
    if (process.env.FRAMEIO_TOKEN) {
        try {
            await frameio.getMe();
            frameioStatus = true;
        } catch (error) {
            console.error('Frame.io connection failed:', error.message);
        }
    }

    res.json({
        status: 'healthy',
        frameioConnected: frameioStatus,
        tokenConfigured: !!process.env.FRAMEIO_TOKEN
    });
});

// ============================================
// Test Endpoint: Get User Info
// ============================================
app.get('/api/test/me', async (req, res) => {
    try {
        const user = await frameio.getMe();

        res.json({
            success: true,
            message: '✅ Frame.io API connection successful!',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                account_id: user.account_id
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '❌ Frame.io API connection failed',
            error: error.message,
            details: error.response?.data || null
        });
    }
});

// ============================================
// Action 1: Batch Rename Videos
// ============================================
app.post('/rename-videos', async (req, res) => {
    const { resource } = req.body;
    const folderId = resource.id;

    try {
        console.log(`Starting to renumber folder: ${folderId}`);

        // 1. Get all assets in the folder
        const assets = await frameio.getChildren(folderId);

        // 2. Filter only video files
        const videoAssets = assets.filter(asset =>
            asset.type === 'file' &&
            asset.filetype &&
            asset.filetype.startsWith('video/')
        );

        console.log(`Found ${videoAssets.length} video files`);

        // 3. Rename in order
        for (let i = 0; i < videoAssets.length; i++) {
            const asset = videoAssets[i];
            const oldName = asset.name;
            const extension = oldName.split('.').pop();
            const newName = `${String(i).padStart(2, '0')}.${extension}`;

            // Update asset name
            await frameio.updateAsset(asset.id, {
                name: newName
            });

            console.log(`✓ ${oldName} → ${newName}`);
        }

        // 4. Return success message
        res.json({
            type: "message",
            title: "✅ Renumbering Complete!",
            description: `Successfully renumbered ${videoAssets.length} videos to:\n00, 01, 02, 03...`
        });

    } catch (error) {
        console.error('Renumbering failed:', error);
        res.json({
            type: "message",
            title: "❌ Renumbering Failed",
            description: error.message
        });
    }
});

// ============================================
// Action 2: Create Secure Share Link
// ============================================
app.post('/secure-share', async (req, res) => {
    const { resource } = req.body;
    const assetId = resource.id;

    try {
        console.log(`Creating secure share for video: ${assetId}`);

        // 1. Generate random password
        const crypto = require('crypto');
        const password = crypto.randomBytes(6)
            .toString('base64')
            .slice(0, 8)
            .replace(/[+/=]/g, 'x');

        console.log(`Generated password: ${password}`);

        // 2. Create share link
        const shareLink = await frameio.createReviewLink(assetId, {
            name: `Secure Share - ${new Date().toLocaleDateString('en-US')}`,
            password: password,
            watermark_enabled: true,
            allow_approvals: true,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        });

        console.log(`Share link created: ${shareLink.short_url}`);

        // 3. Add comment record in Frame.io
        await frameio.createComment({
            asset_id: assetId,
            text: `🔒 Secure share link created\n` +
                `Password: ${password}\n` +
                `Link: ${shareLink.short_url}\n` +
                `Expiration: ${new Date(shareLink.expires_at).toLocaleDateString('en-US')}`
        });

        // 4. Return to Frame.io UI
        res.json({
            type: "message",
            title: "✅ Secure Share Link Created!",
            description: `
🔗 Link: ${shareLink.short_url}
🔑 Password: ${password}
📅 Valid for: 7 days
🔒 Watermark enabled

Link and password recorded in comments
      `.trim()
        });

    } catch (error) {
        console.error('Share creation failed:', error);
        res.json({
            type: "message",
            title: "❌ Share Creation Failed",
            description: error.message
        });
    }
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

// 404 handling
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.url} not found`
    });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Backend API running on http://localhost:${PORT}`);
    console.log(`📝 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;