import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const __dirname = path.resolve();

export default (env, argv = {}) => {
    const isProduction = argv.mode === 'production';

    return {
        entry: './src/main.jsx',
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: isProduction ? 'bundle.[contenthash].js' : 'bundle.js',
            clean: isProduction,
            publicPath: '/',
        },
        resolve: {
            extensions: ['.js', '.jsx']
        },
        module: {
            rules: [
                {
                    test: /\.(png|jpe?g|gif|svg)$/i,
                    type: 'asset/resource'
                },
                {
                    test: /\.jsx?$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                ['@babel/preset-env', { targets: 'defaults' }],
                                ['@babel/preset-react', { runtime: 'automatic' }]
                            ]
                        }
                    }
                },
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader']
                }
            ]
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: './index.html',
                inject: 'body'
            })
        ],
        devServer: {
            historyApiFallback: true,
            port: 5173,
            hot: true,
            proxy: [
                {
                    context: ['/api', '/user'],
                    target: 'http://localhost:3000',
                    changeOrigin: true,
                    secure: false
                }
            ]
        }
    };
};
