# TON Crowdfunding Telegram Mini App

Production-ready краудфандинг платформа для сбора средств, работающая как Telegram Mini App с escrow-контрактом на TON blockchain.

## Features

- Telegram Mini App фронтенд на React + Vite
- TON Connect для авторизации кошелька и подписи транзакций
- Escrow-контракт на Tact с логикой:
  - Установка цели сбора и дедлайна
  - Прием донатов в TON
  - Выплата автору при достижении цели
  - Возврат средств при недостижении цели
  - Get-методы для чтения состояния
- Профиль пользователя (username, аватар)
- Отображения прогресса кампании
- Testnet deployment 

## Smart contract behavior

### Состояния кампании

| Статус | Значение | Описание |
|--------|----------|----------|
| `ACTIVE` | 0 | Сбор средств активен (до дедлайна и не достигнута цель) |
| `SUCCESS` | 1 | Цель достигнута, средства готовы к выводу |
| `FAILED` | 2 | Дедлайн прошел, цель не достигнута |
| `WITHDRAWN` | 3 | Средства выведены автором |

### Основная логика

1. **Создание кампании**
   - Устанавливается `owner` (автор)
   - Устанавливается `goal` (цель в TON)
   - Устанавливается `deadline` (Unix timestamp)

2. **Прием донатов**
   - Любой кошелек может отправить донат (>= 0.01 TON)
   - Сумма добавляется к `total_raised`
   - Отслеживаются все донаты каждого пользователя

3. **После дедлайна**
   - Если `total_raised >= goal`: автор может вызвать `withdraw`
   - Если `total_raised < goal`: донатеры могут вызвать `refund`

### Message opcodes

| Операция | Opcode (hex) | Opcode (dec) | Описание |
|----------|--------------|--------------|----------|
| `DONATE` | `0x444F4E45` | 1146048069 | Внесение доната |
| `WITHDRAW` | `0x57495448` | 1463896136 | Вывод средств автором |
| `REFUND` | `0x52454655` | 1380016725 | Возврат средств донатеру |

### Формат payload сообщений

- **Donate payload:**
opcode (uint32) + donation_amount (uint64)
- **Withdraw payload:**
opcode (uint32)
- **Refund payload:**
opcode (uint32)


### Get-методы контракта

| Метод | Возвращает | Описание |
|-------|------------|----------|
| `get_total_raised()` | Int | Собрано TON (в наноTON) |
| `get_goal()` | Int | Цель в TON (в наноTON) |
| `get_deadline()` | Int | Дедлайн (Unix timestamp) |
| `get_status()` | Int | Текущий статус (0-3) |
| `get_owner()` | Address | Адрес автора кампании |
| `get_donation(Address)` | Donation? | Структура доната пользователя |
| `can_refund(Address)` | Bool | Может ли пользователь вернуть донат |
| `can_withdraw()` | Bool | Может ли автор вывести средства |
| `get_remaining_time()` | Int | Осталось секунд до дедлайна |
| `get_progress_percentage()` | Int | Процент выполнения цели |
| `get_event_count()` | Int | Количество событий |

## Deployment (Testnet)

### Текущий развернутый контракт
- Testnet address: kQB424GDK3gDGaCscdXxk5U5b3vpXkOIx7drIaT8RXKLO0-N
- Explorer: https://testnet.tonscan.org/address/kQB424GDK3gDGaCscdXxk5U5b3vpXkOIx7drIaT8RXKLO0-N

### Telegram Bot
- Telegram Mini App доступен через бот @crowdfunding_dav_bot
- Приложение развёрнуто через firebase по адресу: https://ton-crowdfunding-app.web.app/

### Локальная сборка

#### 1) Contract

```bash
cd contract
npm install
npx blueprint build
npx blueprint test
npx blueprint run  # deploy to testnet
```

- После деплоя скопируйте адрес контракта в .env.
- Настройка API ключа TON Center
- Зарегистрируйтесь на TON Center
- Получите API ключ в личном кабинете

```
VITE_CONTRACT_ADDRESS=kQAC33wHICte9NmLNpNhDIGyvdB138EEZ1u852TtmZk2_iuW
VITE_TON_API_ENDPOINT=https://testnet.toncenter.com/api/v2
VITE_TON_API_KEY=your_api_key_here
```

#### 2) Frontend
```
cd frontend
npm install
npm run dev
Приложение будет доступно по адресу http://localhost:5173
```



