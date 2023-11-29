import styles from './styles.module.css';
import React, { useEffect, useRef, useState } from 'react'

const Messages = ({socket,room}) => {
    
    const [messagesReceived,setMessagesReceived] = useState([]);
    const messagesColumnRef = useRef(null);

    
    // Runs whenever a socket event is recieved from the server
    useEffect(() => {
        console.log("Component mounted");
        
        socket.on('receive_message', (data) => {
            console.log(data);
            setMessagesReceived((state) => [
                ...state,
                {
                    message: data.message,
                    username: data.username,
                    __createdtime__: data.__createdtime__
                },
            ]);
        });

        // Remove event listener on component unmount
        //return () => socket.off('receive_message');
        return () => {
            console.log('Component unmounted');
            socket.off('receive_message');
          };

    },[socket]);


    // Last 100 messages sent in the chat room (fetched from the db in backend)
    useEffect(() => {
        socket.on('last_100_messages',(last100Messages) => {
            console.log('last_100_messages',JSON.parse(last100Messages));
            last100Messages = JSON.parse(last100Messages);
            // Sort these messages by __createdtime__
            last100Messages = sortMessagesByDate(last100Messages);
            setMessagesReceived((state) => [...last100Messages,...state]);
        });
        return () => socket.off('last_100_messages');
    },[socket]);

    // Scroll to the most recent message
    useEffect(() => {
        messagesColumnRef.current.scrollTop = messagesColumnRef.current.scrollHeight;
    },[messagesReceived]);

    //sort message by date
    function sortMessagesByDate(messages){
        return messages.sort(
            (a,b) => parseInt(a.__createdtime__) - parseInt(b.__createdtime__)
        );
    }


    // dd/mm/yyyy, hh:mm:ss
    function formatDateFormatTimestamp(timestamp){
        const data = new Date(timestamp);
        return data.toLocaleString();
    }

  return (
   
    <div className={styles.messagesColumn} ref={messagesColumnRef}>
        <h1>Messages</h1>
        
        {/* {messagesReceived.map((msg,i) => ( */}
        {messagesReceived.map((msg,i) => (
            <div className={styles.message} key={i}>
                <div style={{display: 'flex',justifyContent: 'space-between'}}>
                    <span className={styles.msgMeta}>{msg.username}</span>
                    <span className={styles.msgMeta}>
                        {formatDateFormatTimestamp(msg.__createdtime__)}
                    </span>
                </div>
                <p className={styles.msgText}>{msg.message}</p>
                
                <br />
            </div>
        ))}
    </div>
  );
};

export default Messages