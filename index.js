var Notify = {
    container: document.getElementById('Notify'),
    generate: function(title) {
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

var VkEvents = {
    btnSubscribe: document.getElementById('subscribe-event'),
    listen: [],
    init: () => {
        var eventSelector = document.getElementById('picker-event');

        // Изменение события в выпадающем списке
        eventSelector.addEventListener('change', () => {
            var pickedEvent = document.getElementById('picker-event').value;

            if(!VkEvents.isAvailable(pickedEvent))
                return false;

            // если событие прослушивается
            if(~VkEvents.listen.indexOf(pickedEvent)){
                VkEvents.btnSubscribe.innerHTML = 'Отписаться';
            } else {
                VkEvents.btnSubscribe.innerHTML = 'Подписаться';
            }

            document.getElementById('jscode-event').innerHTML = VkEvents.AvailableEvents[pickedEvent];
        });

        // Обработка нажатия на кнопку
        VkEvents.btnSubscribe.addEventListener('click', () => {
            var pickedEvent = document.getElementById('picker-event').value;

            try {

                // если событие в списке прослушиваемых
                if(~VkEvents.listen.indexOf(pickedEvent)){
                    VkEvents.unsubscribe(pickedEvent);
                    VkEvents.btnSubscribe.innerHTML = 'Подписаться';
                } else {
                    VkEvents.subscribe(pickedEvent);
                    VkEvents.btnSubscribe.innerHTML = 'Отписаться';
                }

            } catch (e) {
                Notify.generate('Event listener', e.message);
            }

        });
    },
    subscribe: (eventname) => {
        if(VkEvents.isAvailable(eventname)){
            eval(VkEvents.AvailableEvents[eventname]);
            VkEvents.listen.push(eventname);
        }
    },
    unsubscribe: (eventname) => {
        VkEvents.listen.splice( VkEvents.listen.indexOf(pickedEvent), 1 );

        //TODO Храинлище функций обработчиков
    },
    isAvailable: (eventname) => {
        if(eventname in VkEvents.AvailableEvents)
            return true;
        return false;
    },
    AvailableEvents: {
        onLocationChanged: "VK.addCallback('onLocationChanged', function f(location){\n\talert(\"location: \" + location);\n});",
        test: "console.log('test complete')"
    }
}

window.addEventListener("load", () => {
    function locationHashChanged() {
        var titleBox = document.getElementById('title');
        switch(location.hash) {
            case '#page-main':
                titleBox.innerHTML = '<h1>Что это?</h1>';
            break;
            case '#page-api':
                titleBox.innerHTML = '<h1>Методы</h1>';
            break;
            case '#page-event':
                titleBox.innerHTML = '<h1>События</h1>';
            break;
        }
    }

    location.hash = '#page-main';
    window.onhashchange = locationHashChanged;
    VkEvents.init();

    try{
        VK.init(function() {
            Notify.generate('JS SDK Connection', 'success');
        }, function() {
            Notify.generate('JS SDK Connection', 'fail');
        }, '5.69');
    } catch(e) {
        Notify.generate('Error', e.message);
    }
});
