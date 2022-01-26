const { login, createReadStream, executeAnonymous } = require("./promisify-js-force");
const _ = require("lodash");

(async () => {
    await login("../../config/userSetting.json", "live", "oscar.liu@ef.com");
    console.log("success");
    console.time("data-fix");

    const soql = `select Id, lead__r.Name, phone__c ,account__c , opportunity__c  from call_log__c 
where (account__c = null or opportunity__c = null )
and call_reason__c  = 'Lead' limit 10
`;

    let i = 0;
    for await (const { records } of createReadStream(soql)) {
        console.log("All roles" + records.length);

        for (const chunk of _.chunk(records, 1)) {
            console.log("i=" + i++);

            const { Id, Lead__r, Phone__c } = chunk[0];
            const { Name } = Lead__r;

            console.log("Id=" + Id);
            console.log("Name=" + Name);
            console.log("phone__c=" + Phone__c);

            console.time(Id);
            try {
                const result = await executeAnonymous(genApexCode(Id, Name, Phone__c));
                console.log("result=" + JSON.stringify(result));
            } catch (e) {
                console.error(e);
            }
            console.timeEnd(Id);
        }
    }

    console.timeEnd("data-fix");
})();

const genApexCode = (callLogId, leadName, phone) => {
    return `

    `;
};
