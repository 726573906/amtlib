//九宫图查找
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const crypto = require("crypto");
const xlsx = require(`node-xlsx`);
//const jsonFile = require(`jsonfile`);
const tool = require(`./Tool`);
let rule = `
传奇UI调整规则：    
1.    
2.    
3.   
`
/**
 * 所有png信息
 * {[md5]:{scene,path,name}}
 */
let allImageUrl = {};
let libUrls = {};//{md5:[{name,scene:,path:}]};
let sceneContents = {};//对应scene的png内容
let jsonContents = {};//对应sceneContents的简单json格式
let homeContents = {};//home.md里新增的内容
let loseContents = {};//丢失内容
let xlsxDict = {};
let index = 1;
let count = 0;
let basepath = `E:/wallan2022/chuanqi/chuanqi/`;//项目根路径
let wikipath = `E:/wallan2022/chuanqi/chuanqi.wiki/`;//wiki根路径
let layabase = `E:/wallan2022/chuanqi/chuanqi/laya/assets/`;//layas的cene根路径
let solvepath = `E:/wallan2022/chuanqi/chuanqi/laya/pages/res/pages`;//laya的资源根路径

//let solvepath = `E:/wallan2022/chuanqi/roleinfo`;
let loseMD = `${wikipath}缺少资源.md`;
let libMD = `${wikipath}公共库资源.md`;
/**
 * 
 * 0. md文件
 * ui替换规则
 * 
 * md 文件1
 * 1.输出 scene所包含的png 对应的路径和图片名称
 * 2.输出scene所包含的可优化png（九宫）
 * 3.丢失文件 
 * 
 * md 公共库
 * 1.所有scene所包含的重复png，使用次数和图片路径
 * 
 * md 遗漏图片
 * 1. 所有scene所使用的，但丢失的png
 * 
 * json 文件 
 * 1.对应md文件1的所有png，包括丢失文件
 *   解析成
 *   所有scene所用图片的json格式
 * 
 * 2.json替换还原资源
 * 根据json文件和以原资源的同名文件夹路径
 *  对scene的所有图片的替换
 */

//资源文件加载
solveAllFiles(solvepath);
async function solveAllFiles(baseDir) {
    const unsolved = fs.readdirSync(baseDir);
    for (let cur of unsolved) {
        await check(cur, baseDir);
    }
    await showLog();
}
async function showLog() {
    //mdUIRule(rule);
    //solveXlsx();

    for (let path in sceneContents) {
        let str = sceneContents[path];
        if (notHandle(path) && str) {
            // path = checkMDName(path);
            if (path) {
                fs.writeFileSync(path, str);
                console.log(`${path}写入成功`);
                continue;
            }
        }
    }
    // for (let path in jsonContents) {
    //     let str = jsonContents[path];
    //     solveJson(path, str);
    // }
    // for (let url in homeContents) {
    //     let data = homeContents[url];
    //     url = checkMDName(url);
    //     fs.appendFileSync(url, data);//TODO...暂时先不在home添加新内容
    // }
    // for (let url in loseContents) {
    //     //console.log(c);
    //     let data = loseContents[url];
    //     fs.writeFileSync(url, data);
    // }
    // fs.writeFileSync(libMD, ``);
    // for (let md5 in libUrls) {
    //     let arr = libUrls[md5];
    //     if (arr) {
    //         fs.appendFileSync(libMD, `\nmd5:${md5}    `);
    //         for (let i = 0; i < arr.length; i++) {
    //             const data = arr[i];
    //             fs.appendFileSync(libMD, data);
    //         }
    //     }
    // }
    console.log(`all done`);
}
function checkMDName(key) {//TODO...
    let arr = key.split(`/`);
    let mdname = arr.pop();
    if (/\.md$/i.test(mdname)) {
        let name = xlsxDict[mdname.replace(`.md`, ``)];
        if (name) {
            return key.replace(mdname, `${name}.md`);
        }
    }
    return key;
}
async function check(data, baseDir) {
    if (/\.scene$/i.test(data)) {
        let mdname = data.split(`.scene`, ``);
        setContent(`${wikipath} / home.md`, `\n[${mdname}](${mdname})     `, homeContents);
        await solveOneSceneFile(baseDir, data);
    } else {
        setContent(`${wikipath}/home.md`, `\n[${data}](${data})     `, homeContents);
        await solveChildFiles(baseDir + "/" + data);
    }
}
async function solveChildFiles(baseDir) {
    const unsolved = fs.readdirSync(baseDir);
    for (let cur of unsolved) {
        await checkChild(cur, baseDir);
    }
}
async function checkChild(data, baseDir) {
    if (/\.scene$/i.test(data)) {
        await solveOneSceneFile(baseDir, data);
    } else {
        await solveChildFiles(baseDir + "/" + data);
    }
}

