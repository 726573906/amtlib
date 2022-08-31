
let fs = require(`fs`);
let sharp = require(`sharp`);
let outFile = `E:\\wallan2022\\chuanqi\\ui\\new\\bg.png`;
let url = `E:\\wallan2022\\chuanqi\\ui\\bg_4.png`;
//solveImage();
async function solveImage() {
    const img = sharp(url);
    const { data, info: { width, height, channels, size } } = await img.raw().toBuffer({ resolveWithObject: true });

    let len = size
    let buffer = new Uint8Array(len);
    for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
            for (let c = 0; c < channels; c++) {
                let idx = getIndex(i, j, width, channels);
                buffer[idx + c] = data[idx + c];
            }
        }
    }
    if (!fs.existsSync(outFile)) {
        fs.writeFileSync(outFile, ``);
        console.log(`创建图片`);
    }
    sharp(buffer, { raw: { width, height, channels } }).png().toFile(outFile);
    console.log(`success`);
}
function getIndex(i, j, width, channels) {
    return (j * width + i) * channels;
}

let per = -1;
//https://zhuanlan.zhihu.com/p/433801939
solveImage1();
async function solveImage1() {
    const img = sharp(url);
    const { data, info: { width, height, channels, size } } = await img.raw().toBuffer({ resolveWithObject: true });

    let len = size
    let buffer = new Uint8Array(len);
    let weight = -100.0;//饱和度权重
    let bright = 1.0;//亮度
    let saturation = 1.0;//对比度
    for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
            // for (let c = 0; c < channels; c++) {
            let idx = getIndex(i, j, width, channels);
            //     buffer[idx + c] = data[idx + c];
            // }

            // let r = lerp(.2125 * data[idx], data[idx] * bright, weight);
            // let g = lerp(.7154 * data[idx + 1], data[idx + 1] * bright, weight);
            // let b = lerp(.1721 * data[idx + 2], data[idx + 2] * bright, weight);

            // r = lerp(0.5, r, saturation);
            // g = lerp(0.5, g, saturation);
            // b = lerp(0.5, b, saturation);

            const { r, g, b } = getSaturation(data[idx], data[idx + 1], data[idx + 2]);

            buffer[idx] = r;
            buffer[idx + 1] = g;
            buffer[idx + 2] = b;
            if (channels == 4) {
                buffer[idx + 3] = data[idx + 3];
            }
        }
    }
    if (!fs.existsSync(outFile)) {
        fs.writeFileSync(outFile, ``);
        console.log(`创建图片`);
    }
    sharp(buffer, { raw: { width, height: height, channels } }).png().toFile(outFile);
    console.log(`success`);
}
function getIndex(i, j, width, channels) {
    return (j * width + i) * channels;
}

function getGray(r, g, b) {
    return .2125 * r + .7154 * g + .1721 * b;
}

function lerp(y1, y2, weight) {
    return y1 + (y2 - y1) * weight;
}

function getSaturation(r, g, b) {
    let rgbMax = Math.max(Math.max(r, g), b);
    let rgbMin = Math.min(Math.min(r, g), b);
    let delta = (rgbMax - rgbMin) / 255;
    if (delta == 0) {
        return { r, g, b }
    }
    let value = (rgbMax + rgbMin) / 255;
    let L = value / 2;//HSL中的L
    let S = L < .5 ? (delta / value) : delta / (2 - value);//饱和度S
    if (per >= 0) {
        let alpha;
        if (per + S >= 1) {
            alpha = S;
        } else {
            alpha = 1 - per;
        }
        alpha = 1 / alpha - 1;
        r = getColor(r, L, alpha);
        g = getColor(g, L, alpha);
        b = getColor(b, L, alpha);
    } else {
        r = getColor1(r, L, per);
        g = getColor1(g, L, per);
        b = getColor1(b, L, per);
    }
    return { r, g, b };
}
function getColor(c, L, alpha) {
    return c + c - (L * 255) * alpha;
}
function getColor1(c, L, alpha) {
    return L * 255 + (c - L * 255) * (1 + alpha);
}