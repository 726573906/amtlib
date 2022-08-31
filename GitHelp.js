let cp = require(`child_process`);
/**
 * git reset --hard
 * git clean -df
 * git git fetch
 * git checkout master
 * git pull origin
 * git add
 * git commit -m
 * git push origin
 * 
 */
let cwd = `E:\\wallan2022\\chuanqi\\chuanqi.wiki`;
let option = { stdio: `pipe`, cwd };
exec();

async function exec() {
    await git(`git`, `add`, `activityhall.md`);
    await git(`git`, `commit`, `-m`, `传奇ui`);
    await git(`git`, `push`, `origin`);
}

async function git(cmd, ...args) {
    return new Promise((resolve) => {
        let cmdstring = `${cmd} ${args.join(` `)}`;
        let child = cp.spawn(cmd, args, option);

        child.stderr.on(`data`, data => {
            console.log(`stderr:`, data);
        })
        child.stdout.on(`data`, data => {
            console.log(`stdout:`, data);
        })
        child.on(`close`, () => {
            console.log(`执行完成`, cmdstring);
            resolve();
        })
    });
}