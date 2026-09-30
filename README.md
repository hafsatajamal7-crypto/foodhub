# FoodHub

FoodHub is a responsive MERN food ordering project with a React/Vite storefront and a separate Express/Mongoose API. The included storefront can be explored with demo content immediately; the API uses MongoDB for accounts, restaurants, food, and orders.

## Requirements

- Node.js 20 or newer
- MongoDB Community Server running locally at `mongodb://localhost:27017`

## Start the backend

```powershell
cd backend
npm install
npm run seed
npm run dev
```

The API runs at `http://localhost:5000`. Health check: `http://localhost:5000/api/health`.

Demo accounts all use password `Foodhub123!`:

- Admin: `admin@foodhub.local`
- Restaurant owners: `owner1@foodhub.local`, `owner2@foodhub.local`, `owner3@foodhub.local`
- Customers: `customer1@foodhub.local` through `customer10@foodhub.local`

The seed command is repeatable and adds or updates demo records without clearing existing collections. It creates seven approved restaurants, 12 categories, 42 food items, and a sample order.

## Start the frontend

In another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The frontend reads the API URL from `frontend/.env` (`VITE_API_URL=http://localhost:5000/api`); when that file is absent, it uses the same local default. It keeps its sample catalog visible if the API is offline.

## MongoDB configuration

The local backend `.env` is configured for:

```env
MONGO_URI=mongodb://localhost:27017/foodhub
```

Set a unique `JWT_SECRET` and production `CLIENT_URL` before deployment. Never commit `.env` files or use the local demo credentials in production.

## Included API

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/restaurants`, `GET /api/restaurants/:id`, owner restaurant management
- `GET /api/categories`, owner category management
- `GET /api/foods`, `GET /api/foods/:id`, owner food management
- `POST /api/orders`, customer order history/details/cancellation
- Restaurant order listing and status updates; admin order listing
- Review submission and food/restaurant review listing
- Admin summary and user listing/block/delete endpoints

Order totals are calculated on the backend from current food and restaurant records. Restaurant onboarding starts in `Pending`; admins can approve through `PUT /api/restaurants/:id` with `{ "status": "Approved" }`.

## Deploy to Vercel

Deploy `frontend/` and `backend/` as separate Vercel projects. The frontend project root is `frontend`; its `vercel.json` rewrites SPA paths to `index.html`. Set `VITE_API_URL` to the deployed backend URL plus `/api`, for example `https://your-api.vercel.app/api`.

Set the backend project root to `backend`. Vercel detects the Express application in `server.js`. Configure `MONGO_URI` with a remotely reachable MongoDB connection string, `JWT_SECRET` with a long random secret, and `CLIENT_URL` with the deployed frontend origin. `mongodb://localhost:27017/foodhub` is for local development only and cannot be reached by a Vercel deployment.
