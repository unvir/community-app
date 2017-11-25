var Notify = {
    container: document.getElementById('Notify'),
    generate: function(title){
        var msg_container = document.createElement('div');
            msg_container.className = 'container_notify';
            msg_container.innerHTML = '<span class="title">' + title + '</span>';

        if(typeof arguments[1] === 'string')
        {
            var message = document.createElement('p');
                message.className = 'notice';
                message.innerHTML = arguments[1];

            msg_container.appendChild(message);
        }

        //Notify.container.appendChild(msg_container);
        Notify.container.insertBefore(msg_container, Notify.container.children[0]);

        msg_container.addEventListener('click', listener);

        var timer = setTimeout((elem) => {
            Notify.hide(elem);
        }, 5000, msg_container);

        function listener(e){
            Notify.hide(msg_container, timer);
        }
    },
    hide: function(elem){
        Notify.container.removeChild(elem);

        if(arguments[1])
            clearTimeout(arguments[1])
    }
};
