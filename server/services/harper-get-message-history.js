import axios from "axios";


const harperGetMessageHistory = async (room) => {
    const dbURL = process.env.HARPERDB_URL;
    const dbPw = process.env.HARPERDB_PW;
    if( !dbURL || !dbPw) return null;

    let data = JSON.stringify({
        operation: 'sql',
        //sql: `SELECT * FROM realtime-chat-app.messages WHERE room = '${room}' LIMIT 100`,
        sql: `SELECT * FROM realtime-chat-app.messages WHERE room = '${room}' ORDER BY __createdtime__ DESC LIMIT 100`,

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


    // return new Promise((resolve,reject) => {
    //     axios(config)
    //         .then(function (res){
    //             resolve(JSON.stringify(res.data));
    //         })
    //         .catch(function (error){
    //             reject(error);
    //         })
    //   })
    try {
        const response = await axios(config);
        return response.data;
      } catch (error) {
        throw error;
      }
    
}

export default harperGetMessageHistory