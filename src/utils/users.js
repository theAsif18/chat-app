const users = [];

exports.addUser = ({ id, username, room }) => {
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // Validate the data
    if (!username || !room) {
        return {
            error: 'Username & room is required!'
        }
    }

    // check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    if (existingUser) {
        return {
            error: 'Username in use '
        }
    }

    const user = { id, username, room }

    users.push(user);
    return { user }
}

exports.removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id
    })

    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}

exports.getUser = (id) => {
    return users.find((user) => {
        return user.id == id
    })
}

exports.getUserInRoom = (room) => {
    room = room.trim().toLowerCase();
    return users.filter((user) => {
        return user.room === room;
    })
}