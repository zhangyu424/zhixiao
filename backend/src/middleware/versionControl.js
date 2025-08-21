// API版本控制中间件
const apiVersion = (req, res, next) => {
  // 从多个来源获取API版本
  const version = 
    req.headers['api-version'] ||           // Header: API-Version
    req.headers['accept']?.match(/v(\d+)/)?.[1] ||  // Accept头中的版本
    req.query.version ||                    // 查询参数: ?version=v1
    'v1';                                   // 默认版本

  // 标准化版本格式
  const normalizedVersion = version.startsWith('v') ? version : `v${version}`;
  
  // 验证支持的版本
  const supportedVersions = ['v1', 'v2'];
  if (!supportedVersions.includes(normalizedVersion)) {
    return res.status(400).json({
      error: 'Unsupported API version',
      message: `Version ${normalizedVersion} is not supported`,
      supportedVersions,
      currentVersion: 'v1'
    });
  }

  // 设置版本信息到请求对象
  req.apiVersion = normalizedVersion;
  
  // 在响应头中返回版本信息
  res.set({
    'API-Version': normalizedVersion,
    'API-Supported-Versions': supportedVersions.join(', '),
    'API-Latest-Version': 'v1'
  });

  // 版本特定的处理逻辑
  switch (normalizedVersion) {
    case 'v2':
      // v2版本的特殊处理
      req.features = {
        enhancedAuth: true,
        advancedAnalytics: true,
        realTimeUpdates: true
      };
      break;
    case 'v1':
    default:
      // v1版本的默认功能
      req.features = {
        enhancedAuth: false,
        advancedAnalytics: false,
        realTimeUpdates: false
      };
      break;
  }

  next();
};

// 弃用警告中间件
const deprecationWarning = (deprecatedVersion, sunsetDate, replacement) => {
  return (req, res, next) => {
    if (req.apiVersion === deprecatedVersion) {
      res.set({
        'X-API-Deprecated': 'true',
        'X-API-Sunset': sunsetDate,
        'X-API-Replacement': replacement,
        'Warning': `299 - "API version ${deprecatedVersion} is deprecated. Please migrate to ${replacement} before ${sunsetDate}"`
      });
    }
    next();
  };
};

// 版本兼容性检查
const checkCompatibility = (req, res, next) => {
  const userAgent = req.headers['user-agent'] || '';
  const clientVersion = req.headers['client-version'];
  
  // 客户端版本兼容性检查
  const compatibilityMatrix = {
    'v1': {
      minClientVersion: '1.0.0',
      maxClientVersion: '2.0.0'
    },
    'v2': {
      minClientVersion: '1.5.0',
      maxClientVersion: null // 无限制
    }
  };

  const versionConstraints = compatibilityMatrix[req.apiVersion];
  
  if (versionConstraints && clientVersion) {
    // 简单的版本比较（实际项目中应使用semver库）
    const isCompatible = true; // TODO: 实现版本比较逻辑
    
    if (!isCompatible) {
      return res.status(426).json({
        error: 'Client version incompatible',
        message: `Client version ${clientVersion} is not compatible with API ${req.apiVersion}`,
        requiredClientVersion: versionConstraints.minClientVersion,
        upgradeRequired: true
      });
    }
  }

  next();
};

// 版本特定的路由处理
const versionRouter = (versions) => {
  return (req, res, next) => {
    const version = req.apiVersion;
    const handler = versions[version];
    
    if (!handler) {
      return res.status(501).json({
        error: 'Version not implemented',
        message: `Version ${version} is not implemented for this endpoint`,
        availableVersions: Object.keys(versions)
      });
    }

    // 调用版本特定的处理函数
    handler(req, res, next);
  };
};

// 使用示例
const authHandlers = {
  v1: (req, res, next) => {
    // v1版本的登录逻辑
    req.authLogic = 'basic';
    next();
  },
  v2: (req, res, next) => {
    // v2版本的增强登录逻辑
    req.authLogic = 'enhanced';
    req.mfaRequired = true;
    next();
  }
};

// 导出中间件
module.exports = {
  apiVersion,
  deprecationWarning,
  checkCompatibility,
  versionRouter,
  authHandlers
};
