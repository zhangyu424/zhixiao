/**
 * HTTP请求工具
 * 基于微信小程序wx.request API
 */

// 基础配置
const BASE_URL = 'http://140.143.143.195:3000/api';
const TIMEOUT = 10000;

/**
 * HTTP请求类
 */
function HttpClient() {
  var self = this;
  self.baseUrl = BASE_URL;
  self.timeout = TIMEOUT;
}

/**
 * 通用请求方法
 */
HttpClient.prototype.request = function(options) {
  var self = this;
  
  return new Promise(function(resolve, reject) {
    var app = getApp();
    
    // 请求配置
    var requestConfig = {
      url: self.baseUrl + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      timeout: options.timeout || self.timeout,
      header: {
        'Content-Type': 'application/json',
        ...options.header
      },
      success: function(res) {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          reject(new Error('请求失败，状态码：' + res.statusCode));
        }
      },
      fail: function(error) {
        reject(error);
      }
    };

    // 添加认证头
    if (app && app.globalData && app.globalData.token) {
      requestConfig.header.Authorization = 'Bearer ' + app.globalData.token;
    }

    // 发起请求
    wx.request(requestConfig);
  });
};

/**
 * GET请求
 */
HttpClient.prototype.get = function(url, params) {
  return this.request({
    url: url,
    method: 'GET',
    data: params
  });
};

/**
 * POST请求
 */
HttpClient.prototype.post = function(url, data) {
  return this.request({
    url: url,
    method: 'POST',
    data: data
  });
};

/**
 * PUT请求
 */
HttpClient.prototype.put = function(url, data) {
  return this.request({
    url: url,
    method: 'PUT',
    data: data
  });
};

/**
 * DELETE请求
 */
HttpClient.prototype.delete = function(url) {
  return this.request({
    url: url,
    method: 'DELETE'
  });
};

// 创建实例
var http = new HttpClient();

module.exports = http;
