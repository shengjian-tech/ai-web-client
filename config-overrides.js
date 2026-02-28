const { override,addLessLoader,adjustStyleLoaders  } = require('customize-cra')

const path = require('path');

const overrideEntry = (config) => {
  config.entry = {
    main: './src/popup', // the extension UI
    background: './src/background',
    content: './src/content',
    //可在启动项目的时候打开下面的注释
    // background: './src/background/background.js', 
    // content: './src/content/content.js',
    // function: './src/content/function.mjs',
    htmlcontent:  './src/content/html_content.tsx'
  }

  return config
}

const overrideOutput = (config) => {
  config.output = {
    ...config.output,
    filename: 'static/js/[name].js',
    chunkFilename: 'static/js/[name].js',
  }

  return config
}

// 配置 devServer
// const setupDevServer = (config) => {
//   config.devServer = {
//     ...config.devServer,
//     hot: true,                  // 开启热更新
//     writeToDisk: true,          // 将文件写入磁盘以供 Chrome 插件读取
//     static: path.join(__dirname, 'dist'), // 提供文件路径
//     compress: true,
//     port: 3000,
//   };
//   return config;
// };




// 添加路径别名
const addAlias = (config) => {
  config.resolve = {
    ...config.resolve,
    alias: {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'), // 添加 @ 作为 src 目录的别名
    },
  };

  return config;
};



// module.exports = {
    
//   webpack: (config) => {
//     config = override(overrideEntry, overrideOutput)(config);  // 修改 entry 和 output 配置
//     return addAlias(config);  // 添加 alias 配置
//   },
// }

// 整合所有配置
// module.exports = {
//   webpack: (config,env) => {
//     config = override(
//       overrideEntry,
//       overrideOutput,
//       addAlias,
      

//  )(config);  // 修改 entry 和 output 配置
//     //config = addAlias(config);  // 添加 alias 配置


//     return setupDevServer(config);  // 配置 devServer
//   },
// };


// 整合所有配置
// 添加Less加载器和其他插件配置
module.exports = {
  webpack: (config, env) =>
    override(
      overrideEntry,
      overrideOutput,
      addAlias,
      addLessLoader({
        lessOptions: {
          javascriptEnabled: true,  // 支持 JavaScript 代码
          localIdentName: env === 'production' ? '[hash:base64:5]' : '[path][name]__[local]', // 生产环境下使用哈希值
        },
      }),
   
  // 调整样式加载器的配置
    adjustStyleLoaders(({ use }) => {
      use.forEach((loader) => {
        if (loader.loader && loader.loader.includes('postcss-loader')) {
          loader.options = {
            postcssOptions: {
              plugins: [
                require('postcss-preset-env'),
                // 其他PostCSS插件
              ],
            },
          };
        }
      });
    }),

    )(config),

  // 配置 devServer (仅适用于 react-app-rewired)
  devServer: (configFunction) => (proxy, allowedHost) => {
    const config = configFunction(proxy, allowedHost);
    config.hot = true;
    // config.static = path.join(__dirname, "dist");
    config.compress = true;
    config.port = 3000;
      // 设置文件写入磁盘的选项
      config.devMiddleware = {
        ...config.devMiddleware,
        writeToDisk: true,  // 启用文件写入磁盘
      };

    return config;
  },
};
