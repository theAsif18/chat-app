exports.generateMessage = (username, text) => {
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
}

exports.generateLocationMessage = (username, url) => {
    return {
        username,
        text: url,
        createdAt: new Date().getTime()
    }
}