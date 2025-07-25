const axios = require('axios');

class WeChatService {
  constructor() {
    this.appId = process.env.WECHAT_APP_ID;
    this.appSecret = process.env.WECHAT_APP_SECRET;
  }

  /**
   * Exchange WeChat login code for session_key and openid
   * @param {string} code - The temporary login code from WeChat
   * @returns {Promise<Object>} - Session data from WeChat
   */
  async exchangeCodeForSession(code) {
    try {
      if (!this.appId || !this.appSecret) {
        throw new Error('WeChat App ID and App Secret must be configured');
      }

      const url = 'https://api.weixin.qq.com/sns/jscode2session';
      const params = {
        appid: this.appId,
        secret: this.appSecret,
        js_code: code,
        grant_type: 'authorization_code'
      };

      const response = await axios.get(url, { params });
      const data = response.data;

      if (data.errcode) {
        throw new Error(`WeChat API error: ${data.errcode} - ${data.errmsg}`);
      }

      return {
        success: true,
        openid: data.openid,
        session_key: data.session_key,
        unionid: data.unionid || null
      };
    } catch (error) {
      console.error('WeChat code exchange error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get WeChat user info using access token and openid
   * @param {string} accessToken - WeChat access token
   * @param {string} openid - WeChat openid
   * @returns {Promise<Object>} - User info from WeChat
   */
  async getUserInfo(accessToken, openid) {
    try {
      const url = 'https://api.weixin.qq.com/sns/userinfo';
      const params = {
        access_token: accessToken,
        openid: openid,
        lang: 'zh_CN'
      };

      const response = await axios.get(url, { params });
      const data = response.data;

      if (data.errcode) {
        throw new Error(`WeChat API error: ${data.errcode} - ${data.errmsg}`);
      }

      return {
        success: true,
        userInfo: data
      };
    } catch (error) {
      console.error('WeChat user info error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Validate WeChat configuration
   * @returns {boolean} - Whether WeChat is properly configured
   */
  isConfigured() {
    return !!(this.appId && this.appSecret);
  }
}

module.exports = WeChatService; 