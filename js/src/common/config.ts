/**
 * Default Configuration for Client1 Header Advertisement Extension
 * 
 * Provides fallback values when settings are not configured in admin panel
 */

export const defaultConfig = {
  ui: {
    // Default header icon/brand logo configuration
    headerIcon: {
      url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iIzQzNzNkZSIvPgo8cGF0aCBkPSJNMTAuNjY2NyAxMGg0djJoLTR2NWgzdjJoLTV2LTlaTTE4IDEwaDN2NGwtMyAuMDAwN1YxNmgzdjJoLTV2LTZIMTY6djJoMnYtMiIgZmlsbD0iI2ZmZiIvPgo8L3N2Zz4K',
      link: '' // 默认链接为空
    },
    
    // Animation settings
    animations: {
      shockwaveDuration: '1.5s',
      shockwaveDelay: '0.5s'
    }
  },

  // Mobile device breakpoint
  mobile: {
    maxWidth: 768
  }
};

export default defaultConfig;