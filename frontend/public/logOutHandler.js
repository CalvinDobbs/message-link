import socketController from './socketIo.js'

const logOutHandler = async () => {
    socketController.resetSocket();
    localStorage.removeItem('accessToken');
}

export default logOutHandler;