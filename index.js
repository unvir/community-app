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

var VkApi = {
    init: () => {
        var btnSubmit = document.getElementById('subscribe-api');
        var pickerMethod = document.getElementById('picker-api');

        // Нажатие на кнопку "выполнить"
        btnSubmit.addEventListener('click', () => {
            var jscode = document.getElementById('jscode-api').value;

            if(VkApi.checkTemplate(jscode)){ // СМ КОММЕНТАРИЙ К ФУНКЦИИ
                eval(jscode);
                Notify.generate('VK API','Запрос выполнен');
            }
            else {
                Notify.generate('VK API','Ошибка валидации');
            }
        });

        pickerMethod.addEventListener('change', () => {
            var methodName = document.getElementById('picker-api').value;

            VkApi.Methods.forEach(function(elem){
                if(elem.name === methodName && elem.available)
                {
                    document.getElementById('jscode-api').value = VkApi.genTemplate(elem);
                    document.getElementById('description-api').innerHTML = '';

                    if(elem.params.length)
                        elem.params.forEach(function(elem){
                            if(elem.description.length > 3)
                                document.getElementById('description-api').innerHTML += '<b>' + elem.name + '</b>: <small>' + elem.description + '</small><br>';
                        });

                    return;
                }
            });


        });

        VkApi.Methods.forEach(function(elem){
            if(elem.available)
            {
                var newElem = document.createElement('option');
                    newElem.innerHTML = elem.name;
                    pickerMethod.appendChild(newElem);
            }
        });
    },
    checkTemplate: function(code){ //Не корректно работает с пробелами: убрать trim и пофиксить маску
        var isValid = true;

        var mask = /\s|\u00A0/g;
        var res = code.replace(mask, ''); // full trim

            mask = /VK.callMethod\(\"([a-zA-Z]+)\"([a-zA-Zа-яА-Я0-9\.\,\!\?\:\;\"\*\(\)]*)\)\;/;
            res = res.match(mask);

        if(!res) return false;

        var methodName = res[1];
        var ps = res[2]; //paramsString

        for(var j = 0; j < VkApi.Methods.length; j++){
            var elem = VkApi.Methods[j];
            if(elem.name === methodName && elem.available)
            {
                if(elem.params.length > 0){
                    for(var it = 0; it < elem.params.length; it++){
                        // убираем запятую в начале
                        if(ps[0] == ',' && ps.length != 1){
                            ps = ps.substr(1);
                        } else {
                            isValid = false;
                            return;
                        }

                        switch (elem.params[it].type) {
                            case "string":
                                if(ps[0] == '"' && ps.lastIndexOf('"') != 0){
                                    ps = ps.substr( ps.indexOf('"', 1) + 1 ); // переходим ко второй закрывающей ковычке
                                } else {
                                    return false;
                                }
                                break;
                            case "integer":
                                var finish = ps.indexOf(',') == -1 ? ps.length : ps.indexOf(',');

                                if( finish == 0 ) return false;

                                for(var i = 0; i < finish; i++)
                                {
                                    var code = ps.charCodeAt(i)
                                    if(code >= 48 && code <= 57) continue;

                                    return false;
                                }

                                ps = ps.substr(finish);
                                break;
                            case "bool":
                                var finish = ps.indexOf(',') == -1 ? ps.length : ps.indexOf(',');

                                if(ps.substring(0,finish) == "true" || ps.substring(0,finish) == "false")
                                {
                                    ps = ps.substr(finish);
                                    break;
                                }

                                return false;
                                break;
                            default:
                                return false;
                        }
                    }
                }
                if(ps.length > 0) return false;
                break;
            }
        }
        return isValid;
    },
    genTemplate: (elem) => {
        var res = 'VK.callMethod("' + elem.name + '"';

        if(elem.params.length)
            elem.params.forEach(function(elem){
                if( elem.type == "string" )
                    res += ', "' + elem.default + '"';
                else
                    res += ', ' + elem.default;
            });

        res += ');'

        return res;
    },
    Methods: [
        {
            name: "showInstallBox",
            available: true,
            params: { }
        },
        {
            name: "showSettingsBox",
            available: true,
            params: [
                {
                    name: "settings",
                    description: "Параметр settings — это битовая маска запрашиваемых <a href=\"https://vk.com/dev/permissions\" target=\"_blank\">прав доступа</a>",
                    required: true,
                    type: "integer",
                    default: 8214
                }
            ]
        },
        {
            name: "showGroupSettingsBox",
            available: true,
            params: [
                {
                    name: "settings",
                    description: "Параметр settings — это битовая маска запрашиваемых <a href=\"https://vk.com/dev/permissions\" target=\"_blank\">прав доступа</a>",
                    required: true,
                    type: "integer",
                    default: 4096
                }
            ]
        },
        {
            name: "showRequestBox",
            available: true,
            params: [
                {
                    name: "user_id",
                    description: "Запрос отправляется пользователю user_id (должен быть другом текущего пользователя)",
                    required: true,
                    type: "integer",
                    default: 123456789
                },
                {
                    name: "message",
                    description: "С текстом message",
                    required: true,
                    type: "string",
                    default: "Hello!"
                },
                {
                    name: "requestKey",
                    description: "И произвольным дополнительным параметром requestKey",
                    required: true,
                    type: "string",
                    default: "myRequestKey"
                }
            ]
        },
        {
            name: "showInviteBox",
            available: true,
            params: []
        },
        {
            name: "showOrderBox",
            available: false,
            params: [
                {
                    name: "type",
                    description: "",
                    required: true,
                    type: "object",
                    default: ""
                }
            ]
        },
        {
            name: "showProfilePhotoBox",
            available: true,
            params: [
                {
                    name: "photo_hash",
                    description: "Параметр photo_hash может быть получен методом <a href=\"https://vk.com/dev/photos.saveOwnerPhoto\" target=\"_blank\">photos.saveOwnerPhoto</a>",
                    required: true,
                    type: "string",
                    default: "sdf87dfhsdfdfjererhfd9"
                }
            ]
        },
        {
            name: "resizeWindow",
            available: true,
            params: [
                {
                    name: "width",
                    description: "Максимальное значение ширины окна — 1000 px",
                    required: false,
                    type: "integer",
                    default: 500
                },
                {
                    name: "height",
                    description: "Максимальное значение высоты окна — 4050 px",
                    required: false,
                    type: "integer",
                    default: 500
                }
            ]
        },
        {
            name: "setTitle",
            available: true,
            params: [
                {
                    name: "title",
                    description: "Новый заголовок вкладки браузера",
                    required: true,
                    type: "string",
                    default: "New title"
                }
            ]
        },
        {
            name: "setLocation",
            available: true,
            params: [
                {
                    name: "location",
                    description: "Новый заголовок вкладки браузера",
                    required: true,
                    type: "string",
                    default: "New title"
                },
                {
                    name: "fireEvent",
                    description: "Параметр fireEvent определяет, нужно ли вызывать событие onLocationChanged сразу после запуска метода",
                    required: false,
                    type: "bool",
                    default: true
                }
            ]
        }
    ]
}

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

            document.getElementById('jscode-event').value = VkEvents.AvailableEvents[pickedEvent];
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
            eval(document.getElementById('jscode-event').value);
            VkEvents.listen.push(eventname);
            Notify.generate('VK Events', 'прослушивается ' + eventname);
        }
    },
    unsubscribe: (eventname) => {
        VkEvents.listen.splice( VkEvents.listen.indexOf(eventname), 1 );
        Notify.generate('VK Events', eventname + ' больше не прослушивается');
        //TODO Храинлище функций обработчиков
    },
    isAvailable: (eventname) => {
        if(eventname in VkEvents.AvailableEvents)
            return true;
        return false;
    },
    AvailableEvents: {
        onLocationChanged: "VK.addCallback('onLocationChanged', function f(location){\n\talert(\"location: \" + location);\n});",
        onWindowBlur: "VK.addCallback('onWindowBlur', () => {\n\t console.log('focus out');\n});",
        onWindowFocus: "VK.addCallback('onWindowFocus', () => {\n\t console.log('focus get');\n});",
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
    VkApi.init();

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
