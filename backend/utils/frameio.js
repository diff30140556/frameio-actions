const axios = require('axios');

class FrameioAPI {
    constructor(token) {
        this.token = token;
        this.baseURL = 'https://api.frame.io/v2';

        // 建立 axios 實例
        this.client = axios.create({
            baseURL: this.baseURL,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
    }

    // 取得使用者資訊
    async getMe() {
        const response = await this.client.get('/me');
        return response.data;
    }

    // 取得資產資訊
    async getAsset(assetId) {
        const response = await this.client.get(`/assets/${assetId}`);
        return response.data;
    }

    // 取得資料夾內的子資產
    async getChildren(assetId) {
        const response = await this.client.get(`/assets/${assetId}/children`);
        return response.data;
    }

    // 更新資產
    async updateAsset(assetId, data) {
        const response = await this.client.put(`/assets/${assetId}`, data);
        return response.data;
    }

    // 建立分享連結
    async createReviewLink(assetId, options) {
        const response = await this.client.post(`/assets/${assetId}/review_links`, options);
        return response.data;
    }

    // 建立評論
    async createComment(data) {
        const response = await this.client.post('/comments', data);
        return response.data;
    }

    // 更新評論
    async updateComment(commentId, data) {
        const response = await this.client.put(`/comments/${commentId}`, data);
        return response.data;
    }
}

module.exports = FrameioAPI;