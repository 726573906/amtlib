

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const { time, Console } = require("console");


const maxGrayGap = 3;

/**
 * 像素采样间隔
 */
const pixGap = 2;

/**
 * 可拉伸区域的宽高的最小值
 */
const minArea = 50;


// checkImage("C:/Users/rx/Desktop/img_leftBg.png");

// checkAllImage("D:/laya/mylaya/myLaya/laya/assets/res/ui/image/other/nsa/zhanling");

// checkAllImage("D:/laya/mylaya/myLaya/laya/assets/res/ui/image/other/duanzao/shengxing/new");

// checkAllImage("D:/laya/mylaya/myLaya/laya/assets/res/ui/image/other/duanzao/baoshi");
// checkAllImage("D:/laya/mylaya/myLaya/laya/assets/res/ui/image/other/fulizhuanpan");
// checkAllImage("D:/laya/mylaya/myLaya/laya/assets/res/ui/image/other/gongnengyugao");
// checkAllImage("D:/laya/mylaya/myLaya/laya/assets/res/ui/image/other/guanggao/new");
// checkAllImage("D:/laya/mylaya/myLaya/laya/assets/res/ui/image/boot");
// checkAllImage("D:/laya/mylaya/myLaya/laya/assets/res/ui/image/other/mall/new");


async function checkAllImage(dir) {
    let files = fs.readdirSync(dir);
    let j = 0;
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (/\.png$/i.test(file)) {
            files[j++] = file;
        }
    }
    if (j > 0) {
        for (let i = 0; i < j; i++) {
            const file = files[i];
            await checkImage(path.join(dir, file));
        }
    }

}

module.exports.checkImage = checkImage;


