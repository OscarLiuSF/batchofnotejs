const fs = require("fs");
const path = require("path");
const jsforce = require("jsforce");
const _ = require("lodash");
const { getJWTToken } = require("salesforce-jwt-promise");
const { Readable } = require("stream");

const stream = require("stream");

const conn = new jsforce.Connection();

exports.conn = conn;
exports.login = async (userSettingPath, env = "stg", username = "sa@t.com") => {
    const userSetting = require(path.resolve(userSettingPath))[env];
    const response = await getJWTToken({
        clientId: userSetting.client_id,
        userName: username,
        audience: userSetting.login_url,
    });

    conn.initialize({
        instanceUrl: response.instance_url,
        accessToken: response.access_token,
    });
};

const query = (soql) => {
    return new Promise((resolve, reject) => {
        conn.query(soql, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

// exports.query = query;

const queryMore = (locatorUrl) => {
    return new Promise((resolve, reject) => {
        conn.queryMore(locatorUrl, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

exports.query = query;
exports.queryMore = queryMore;

exports.createReadStream = (soql) => {
    const readGenerator = async function* (soql) {
        let result = await query(soql);
        yield result;
        while (!result.done) {
            result = await queryMore(result.nextRecordsUrl);
            yield result;
        }
    };
    return Readable.from(readGenerator(soql));
};

exports.apexPost = (url, body) => {
    return new Promise((resolve, reject) => {
        conn.apex.post(url, body, function (err, res) {
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        });
    });
};

exports.updateSObjectSync = async (sobjectName, objects) => {
    let chunks = _.chunk(objects, 200);
    for (let chunk of chunks) {
        console.log(
            "chunk",
            chunk.map((obj) => obj.Id)
        );
        await new Promise((resolve, reject) => {
            conn.sobject(sobjectName).update(chunk, (err, rets) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rets);
                }
            });
        })
            .then((rets) => {
                rets.map((ret) => {
                    console.log(ret);
                });
            })
            .catch((error) => {
                console.error("failed", error);
            });
    }
};

exports.updateSObject = async (sobjectName, objects) => {
    let chunks = _.chunk(objects, 50);
    return Promise.all(
        chunks.map((chunk) => {
            console.log(
                "chunk",
                chunk.map((obj) => obj.Id)
            );
            return new Promise((resolve, reject) => {
                conn.sobject(sobjectName).update(chunk, (err, rets) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rets);
                    }
                });
            })
                .then((rets) => {
                    rets.map((ret) => {
                        // console.log(ret);
                    });
                })
                .catch((error) => {
                    console.error("failed", error);
                });
        })
    );
};

//insert
exports.insertSObject = async (sobjectName, objects) => {
    let chunks = _.chunk(objects, 50);
    return Promise.all(
        chunks.map((chunk) => {
            console.log(
                "chunk",
                chunk.map((obj) => obj.Id)
            );
            return new Promise((resolve, reject) => {
                conn.sobject(sobjectName).insert(chunk, (err, rets) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rets);
                    }
                });
            })
                .then((rets) => {
                    rets.map((ret) => {
                        // console.log(ret);
                    });
                })
                .catch((error) => {
                    console.error("failed", error);
                });
        })
    );
};

exports.executeAnonymous = (apexCode) => {
    return new Promise((resolve, reject) => {
        conn.tooling.executeAnonymous(apexCode, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
};

const { Writable } = require("stream");

const createWriteStream = (sobjectName) => {
    stream.Writable.call(this, sobjectName);
};

