// server.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 8080;

// 配置 API 密钥
async function getToken() {
    return "eyJhbGciOiJIUzUxMiJ9.eyJsb2dpbl91c2VyX2tleSI6Ijc4M2Q1YTgxLTFiMGYtNGRhYi05MWIyLTc0ZmUzMDNlMTc0NCJ9.6Kucxwgqjui9B0nNAKr3TMW3jZkNGHJrRG7LHV5oNNCnetJ_35pAV8x_vsMgFaN7oZTaztGHsZPmnYMyg8YAwA"; // 替换为你的实际 API 密钥
}

// 认证中间件
const authenticate = async (req, res, next) => {
    try {
        const API_KEY = await getToken();
        const apiKey = req.headers['authorization'];
        if (apiKey === `Bearer ${API_KEY}`) {
            console.log('Authenticated', apiKey);
            next();
        } else {
            res.status(401).json({ error: 'Unauthorized' });
        }
    } catch (error) {
        console.error('Error fetching API key:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// 提供一个接口来动态获取文件信息
app.get('/api/get-file-info', authenticate, (req, res) => {
    const filePath = path.join(__dirname, 'juece');
    const fileInfo = [];

    // 递归遍历文件目录
    function traverseDirectory(dir) {
        const items = fs.readdirSync(dir, { withFileTypes: true });
        items.forEach(item => {
            const fullPath = path.join(dir, item.name);
            if (item.isDirectory()) {
                traverseDirectory(fullPath);
            } else {
                const relativePath = path.relative(fileDir, fullPath);
                fileInfo.push({
                    fileName: item.name,
                    sourceFile: relativePath
                });
            }
        });
    }

    traverseDirectory(filePath);

    // 返回文件信息
    res.json(fileInfo);
});

// 启动服务器
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
