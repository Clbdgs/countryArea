const axios = require('axios')
const fs = require('fs-extra')
const countryData = require('./全国.json')
const init = async () => {
    for (const item of countryData) {
        const result = await getArea(item.name)
        if (!result) {
            throw new Error('请求失败')
        }
    }
}


let key = ''
const getArea = (code) => {
    return new Promise(async(resolve, reject) => {
        try {
            const url = `https://restapi.amap.com/v3/config/district?key=${key}&keywords=${code}&subdistrict=3`
            const { data } = await axios.get(url, {
                responseType: "json",
                timeout: 5000,
            });
            JSON.stringify(data)
            // 判断文件是否存在
            if (!fs.existsSync(`./data/${code}.json`)) {
                fs.writeFile(`./data/${code}.json`, JSON.stringify(data), async (error) => {
                    if (error) {
                        reject(false)
                        throw new Error('写入文件失败')
                    }
                })
            }
            resolve(true)
        } catch (error) {
            throw new Error(`读取 ${code} 数据失败`)
        }
})
}
init()