

const axios = require('axios')
const cheerio = require('cheerio');
const fs = require('fs')

const webUrl = 'https://www.stats.gov.cn/sj/tjbz/tjyqhdmhcxhfdm/2023/44.html'; 

function concatenateUrls(baseUrl, subUrl) {  
    
    // 去除最后一个'/'后的所有内容
    const correctedBaseUrl = baseUrl.replace(/[^\/]+$/, '')

    // 确保baseUrl以'/'结尾，如果不以'/'结尾，则添加一个  
    if (!correctedBaseUrl.endsWith('/')) {  
        correctedBaseUrl += '/';  
    }  
      
    // 拼接URL  
    const fullUrl = correctedBaseUrl + subUrl;  
      
    return fullUrl;  
}  

// 去重
function qc(array) {
    const uniqueArray = [...new Set(array)];  
    return uniqueArray
}
  
const getArea = (url) => {
    return new Promise(async (resolve,reject) => {
    try {
        const { data } = await axios.get(url, { 
            responseType:"json",
            timeout: 50000
        })
        let $ = cheerio.load(data)
        let cityList = []
        let links = []
        $('tr').map(function(parentIndex, el) {
            if (['citytr', 'countytr', 'towntr'].includes($(el).attr('class'))) {
                let arr = []
                $(el).children().each((chiIndex, elm) => {
                    let link = $(elm).find('a').attr('href')
                    arr.push($(elm).text())
                    if (link) {
                        links.push(concatenateUrls(url, link))
                    }
                })
                cityList.push(arr)
            } 
            if ($(el).attr('class') == 'villagetr') {
                let arr = []
                $(el).children().each((chiIndex, elm) => {
                    arr.push($(elm).text())
                })
                cityList.push(arr)
            }
        })
        cityList = cityList.map(el=> {
            if (el.length == 2) {
                return {
                    code: el[0],
                    name: el[1],
                }
            }
            return {
                code: el[0],
                type: el[1],
                name: el[2],
            }
        })
        if (cityList[0]?.code) {
            fs.writeFile(`./${cityList[0].code}.json`, JSON.stringify(cityList), async (error)=> {
                if (error) {
                    throw error
                }
                resolve(true)
                const filtersLinks = qc(links)
                if (filtersLinks[0]) {
                    for (const link of filtersLinks) {
                        const result = await getArea(link)
                        if (!result) {
                            throw new Error(`HTTP error!`);
                        }
                    }
                }
            })
        }
    } catch (error) {
        throw error
    }
})
}

getArea(webUrl)



