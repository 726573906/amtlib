define(["require", "exports", "./Helper"], function (require, exports, Helper_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.checkCmdIsOK = exports.git = exports.execAsync = exports.exec = void 0;
    function exec(opt, ...args) {
        if (typeof opt === "string") {
            cmd = opt;
        }
        else {
            var { cmd, cwd, notThrowError } = opt;
        }
        const cp = nodeRequire("child_process");
        let option = { stdio: "inherit" };
        if (cwd) {
            option.cwd = cwd;
        }
        let cmdstring = `${cmd} ${args.join(" ")}`;
        Helper_1.log(`开始执行：${cmdstring}`);
        let result = cp.spawnSync(cmd, args, option);
        if (result.status && !notThrowError) {
            throw Error(`status:${result.status},${result.stderr ? result.stderr.toString() : `执行失败：\t${cmdstring}`}`);
        }
        Helper_1.log(`执行完成：${cmdstring}`);
        if (result.stdout) {
            Helper_1.log(result.stdout.toString("utf8"));
        }
        return result;
    }
    exports.exec = exec;
    async function execAsync(opt, ...args) {
        if (typeof opt === "string") {
            cmd = opt;
        }
        else {
            var { cmd, cwd, notThrowError, encoding } = opt;
        }
        let option = { stdio: "pipe" };
        if (cwd) {
            option.cwd = cwd;
        }
        let cmdstring = `${cmd} ${args.join(" ")}`;
        Helper_1.log(`开始执行：${cmdstring}`);
        let td = new TextDecoder(encoding || "utf8");
        return new Promise((resolve, reject) => {
            const cp = nodeRequire("child_process");
            let child = cp.spawn(cmd, args, option);
            child.stderr.on("data", data => {
                Helper_1.error(td.decode(data));
            });
            child.stdout.on("data", data => {
                Helper_1.log(td.decode(data));
            });
            child.on("close", (code) => {
                Helper_1.log(`执行完成：${cmdstring}`);
                if (!notThrowError && code !== 0) {
                    return reject();
                }
                resolve();
            });
        });
    }
    exports.execAsync = execAsync;
    /**
     * 执行git指令
     * @param cmd
     * @param cwd
     * @param args
     */
    function git(cmd, cwd, ...args) {
        return execAsync({ cmd: "git", cwd, notThrowError: true }, cmd, ...args);
    }
    exports.git = git;
    function checkCmdIsOK(cmd, args, cwd) {
        //检查系统是否安装了git
        const cp = nodeRequire("child_process");
        let result = cp.spawnSync(cmd, args, { encoding: "utf8", cwd });
        return result.status == 0;
    }
    exports.checkCmdIsOK = checkCmdIsOK;
});
