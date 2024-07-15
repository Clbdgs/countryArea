const axios = require('axios')
const fs = require('fs-extra')
const webUrl =
  "https://geo.datav.aliyun.com/areas_v3/bound/geojson?code=100000_full";
const baseUrl = "https://geo.datav.aliyun.com/areas_v3/bound/geojson?code=";
const getArea = (url, fileName) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { data } = await axios.get(url, {
        responseType: "json",
        timeout: 5000,
      });
      let arr = [];
      const features = data.features;
      features.forEach((el) => {
        const { name, adcode, parent, level, childrenNum } = el.properties;
        arr.push({
          name,
          code: adcode,
          parentCode: parent?.adcode !== 100000 ? parent?.adcode : null,
          level,
          childrenNum
        });
      });
      // 判断文件是否存在
      if (fs.existsSync(`./${fileName}.json`)) {
        resolve(true)
        for (const item of arr) {
            if (item.childrenNum !== 0 && item.code !== ) {
                const result = await getArea(
                    `https://geo.datav.aliyun.com/areas_v3/bound/geojson?code=${item.code}_full`,
                    item.name
                );
                if (!result) {
                    throw new Error(`HTTP error!`);
                }
            }
        }
        return
      }
      fs.writeFile(`./${fileName}.json`, JSON.stringify(arr), async (error) => {
        if (error) {
          throw new Error(`写入文件失败 error! ${error}`);
        }
        resolve(true);
        for (const item of arr) {
            if (item.childrenNum !== 0) {
                const result = await getArea(
                    `https://geo.datav.aliyun.com/areas_v3/bound/geojson?code=${item.code}_full`,
                    item.name
                );
                if (!result) {
                    throw new Error(`HTTP error!`);
                }
            }
        }
      });
    } catch (error) {
      throw new Error(`读取地址 ${url} 数据 error! ${error}`);
    }
  });
};

getArea(webUrl, "全国");