function getFilePath(str) {
    let p = ``;
    if (str != solvepath) {
        p = str.replace(solvepath + `/`, ``);
    }
    return p;
}
function getMDname(str) {
    let p = getFilePath(str);
    let arr = p && p.split(`/`);
    return arr
}

function getMD5(uri, scenename) {
    //检查文件长度
    let stream = fs.createReadStream(uri);
    let md5util = crypto.createHash('md5');
    let md5;//getMD5(buffer);        
    try {
        stream.read();
    } catch (e) {
        console.log(`${uri} 流读取失败，${e.message} `);
        return;
    }
    return new Promise((resolve) => {
        stream.on("end", () => {
            md5 = md5util.digest("hex");
            resolve({ md5, uri });
        })
        stream.on("data", (data) => {
            md5util.update(data);
        });
        stream.on("error", err => {
            //console.log(uri, "发生错误", err.message);

            let c = `\n${scenename}:\n缺少资源 ${uri}    `;
            setContent(loseMD, c, loseContents);

            md5util.end();
            resolve();//还是当resolve处理
        })
    });
}

async function mkdirs(dir) {
    const paths = dir.split(`/`);//    const paths = dir.split(path.sep);
    var len = paths.length;
    if (len == 0) {
        return
    }
    var p = paths[0];
    if (!fs.existsSync(p)) {
        return
    }
    for (var i = 1, len = paths.length; i < len; i++) {
        p = path.join(p, paths[i]);
        if (fs.existsSync(p)) {
            var ret = fs.statSync(p);
            if (!ret.isDirectory()) {
                throw Error("无法创建文件夹" + p);
            }
        } else {
            fs.mkdirSync(p);
            console.log(`文件夹${p}创建成功`);
        }
    }
}

/**
 * 根据E:/wallan2022/chuanqi/file`, `Name.xlsx`
 * 将key替换成`name`用作md名称显示
 * 即 替换scene的名称为配置表中的`name`用作md名称处输入，否则使用scene的名称
 */
function solveXlsx() {
    let sheets = xlsx.parse(fs.readFileSync(path.join(`E:/wallan2022/chuanqi/file`, `Name.xlsx`)));
    for (let key in sheets) {
        let sheet = sheets[key];
        let data = sheet.data;
        if (data) {
            // let keys;
            let flag;
            for (let i = 0; i < data.length; i++) {
                const obj = data[i];
                // if (obj[0] == `前端解析`) {
                //     keys = obj;
                //     continue;
                // }
                if (obj[0] == `配置从这一行开始`) {
                    flag = true;
                }
                if (flag) {
                    xlsxDict[obj[1]] = obj[2];
                }
            }
        }
    }
}
/**
 * md文件显示ui规则
 * 
 */
function mdUIRule(rule) {
    fs.writeFileSync(path.join(wikipath, `rule.md`), rule);
}
/**
 * 1.输出 scene所包含的png 对应的路径和图片名称
 * 2.输出scene所包含的可优化png（九宫）
 * 3.丢失文件 
 */
