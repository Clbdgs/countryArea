const fs = require('fs-extra')
const path = require('path');  

const folderPath = path.join(__dirname, 'data'); 
function flattenAdminData(data, parentCode = '') {  
    const result = [];  
  
    // 遍历当前层级的districts  
    (data.districts || []).forEach(district => {  
        // 为当前district添加parentCode并推送到结果数组中  
        const flattenedDistrict = {  
            name: district.name,  
            adcode: district.adcode,  
            parentCode: parentCode  
        };  
        result.push(flattenedDistrict);  
  
        // 如果当前district还有子districts，则递归调用  
        if (district.districts && district.districts.length > 0) {  
            result.push(...flattenAdminData(district, district.adcode));  
        }  
    });  
  
    return result;  
}  
  

 
fs.readdir(folderPath, (err, files) => {  
    if (err) throw err;  

    files.forEach(file => {  
        // 排除非JSON文件  
        if (!file.endsWith('.json')) return;  
       
        // 读取JSON文件  
        const fileName = file.split('.')[0]
        const filePath = path.join(folderPath, file);  
        const data = require(filePath); // 如果JSON文件很大，考虑使用fs.readFile和JSON.parse  
        
        // 使用flattenAdminData函数处理数据  
        const flattenedData = flattenAdminData(data);  

        // 为每条数据生成MySQL INSERT语句并执行  
        flattenedData.forEach(item => {  
            const sql = `INSERT INTO addressInfo (name, adcode, parentCode) VALUES ('${item.name}', '${item.adcode}', '${item.parentCode}');\n`;  
            fs.appendFileSync(`./sql/${fileName}.sql`, sql, { encoding: 'utf8' });
        });  
    });  
});  
 
  
  