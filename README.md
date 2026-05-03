# Fork & Order - Éttermi Rendelési Rendszer

Egy webes éttermi rendelési alkalmazás, React + FastAPI + SQLAlchemy technológiákkal, admin panellel és JWT-alapú hitelesítéssel.

---

## Tartalomjegyzék

- [A projektről](#a-projektről)
- [Funkciók](#funkciók)
- [Technológiai stack](#technológiai-stack)
- [Projekt struktúra](#projekt-struktúra)
- [Telepítés és futtatás](#telepítés-és-futtatás)
  - [Docker (ajánlott)](#-docker-ajánlott)
  - [Manuális futtatás](#️-manuális-futtatás)
- [API végpontok](#api-végpontok)
- [Admin panel](#admin-panel)
- [Adatbázis](#adatbázis)
- [Fejlesztési megjegyzések](#fejlesztési-megjegyzések)

---

## A projektről

A **Fork & Order** egy éttermi rendelési webalkalmazás, amely lehetővé teszi a vendégek számára, hogy böngésszenek az ételek között, kosárba tegyék a kiválasztott ételeket, és leadják rendelésüket. Az adminisztrátorok egy külön panelen keresztül kezelhetik az ételek listáját, a felhasználókat, valamint élő nézetben követhetik és frissíthetik a rendelések státuszát.

---

## Funkciók

### Vendég / Felhasználó
- Regisztráció és bejelentkezés (JWT token alapú)
- Ételek böngészése kategória szerint
- Kosár kezelése (hozzáadás, eltávolítás, mennyiség módosítás)
- Rendelés leadása
- Saját rendelések megtekintése és státusz követése

### Admin
- Ételek hozzáadása, szerkesztése, törlése
- Felhasználók kezelése (admin jog adása/visszavonása, törlés)
- Rendelések kezelése a státusz frissítés gombokkal
- Aktív rendelések és elkészült rendelések külön tabban
- Badge jelzi az aktív rendelések számát

---

## Technológiai stack

### Frontend
| Technológia | Verzió | Szerepe |
|---|---|---|
| React | 18+ | UI keretrendszer |
| TypeScript | 5+ | Típusbiztos fejlesztés |
| React Router | 6 | Kliensoldali routing |
| Axios | - | HTTP kérések kezelése |
| Vite | - | Build tool és dev server |

### Backend
| Technológia | Verzió | Szerepe |
|---|---|---|
| FastAPI | - | REST API keretrendszer |
| SQLAlchemy | - | ORM, adatbázis kezelés |
| SQLite | - | Adatbázis (fejlesztési környezet) |
| Pydantic | v2 | Adatvalidáció, sémák |
| python-jose | - | JWT token generálás/ellenőrzés |
| passlib / bcrypt | - | Jelszó hashelés |
| Uvicorn | - | ASGI szerver |

---

## Projekt struktúra

```
fork-and-order/
│
├── backend/
│   ├── app/
│   │   ├── models/
│   │   │   ├── food.py              # Food modell (id, name, description, price, category)
│   │   │   ├── order.py             # Order + OrderItem modellek
│   │   │   └── user.py              # User modell (id, email, username, hashed_password, is_admin)
│   │   ├── routers/
│   │   │   ├── admin.py             # /api/admin/* — ételek, felhasználók, rendelések CRUD
│   │   │   ├── auth.py              # /api/auth/register, /api/auth/login
│   │   │   ├── foods.py             # /api/foods GET
│   │   │   └── orders.py            # /api/orders POST, GET + serialize_order()
│   │   ├── schemas/
│   │   │   ├── food.py              # FoodCreate, FoodUpdate, FoodResponse
│   │   │   ├── order.py             # OrderCreate, OrderResponse, OrderStatusUpdate
│   │   │   └── user.py              # UserCreate, UserResponse, Token
│   │   ├── services/
│   │   │   └── auth_service.py      # hash_password(), verify_password(), get_current_user()
│   │   ├── config.py                # Környezeti változók, beállítások (SECRET_KEY stb.)
│   │   ├── database.py              # SQLAlchemy engine, Base, get_db
│   │   └── main.py                  # FastAPI app, router regisztráció, CORS
│   ├── db_init_script.py            # Adatbázis init + minta adatok + admin user
│   ├── fork_and_order.db            # SQLite adatbázis fájl
│   ├── Dockerfile                   # Backend Docker image
│   └── requirements.txt
│
│
├── frontend/
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts            # Axios instance (baseURL, Authorization interceptor)
│   │   ├── assets/
│   │   │   ├── hero.png
│   │   │   ├── react.svg
│   │   │   └── vite.svg
│   │   ├── components/
│   │   │   ├── FoodCard.tsx         # Étel kártya komponens
│   │   │   ├── FoodCard.css
│   │   │   ├── Navbar.tsx           # Navigációs sáv
│   │   │   ├── Navbar.css
│   │   │   └── ProtectedRoute.tsx   # Bejelentkezés-védett route wrapper
│   │   ├── context/
│   │   │   ├── AuthContext.tsx      # Globális auth állapot (token, isLoggedIn, isAdmin)
│   │   │   └── CartContext.tsx      # Kosár állapot (tételek, hozzáadás, törlés)
│   │   ├── pages/
│   │   │   ├── Admin.tsx            # Admin panel (Foods / Users / Orders tab)
│   │   │   ├── Admin.css
│   │   │   ├── Cart.tsx             # Kosár oldal, rendelés leadása
│   │   │   ├── Cart.css
│   │   │   ├── Home.tsx             # Étlap — ételek böngészése, kosárba rakás
│   │   │   ├── Home.css
│   │   │   ├── Login.tsx            # Bejelentkezési form
│   │   │   ├── Orders.tsx           # Saját rendelések listája
│   │   │   ├── Orders.css
│   │   │   ├── Register.tsx         # Regisztrációs form
│   │   │   └── Auth.css             # Login + Register közös stílusok
│   │   ├── styles/
│   │   │   └── index.css            # Globális stílusok, CSS változók
│   │   ├── App.tsx                  # Route definíciók
│   │   ├── App.css
│   │   ├── main.tsx                 # React belépési pont
│   │   └── index.css
│   ├── Dockerfile                   # Frontend Docker image (Vite build -> Nginx)
│   ├── nginx.conf                   # Nginx konfiguráció (SPA routing + /api proxy)
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.ts               # Vite konfig (dev proxy: /api -> localhost:8000)
│   ├── eslint.config.js
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   └── README.md
│
├── docker-compose.yml               # Teljes stack egyben (backend + frontend)
├── .gitignore
├── .gitattributes
└── README.md
```

---

## Telepítés és futtatás

### Docker (ajánlott)

> **Előfeltétel:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) telepítve és futva.

#### 1. Projekt klónozása

```bash
git clone https://github.com/felhasznalonev/fork-and-order.git
cd fork-and-order
```

#### 2. Indítás egyetlen paranccsal

```bash
docker compose up --build
```

Ez automatikusan:
- Buildeli a backend és frontend image-eket
- Inicializálja az adatbázist minta adatokkal és admin felhasználóval
- Elindítja mindkét szervert

> Fontos, hogy előtte a backend mappába létre legyen hozva a fork_and_order.db fájl.

#### 3. Megnyitás böngészőben

| Szolgáltatás | URL |
|---|---|
| Frontend | `http://localhost:3000` |
| Backend API | `http://localhost:8000` |
| Swagger docs | `http://localhost:8000/docs` |

#### Leállítás

```bash
docker compose down
```

#### Leállítás + adatbázis törlése (clean start)

```bash
docker compose down -v
```

---

### Manuális futtatás

#### Előfeltételek
- Python 3.10+
- Node.js 18+

#### 1. Backend indítása

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt

# Adatbázis inicializálás + minta adatok + admin user létrehozása
python db_init_script.py

# Szerver indítása
uvicorn app.main:app --reload
```

Backend fut: `http://localhost:8000`
Swagger dokumentáció: `http://localhost:8000/docs`

#### 2. Frontend indítása

```bash
cd frontend
npm install
npm run dev
```

Frontend fut: `http://localhost:5173`

---

### Alapértelmezett fiókok

| Mező | Érték |
|---|---|
| Email | `test@forkandorder.com` |
| Jelszó | `test123` |

| Mező | Érték |
|---|---|
| Email | `admin@forkandorder.com` |
| Jelszó | `admin123` |

> Éles környezetben feltétlenül változtasd meg az admin jelszót!

---

## API végpontok

### Hitelesítés
| Metódus | Végpont | Leírás |
|---|---|---|
| `POST` | `/api/auth/register` | Regisztráció |
| `POST` | `/api/auth/login` | Bejelentkezés (JWT token) |

### Ételek
| Metódus | Végpont | Leírás |
|---|---|---|
| `GET` | `/api/foods` | Összes étel listázása |

### Rendelések (bejelentkezés szükséges)
| Metódus | Végpont | Leírás |
|---|---|---|
| `POST` | `/api/orders` | Rendelés leadása |
| `GET` | `/api/orders/my` | Saját rendelések lekérése |

### Admin (admin jogosultság szükséges)
| Metódus | Végpont | Leírás |
|---|---|---|
| `GET` | `/api/admin/foods` | Összes étel |
| `POST` | `/api/admin/foods` | Étel hozzáadása |
| `PATCH` | `/api/admin/foods/{id}` | Étel szerkesztése |
| `DELETE` | `/api/admin/foods/{id}` | Étel törlése |
| `GET` | `/api/admin/users` | Összes felhasználó |
| `PATCH` | `/api/admin/users/{id}` | Felhasználó szerkesztése |
| `DELETE` | `/api/admin/users/{id}` | Felhasználó törlése |
| `GET` | `/api/admin/orders` | Összes rendelés |
| `PATCH` | `/api/admin/orders/{id}/status` | Rendelés státusz frissítése |

---

## Admin panel

Az admin panel három fő tabra osztott:

### Foods (Ételek)
- Új étel hozzáadása (név, kategória, ár, leírás)
- Meglévő ételek szerkesztése helyben
- Ételek törlése

### Users (Felhasználók)
- Összes regisztrált felhasználó listázása
- Admin jog adása / visszavonása egy kattintással
- Felhasználó törlése

### Orders (Rendelések)
- **Active Orders** tab -> `pending`, `preparing`, `ready` státuszú rendelések
  - A `pending` rendelések mindig felül jelennek meg
  - Státusz gombokkal egy kattintással frissíthető: `preparing` -> `ready` -> `delivered`
  - Badge jelzi az aktív rendelések számát a tabon
- **Completed** tab -> `delivered` és `cancelled` rendelések, legújabb elöl

#### Rendelés státuszok
| Státusz | Magyar | Leírás |
|---|---|---|
| `pending` | Függőben | Beérkezett, feldolgozásra vár |
| `preparing` | Készül | Elkészítés alatt |
| `ready` | Kész | Átvehető / kiszállításra vár |
| `delivered` | Kiszállítva | Teljesített rendelés |
| `cancelled` | Lemondva | Visszavont rendelés |

---

## Adatbázis

Az alkalmazás fejlesztési környezetben **SQLite**-ot használ (`backend/fork_and_order.db`).

### Táblák

**`users`**
```
id | email | username | hashed_password | is_admin
```

**`foods`**
```
id | name | description | price | category
```

**`orders`**
```
id | user_id | status | total_price | created_at
```

**`order_items`**
```
id | order_id | food_id | quantity | unit_price
```

### Adatbázis újraépítése (manuális mód)

```bash
cd backend
del fork_and_order.db       # Windows
# rm fork_and_order.db      # macOS / Linux

Fontos, hogy előtte a venv-et létre kell hozni és a requirements.txt csomagjai fel legyenek telepítve és a venv-ből futtassuk
python db_init_script.py
```

---

## Fejlesztési megjegyzések

- A **Vite dev proxy** `/api` kéréseket a `http://localhost:8000`-re továbbítja, csak fejlesztési módban, Dockerben az Nginx végzi a proxyzást
- A **JWT token** az `AuthContext`-ben tárolódik memóriában, az Axios interceptor automatikusan csatolja minden kéréshez
- Az `OrderStatusUpdate` Pydantic séma a PATCH endpoint body-ját validálja: `{"status": "preparing"}`
- A `serialize_order()` segéd függvény az `orders.py` routerben gondoskodik a `food_name` és `unit_price` mezők kitöltéséről a response-ban
- **Éles környezethez** SQLite helyett PostgreSQL ajánlott, cseréld le az `engine` connection string-et a `database.py`-ban

---

## Licenc

Ez a projekt oktatási / portfólió célra készült.
