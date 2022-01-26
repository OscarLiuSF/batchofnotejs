const { login, createReadStream, executeAnonymous } = require("./promisify-js-force");
const _ = require("lodash");

(async () => {
    await login("./userSetting.json", "devOrg", "oscar.liu@ef.com");
    console.log("success");
    console.time("data-fix");

    const soql = `SELECT Id, Description FROM Task limit 10`;

    let i = 0;
    for await (const { records } of createReadStream(soql)) {
        console.log("All roles" + records.length);

        for (const chunk of _.chunk(records, 1)) {
            console.log("i=" + i++);
            let descStr = "Decs " + i;
            console.log("Id=" + Id);
            console.time(Id);
            try {
                const result = await executeAnonymous(genApexCode(Id, descStr));
                console.log("result=" + JSON.stringify(result));
            } catch (e) {
                console.error(e);
            }
            console.timeEnd(Id);
        }
    }

    console.timeEnd("data-fix");
})();

const genApexCode = (taskId, descStr) => {
    return `
    
    String taskId = '${taskId}';
    String descStr = '${descStr}';
    Task tk = [Select Id, Description FROM Task Where Id =:taskId  limit 1 ];
    tk.Description = descStr;
    update tk;

    `;
};