async function solveOneSceneFile(baseDir, scenename) {
    let buff = fs.readFileSync(path.join(baseDir, scenename));
    if (buff) {
        index = 1;
        let json = JSON.parse(buff);
        let child = json.child;
        if (child && child.length > 0) {
            await solveChild(child, baseDir, scenename);
        }
    }
}
async function solveChild(child, baseDir, scenename) {
    for (let i = 0; i < child.length; i++) {
        const c = child[i];
        await checkSceneChild(c, baseDir, scenename);
    }
}
async function checkSceneChild(child, baseDir, scenename) {
    let c = child.child;
    if (c && c.length > 0) {
        await solveChild(c, baseDir, scenename);
    } else {
        if (child && child.props) {
            let skin = child.props.skin;
            if (skin) {
                if (/.png/i.test(`.png`)) {
                    let imgPath = layabase + `${skin}`;
                    const result = await getMD5(imgPath, scenename);
                    if (result) {
                        await solveOneImage(result.md5, imgPath, scenename, baseDir);
                        //console.log(`${count++} ` + `: ` + result.md5);
                    }
                    //console.log(`${count++} ` + imgPath);
                }
            }
        }
    }
}
/**
 * 
 * @param {*} md5 
 * @param {*} imgPath 
 * @param {*} scenename 
 * @param {*} baseDir 
 */
async function solveOneImage(md5, imgPath, scenename, baseDir) {
    let p1 = ``;
    if (baseDir != solvepath) {
        p1 = baseDir.replace(solvepath + `/`, ``);
    }
    let basePathArr = p1.split(`/`);//相对路径arr
    let base;
    if (basePathArr.length == 1) {
        base = `${wikipath}res`;//根目录创建在home.md内，特殊处理res文件
    } else {
        base = `${wikipath + p1}/res`;//md同级下创建res
    }
    if (!fs.existsSync(base)) {
        await mkdirs(base);
    }
    let pathArr = imgPath.split(`/`);
    let pngname = pathArr.pop();//xxx.png
    //let pngUri = base + `/` + md5 + `/` + `${pngname}`;
    let pngUri = base + `/` + md5 + `.png`;//用md5作为图片的name;
    let wkbase = `res` + `/` + md5 + `.png`;//wiki相对路径
    fs.copyFileSync(imgPath, pngUri);//创建图片
    let imgArr = pngname.split(`.`);//[xxx,png],取xxx来创建md
    let imgName = imgArr[0];
    let sceneStr = `\n#### ${scenename}     `;//起始位置
    let str1 = getFilePath(baseDir);
    if (str1) {
        sceneStr += `\n##### ${str1}     `;
    }

    let oldPath = imgPath.replace(basepath, ``);
    let imgUrl = allImageUrl[md5];
    let hasImage = false;
    if (imgUrl && imgUrl.md5 == md5) {
        hasImage = true;
    } else {
        let type = await imageFilter(imgPath);
        let str1 = getTypeStr(type);
        // if (type == 0) {
        //     sceneStr += `\n${index++ + `.`}` + `${pngname}    `
        //         + str1
        //         + `\n资源路径 ` + `${oldPath}    `;
        // } else {
        sceneStr +=
            `\n${index++ + `.`}` + `${pngname}    `
            + str1
            + `\n资源路径 ` + `${oldPath}    `
            + `\n![${imgName}]` + `(${wkbase})    `;//图片相关
        // }
    }
    let scene;
    let arr = getMDname(baseDir);
    let len = arr && arr.length;
    let mdname;
    let jsonObj = { pngname, imgPath };
    if (len > 1) {
        let dirout = `${wikipath}${p1}`;
        if (!fs.existsSync(dirout)) {
            await mkdirs(dirout);
        }
        let s = arr[0];
        scene = arr.pop();
        setContent(`${wikipath}${s}.md`, `\n[${scene}](${p1 + `/` + scene})    `, sceneContents);
        if (p1) {
            mdname = `${dirout}/${scene}`;
        } else {
            mdname = `${wikipath}${scene}`;
        }
    } else {
        if (p1) {
            scene = arr[0];
        } else {
            scene = scenename.replace(`.scene`, ``);
        }
        mdname = `${wikipath}${scene}`;
    }
    if (hasImage && imgUrl.scene != scene) {
        sceneStr = `\n相同资源${imgName}:[${imgUrl.scene}](${imgUrl.mdp})    `;
    }
    setContent(`${mdname}.md`, sceneStr, sceneContents);
    setJson(`${mdname}`, jsonObj, jsonContents);
    checkMD5(md5, scene, imgName, imgPath, mdname);
}

