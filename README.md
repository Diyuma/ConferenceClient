# Diyumaconference - конференции

В репозиториях организации Diyuma ConferenceClient, ConferenceSound, ConferenceVideo находятся части реализации сервиса конференций

## Что мы умеем?

На данный момент реализован веб сайт на котором вы можете создавать свои конференции и приглашать в них своих друзей

## Где это можно потыкать?

Фронтенд нашего сервиса доступен всем желающим (но хостится на прерываемой vm)
https://diyumaconference.ru/conference/


Чтобы создать новую конференцию - нажмите на "start new conference"

Чтобы подключиться к существующей - введите выданный при создании id конференции в поле на главной странице и нажмите на "connect to conference"

## Архитектура

Верхнеуровневая архитектуара нашего сервиса:
![Untitled - Frame 1 (3)](https://github.com/Diyuma/ConferenceClient/assets/36619154/e67f8395-8a92-4b23-b357-95c31476435b)


## Как запустить это локально? (outdated) - now just need to run compose and create correct .bashrc - TODO add it

1. Склонируйте все 3 репозитория
2. В каждом задайте переменные окружения HOST (ip вашей vm), VM_USER (пользователь вашей vm), KEY_PATH (путь к приватному ключу для вашей vm) для удобной работы с вашей vm по ssh
3. Для ci/cd в ConferenceSound задайте сикреты HOST (ip вашей vm), USERNAME (пользователь вашей vm), KEY (приватный ключ для вашей vm)
4. Получите https на вашей vm - не забудьте поменять nginx.conf из ConferenceSound под ваши сертификаты (без него не будет работать запись звука)
5. В client.js ConferenceClient и ConferenceVideo поменяйте ручками в SoundServiceClient('https://diyumaconference.ru/') VideoServiceClient('https://diyumaconference.ru/') на ваш домен/хост
6. В ConferenceSound исполните таргет serverSetup на вашем сервере, а так же genProto, uploadToServer в заклоненной ранее репозитории
7. В ConferenceClient исполните таргеты buildJsProto, buildFront, buildFrontServer в заклоненной ранее репозитории
8. В ConferenceVideo исполните таргеты buildProtos, uploadToServer, runOnServer в заклоненной ранее репозитории
9. В ConferenceSound runOnServer в заклоненной ранее репозитории

## Если хочу что-то поменять?

Если вы хотите поменять proto файлы, то не забудьте потом перебилдить их в соотвествующий репозиторий (обратите внимание на то, что к сожалению, ConferenceClient и ConferenceSound должны использовать идентичные)
Если вы меняете что-то в функциональности, то не забудьте запустить соответствующие таргеты uploadToServer/buildFrontServer а так же runOnServer


### Функциональные требования

Уметь передавать звук между пользователями
Уметь передавать видео между пользователями
Быть легкодоступными


### Нефункциональные требования

Уметь реагировать на изменение скорости/различные скорости связи пользователей изменением качества звука/видео
Давать возможность видеть видео других пользователей только админу + другим пользователям только админа