async function checkImage(imgPath) {
    const img = sharp(imgPath);

    const { info: { width, height }, data } = await img.raw().toBuffer({ resolveWithObject: true });
    // console.log(width,height,data);
    // img.greyscale().toFile("C:/Users/rx/Desktop/imgNameBg_cj1.png");

    // const cx = ~~(width/2);
    // const cy = ~~(height/2);
    //图片中心点的灰度值，默认中心点在九宫区域里面
    // const cGray = getGray(cx,cy);
    // for(let i=0;i<width;i++){
    //     for(let j=0;j<height;j++){
    //         console.log(getGray(i,j));
    //     }
    // }
    // let startT = Date.now();
    let imgSquare = width * height;
    if (imgSquare < 900) {
        return false;
    }
    let x = ~~(width / 2);
    let y = ~~(height / 2);

    // for(let i=0;i<height/2;i++){
    //     getGray(x,y+i);
    // }

    // findVerticalRect(x,y);
    return !!(findHorizonRect(x, y) || findVerticalRect(x, y));
    // findRect();
    // findHorizonRect(~~(width/2),~~(height/2));
    // console.log("消耗时间："+(Date.now()-startT));




    // /**
    //  * 一个矩形范围内是否符合可以九宫格横向拉伸
    //  */
    // function checkRectHorizon(x,y,w,h){

    //     if(w==0||h==0){
    //         return true;
    //     }
    //     let halfH = Math.round(h/2);
    //     if(checkLine(x,y+halfH,x+w,y+halfH)){

    //         if(checkRectHorizon(x,y+halfH,w,halfH)){
    //             return checkRectHorizon(x,y,w,halfH);
    //         }else{
    //             return false;
    //         }
    //     }
    //     return false;

    // }

    // /**
    //  * 一个矩形范围内是否符合可以九宫格纵向拉伸
    //  */
    // function checkRectVertical(x,y,w,h){

    //     if(w==0||h==0){
    //         return true;
    //     }
    //     let halfH = Math.round(h/2);
    //     if(checkLine(x,y+halfH,x+w,y+halfH)){

    //         if(checkRectVertical()){
    //             return
    //         }else{
    //             return false;
    //         }
    //     }
    //     return false;

    // }



    // /**
    //  * 一条线上灰度变化是否符合九宫条件
    //  * @param {*} sx 
    //  * @param {*} sy 
    //  * @param {*} ex 
    //  * @param {*} ey 
    //  */
    // function checkLine(sx,sy,ex,ey){

    //     let startV = getGray(sx,sy);
    //     let endV = getGray(ex,ey);
    //     if(Math.abs(endV-startV)>maxGrayGap){
    //         //如果首位灰度值相差比较大 判断是否是线性渐变
    //         return isLinear(sx,sy,ex,ey);
    //     }else{

    //     }

    // }

    // /**
    //  * 是否是线性渐变
    //  * @param {*} sx 
    //  * @param {*} sy 
    //  * @param {*} ex 
    //  * @param {*} ey 
    //  */

    // function isLinear(sx,sy,ex,ey){
    //     let startV = getGray(sx,sy);
    //     let endV = getGray(ex,ey);
    //     let mx = Math.round((sx+ex)/2);
    //     let my = Math.round((sy+ey)/2);
    //     let midV = getGray(mx,my);
    //     let dis = (ex-sx)||(ey-sy);
    //     if(dis>0){
    //         if((midV-startV)*2/dis-(endV-midV)*2/dis >88){
    //             return false;
    //         }else{
    //             if(isLinear(sx,sy,mx,my)){
    //                 return isLinear(mx,my,ex,ey);
    //             }else{
    //                 return false;
    //             }
    //         }
    //     }
    //     return true;

    // }

    /**
     * 取像素灰度值
     */
    function getGray(x, y) {
        let startIdx = (y * width + x) * 4;
        let a = data[startIdx + 3];
        if (a !== 0) {
            let r = data[startIdx];
            let g = data[startIdx + 1];
            let b = data[startIdx + 2];
            // console.log((r*30+g*59+b*11)/100);
            return (r * 30 + g * 59 + b * 11) / 100;
        }

    }

    /**
     * 以坐标x，y为中心，寻找可横向拉伸的区域
     * @param {*} x 
     * @param {*} y 
     */
    function findHorizonRect(cx, cy) {
        let cLine = calcHorizonLine(cx, cy);
        if (!cLine) {
            return;
        }

        let y = cy;
        count = 0;

        while (y <= height) {
            let line = calcHorizonLine(cx, y);
            if (!line || !checkLine(cLine, line)) {
                break;
            }
            count++;
            y = cy + count * pixGap;
        }
        let maxY = Math.min(y, height);

        y = cy;
        count = 0;
        while (y >= 0) {
            let line = calcHorizonLine(cx, y);
            if (!line || !checkLine(cLine, line)) {
                break;
            }
            count++;
            y = cy - count * pixGap;

        }
        let minY = Math.max(0, y);

        let w = cLine.maxX - cLine.minX;
        let h = maxY - minY;

        if (checkRect(w, h)) {
            console.log(imgPath);
            return true;
        }
        return false;

    }

    /**
     * 以坐标x，y为中心，寻找可纵向拉伸的区域
     * @param {*} x 
     * @param {*} y 
     */
    function findVerticalRect(cx, cy) {

        let cLine = calcVerticalLine(cx, cy);
        if (!cLine) {
            return;
        }

        let x = cx;
        count = 0;

        while (x <= width) {
            let line = calcVerticalLine(x, cy);
            if (!line || !checkLine(cLine, line)) {
                break;
            }
            count++;
            x = cx + count * pixGap;
        }
        let maxX = Math.min(x, width);

        x = cx;
        count = 0;
        while (x >= 0) {
            let line = calcVerticalLine(x, cy);
            if (!line || !checkLine(cLine, line)) {
                break;
            }
            count++;
            x = cx - count * pixGap;

        }
        let minX = Math.max(0, x);

        let h = cLine.maxY - cLine.minY;
        let w = maxX - minX;

        if (checkRect(w, h)) {
            console.log(imgPath);
            return true;
        }
        return false;
    }


    /**
     * 获取的可拉伸区域是否符合条件
     * @param {*} rectW 
     * @param {*} rectH 
     * @returns 
     */
    function checkRect(rectW, rectH) {

        let square = rectW * rectH;

        if (rectW < 10 || rectH < 10 || square < 400) {
            //可九宫尺寸太小
            return false;
        }
        if (rectH < height / 4 || rectW < width / 4) {
            return false;
        }
        if (rectH < height / 2 && rectW < width / 2) {
            return false;
        }
        if (square < imgSquare / 9) {
            return false;
        }
        if (height < 100 && width < 100 && square < imgSquare / 3) {
            //尺寸小于100的图片必须九宫面积足够大
            return false;
        }
        if (width / height > 5 && height < 50 && square < imgSquare / 3) {
            //细长横条纹
            return false;
        }

        if (height / width > 5 && width < 50 && square < imgSquare / 3) {
            //细长树条纹
            return false;
        }
        return true;
    }


    /**
     * check线段是否在标准线段的一定误差范围内
     * @param {*} controlLine 对照的标准线段
     * @param {*} testLine 测试线段
     */
    function checkLine(controlLine, testLine) {
        let { minX, maxX } = controlLine;
        // return Math.abs(testLine.minX-minX)<10&&Math.abs(testLine.maxX-maxX)<10;
        // console.log(testLine);
        return testLine;
    }

    /**
     * 以sx，sy为考察点，获取可水平拉伸的线段
     * @param {*} sx 
     * @param {*} sy 
     */
    function calcHorizonLine(sx, sy) {

        let sGray = getGray(sx, sy);
        let controlGray = sGray;
        if (controlGray === undefined) {
            return;
        }

        let x = sx;
        let count = 0;
        while (x <= width) {
            let gray = getGray(x, sy);
            if (gray !== undefined && Math.abs(controlGray - gray) < 8) {
                count++;
                x = sx + count * pixGap;
                controlGray = gray;
            } else {
                break;
            }
        }
        let maxX = Math.min(x, width);

        count = 0;
        x = sx;
        controlGray = sGray;
        while (x >= 0) {
            let gray = getGray(x, sy);
            if (gray !== undefined && Math.abs(controlGray - gray) < 8) {
                count++;
                x = sx - count * pixGap;
                controlGray = gray;
            } else {
                break;
            }
        }
        let minX = Math.max(x, 0);

        if (maxX - minX > 20) {
            return { minX, maxX };
        }
    }

    /**
     * 以sx，sy为考察点，获取可垂直拉伸的线段
     * @param {*} sx 
     * @param {*} sy 
     */
    function calcVerticalLine(sx, sy) {

        let sGray = getGray(sx, sy);
        let controlGray = sGray;
        if (controlGray === undefined) {
            return;
        }

        let y = sy;
        let count = 0;
        while (y <= height) {
            let gray = getGray(sx, y);
            if (gray !== undefined && Math.abs(controlGray - gray) < 8) {
                count++;
                y = sy + count * pixGap;
                controlGray = gray;
            } else {
                break;
            }
        }
        let maxY = Math.min(y, height);

        count = 0;
        y = sy;
        controlGray = sGray;
        while (y >= 0) {
            let gray = getGray(sx, y);
            if (gray !== undefined && Math.abs(controlGray - gray) < 8) {
                count++;
                y = sy - count * pixGap;
                controlGray = gray;
            } else {
                break;
            }
        }
        let minY = Math.max(y, 0);

        if (maxY - minY > 20) {
            return { minY, maxY };
        }
    }



    /**
     * 计算线性变化的线段(灰度值线性变化)
     */
    function calcLinearLine(y) {
        //向左或者向右只要有一边是线性变化即可
        let x = cx;
        let count = 0;
        while (checkLineal(x, y, x + pixGap * 2, y)) {
            count++;
            x = cx + pixGap * count;
            if (x > width) {
                break;
            }
        }
        x = Math.min(x, width);
        if (x - cx > minArea) {
            //如果向右符合线性变化
            return { minX: 2 * cx - x, maxX: x };

        } else {
            //再检测左边
            let x = cx;
            let count = 0;
            while (checkLineal(x, y, x - pixGap * 2, y)) {
                count++;
                x = cx - pixGap * count;
                if (x < 0) {
                    break;
                }
            }
            x = Math.max(0, x);
            if (cx - x > minArea) {
                return { minX: x, maxX: 2 * cx - x };
            }
        }

    }

    /**
     * 两个像素灰度值是不是线性变化
     * @param {*} sx 
     * @param {*} sy 
     * @param {*} ex 
     * @param {*} ey 
     */
    function checkLineal(sx, sy, ex, ey) {
        let mx = (sx + ex) / 2;
        let my = (sy + ey) / 2;
        sgray = getGray(sx, sy);
        mGray = getGray(mx, my);
        eGray = getGray(ex, ey);
        return Math.abs(sgray + eGray - 2 * mGray) < maxGrayGap;
    }



}