function checkMD5(md5, scene, imgName, imgPath, mdname) {
    let imgUrl = allImageUrl[md5];
    if (imgUrl) {
        if (imgUrl.scene != scene) {
            let lib = libUrls[md5];
            if (!lib) {
                libUrls[md5] = lib = [];
            }
            let c = `\n#### ${scene}     
            \n名称 ${imgName}       
            \n图片路径 ${imgPath}      
            `
            let flag = true;
            if (lib) {
                for (let i = 0; i < lib.length; i++) {
                    const content = lib[i];
                    if (content == c) {
                        flag = false;
                        break;
                    }
                }
            }
            if (flag) {
                lib.push(c);
            }
        }
    } else {
        let mdp = mdname.replace(wikipath, ``);
        allImageUrl[md5] = { scene, path: imgPath, name: imgName, md5, mdp };
    }
}

function getTypeStr(type) {
    switch (type) {
        case 1:
            return `\n\`需要九宫\`    `;
        case 2:
            return `\n\`需要特殊关注\`    `;
        default:
            return `\n\`只需要替换，不需要改变尺寸\`    `;
    }
}

function setContent(filePath, newContent, dict) {
    let str = dict[filePath];
    if (!str) {
        str = dict[filePath] = '';
    }
    if (str.indexOf(newContent) == -1) {
        dict[filePath] += newContent;
    }
}
function setJson(filePath, obj, dict) {
    let objArr = dict[filePath];
    if (!objArr) {
        dict[filePath] = objArr = [];
    } else {
        for (let i = 0; i < objArr.length; i++) {
            const o = objArr[i];
            if (obj == o) {
                return;
            }
        }
    }
    objArr.push(obj);
}
/**
 *  对应md文件1的所有png，包括丢失文件
 *  解析成
 *  所有scene所用图片的json格式
 */
/**
 * 
 * scene
 * 
 * 1.png
 * 2.资源路径： laya/assets/res/ui/image/other/cailiaofuben/img_1.png     
 * 3.丢失的图片
 * 4.是否可以公共库的图片
 * 
 */
function solveJson(key, str) {
    let p = key.replace(`chuanqi.wiki`, `json`);
    let arr = p.split(`/`);
    if (!fs.existsSync(p)) {
        mkdirs(p);
    }
    let data = JSON.stringify(str);
    fs.writeFileSync(`${p}/${arr.pop()}.json`, data);
}
let jsonPath = `E:/wallan2022/chuanqi/json`;
let newUIPath = `E:/wallan2022/chuanqi/ui`;
//recoverImage(jsonPath);
async function recoverImage(basePath) {
    if (fs.existsSync(basePath)) {
        let dirs = fs.readdirSync(basePath);
        for (let key of dirs) {
            await checkRecover(key, basePath);
        }
    }
}
async function checkRecover(dir, basePath) {
    let p = path.join(basePath, dir);
    if (/\.json/i.test(dir)) {
        let data = fs.readFileSync(p);
        let images = JSON.parse(data);
        if (images) {
            for (let i = 0; i < images.length; i++) {
                const image = images[i];
                await recoverOneImage(image);
            }
        }
        console.log(str);
    } else {
        await recoverImage(p);
    }
}
async function recoverOneImage(image) {
    const { pngname, imgPath } = image;
    let arr = imgPath.split(`/`);
    let p = path.join(newUIPath, arr.pop());
    if (fs.existsSync(p)) {
        fs.copyFileSync(p, imgPath);
        console.log(`${pngname}:\n${imgPath}成功替换`);
    } else {
        console.log(`${newUIPath + "路径下\n" + imgPath}找不到了`);
    }
}
/**
 * 0不需要处理
 * 1可以九宫
 * 2特殊关注
 * @returns 
 */
