const socket = io()

const textBox = document.getElementById('msg');
const btn = document.getElementById('increment');
const btnLocation = document.getElementById('btnLocation');
const messages = document.getElementById('messages');
const locations = document.getElementById('locations');

const messageTemplate = document.getElementById('message-template').innerHTML;
const locationTemplate = document.getElementById('location-template').innerHTML;
const sidebarTemplate = document.getElementById('sidebar-template').innerHTML;

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoscroll = () => {
    const newMessage = messages.lastElementChild;

    const newMessageStyles = getComputedStyle(newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = messages.offsetHeight + newMessageMargin;

    const visibleHeight = messages.offsetHeight;
    const containerHeight = messages.scrollHeight
    const scrollOffset = messages.scrollTop + visibleHeight;
    if (containerHeight - newMessageHeight <= scrollOffset) {
        messages.scrollTop = messages.scrollHeight;
    }
    console.log(newMessageMargin);
}

socket.on('message', (data) => {
    console.log("Chat Line 13 : ", data);
    const html = Mustache.render(messageTemplate, {
        username: data.username,
        message: data.text,
        createdAt: moment(data.createdAt).format('h:mm a')
    });
    messages.insertAdjacentHTML('beforeend', html);
    autoscroll()
})

socket.on('sendLoc', (url) => {
    const html = Mustache.render(locationTemplate, {
        username: url.username,
        location: url.text,
        createdAt: moment(url.createdAt).format('h:mm a')
    });
    messages.insertAdjacentHTML('beforeend', html);
    autoscroll()
})

btn.addEventListener('click', (e) => {
    e.preventDefault();
    btn.setAttribute('disabled', true);
    if (textBox.value == '') {
        alert('Please provide some input!');
        textBox.focus();
        btn.removeAttribute('disabled');
        return;
    }
    const data = textBox.value;
    socket.emit('msg', data, (error) => {
        btn.removeAttribute('disabled');
        textBox.value = '';
        textBox.focus();
        if (error) {
            return console.log(error);
        }
        console.log("Message Delivered!");
    });
})

btnLocation.addEventListener('click', () => {
    console.log("Location button clicked");
    if (!navigator.geolocation) {
        return alert("Please allow location to this website")
    }

    btnLocation.setAttribute('disabled', true);

    navigator.geolocation.getCurrentPosition((position) => {
        // const data = position.coords.latitude;
        const data = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }
        socket.emit('sendLocation', data, () => {
            console.log("Location shared");
            btnLocation.removeAttribute('disabled');
        });
    })
})

socket.on('welcomeMessage', (msg) => {
    console.log(msg);
    const html = Mustache.render(messageTemplate, {
        username: msg.username,
        message: msg.text,
        createdAt: moment(msg.createdAt).format('h:mm a')
    });
    messages.insertAdjacentHTML('afterbegin', html);
})

socket.on('notify', (msg) => {
    console.log(msg.text);
    const html = Mustache.render(messageTemplate, {
        message: msg.text
    });
    messages.insertAdjacentHTML('beforeend', html);
})
socket.on('disconnectMessage', (data) => {
    console.log(data);
    const html = Mustache.render(messageTemplate, {
        message: data.text
    });
    messages.insertAdjacentHTML('beforeend', html);
})

socket.on('sendLoc', (data) => {
    console.log(data);
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
});

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.getElementById('sidebar').innerHTML = html;
})