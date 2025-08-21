// components/role-based-home/role-based-home.js
// 基于角色的首页组件
Component({
  properties: {
    userInfo: {
      type: Object,
      value: null
    },
    userRole: {
      type: String,
      value: 'student'
    }
  },

  data: {
    roleConfig: {
      student: {
        title: '学员首页',
        color: '#1890ff',
        icon: '👨‍🎓',
        features: ['study-report', 'personal-analysis', 'notifications']
      },
      instructor: {
        title: '层级长工作台',
        color: '#52c41a',
        icon: '👨‍🏫',
        features: ['team-overview', 'team-analysis', 'member-management', 'notifications']
      },
      manager: {
        title: '管理员控制台',
        color: '#fa8c16',
        icon: '👨‍💼',
        features: ['data-overview', 'user-management', 'data-import-export', 'system-settings']
      },
      admin: {
        title: '超级管理员',
        color: '#f5222d',
        icon: '👨‍💻',
        features: ['global-overview', 'system-management', 'organization-management', 'advanced-settings']
      }
    }
  },

  lifetimes: {
    attached() {
      this.initRoleBasedUI();
    }
  },

  observers: {
    'userRole': function(newRole) {
      this.initRoleBasedUI();
    }
  },

  methods: {
    // 初始化基于角色的UI
    initRoleBasedUI() {
      const role = this.data.userRole || 'student';
      const config = this.data.roleConfig[role];
      
      if (config) {
        this.setData({
          currentRoleConfig: config
        });
        
        // 触发父组件更新
        this.triggerEvent('roleConfigChanged', { config });
      }
    },

    // 功能导航点击
    onFeatureClick(e) {
      const feature = e.currentTarget.dataset.feature;
      const role = this.data.userRole;
      
      this.triggerEvent('featureClick', { feature, role });
    },

    // 角色切换
    onRoleSwitch() {
      this.triggerEvent('roleSwitch');
    }
  }
});