async function imageFilter(imgPath) {
    let bool = await tool.checkImage(imgPath);
    return +bool;
    //return 1;//TODO...全生产用于查看
}
let scenes = {
    [`activityhall.md`]: true,
    [`adv.md`]: true,
    [`backpack.md`]: true,
    [`boot.md`]: true,
    [`bosssum.md`]: true,
    [`btnTask.md`]: true,
    [`camp.md`]: true,
    [`cangyue.md`]: true,
    [`changeJob.md`]: true,
    [`chat.md`]: true,
    [`common.md`]: true,
    [`config.md`]: true,
    [`create.md`]: true,
    [`crossKingCity.md`]: true,
    [`crossXl.md`]: true,
    [`currency.md`]: true,
    [`dragon.md`]: true,
    [`duanzao.md`]: true,
    [`expBaoping.md`]: true,
    [`famous.md`]: true,
    [`fashion.md`]: true,
    [`fenghao.md`]: true,
    [`forge.md`]: true,
    [`forging.md`]: true,
    [`func.md`]: true,
    [`godChange.md`]: true,
    [`guaji.md`]: true,
    [`guide.md`]: true,
    [`guild.md`]: true,
    [`happyquestion.md`]: true,
    [`head.md`]: true,
    [`hecheng.md`]: true,
    [`hefuHall.md`]: true,
    [`huangjinzhuanpan.md`]: true,
    [`jieyi.md`]: true,
    [`kaifuactivity.md`]: true,
    [`kingcity.md`]: true,
    [`kuafu.md`]: true,
    [`lockScreen.md`]: true,
    [`longhuangmibao.md`]: true,
    [`longzhuang.md`]: true,
    [`mafarongyao.md`]: true,
    [`magicsword.md`]: true,
    [`main.md`]: true,
    [`mall.md`]: true,
    [`map.md`]: true,
    [`meinvpintu.md`]: true,
    [`mogong.md`]: true,
    [`newTreasure.md`]: true,
    [`notice.md`]: true,
    [`npc.md`]: true,
    [`nsa.md`]: true,
    [`offerreward.md`]: true,
    [`official.md`]: true,
    [`oldGodEquip.md`]: true,
    [`privilege.md`]: true,
    [`rank.md`]: true,
    [`recharge.md`]: true,
    [`region.md`]: true,
    [`robRedBag.md`]: true,
    [`role.md`]: true,
    [`ronglu.md`]: true,
    [`sellGuild.md`]: true,
    [`shengdian.md`]: true,
    [`shenmo.md`]: true,
    [`shenyu.md`]: true,
    [`shikonghuanjing.md`]: true,
    [`sixiangshendian.md`]: true,
    [`sixiangUnlock.md`]: true,
    [`slayer.md`]: true,
    [`social.md`]: true,
    [`sports.md`]: true,
    [`stronger.md`]: true,
    [`tianMing.md`]: true,
    [`tips.md`]: true,
    [`TreasureDragon.md`]: true,
    [`webmain.md`]: true,
    [`welcome.md`]: true,
    [`welfarehall.md`]: true,
    [`worldBoss.md`]: true,
    [`worldFamous.md`]: true,
    [`xilian.md`]: true,
    [`yabiao.md`]: true,
    [`zbdh.md`]: true,
    [`zhanzhen.md`]: true,
    [`zhenying.md`]: true,
    [`zhuansheng.md`]: true,
    [`zuwu.md`]: true,
};
function notHandle(path) {
    // let p = path.split(`/`);
    // let scenename = p.pop();
    // let flag = !scenes[scenename];
    // if (!flag) {
    //     console.log(`${scenename}已过滤不在覆盖生成`);
    // }
    return true;//TODO...
}
