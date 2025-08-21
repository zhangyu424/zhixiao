// api/index.js
// API接口统一封装

var http = require('../utils/api/http');

function API() {
  this.auth = {
    // 微信登录
    wxlogin: function(data) {
      return http.post('/auth/wxlogin', data);
    },
    
    // 账号密码登录
    login: function(data) {
      return http.post('/auth/login', {
        student_id: data.username,
        password: data.password
      });
    },
    
    // 刷新token
    refreshToken: function(data) {
      return http.post('/auth/refresh', data);
    },
    
    // 忘记密码
    forgotPassword: function(data) {
      return http.post('/auth/forgot-password', data);
    },
    
    // 修改密码
    changePassword: function(data) {
      return http.post('/auth/change-password', data);
    },
    
    // 获取用户信息
    getCurrentUser: function() {
      return http.get('/auth/me');
    },
    
    // 登出
    logout: function() {
      return http.post('/auth/logout');
    }
  };
  
  this.study = {
    submit: function(data) {
      return http.post('/study/submit', data);
    }
  };
}

var api = new API();

module.exports = {
  api: api
};
