import axios from "axios";


const harperGetMessage = (room) => {
    const dbURL = process.env.HARPERDB_URL;
    const dbPw = process.env.HARPERDB_PW;
    if( !dbURL || !dbPw) return null;

    let data = JSON.stringify({
        operation: 'sql',
        //sql: `SELECT * FROM realtime-chat-app.messages WHERE room = '${room}' LIMIT 100`,
        sql: `SELECT * FROM realtime-chat-app.messages WHERE room = '${room}' LIMIT 100`,

    });

    let config = {
        method: 'post',
        url: dbURL,
        headers: {
            'Content-Type': 'application/json',
            Authorization: dbPw
        },
        data: data
    }


    return new Promise((resolve,reject) => {
        axios(config)
            .then(function (res){
                resolve(JSON.stringify(res.data));
            })
            .catch(function (error){
                reject(error);
            })
      })
}

export default harperGetMessage