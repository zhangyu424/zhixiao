// api/index.js
// API接口统一封装

var http = require('../utils/api/http');

function API() {
  this.auth = {
    wxLogin: function(code) {
      return http.post('/auth/wxlogin', { code: code });
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
