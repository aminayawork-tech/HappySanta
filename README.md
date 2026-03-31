# 🎅 HappySanta

> **AI Santa builds the perfect list. We watch the prices so you don't have to.**

A full-stack Christmas gift-list app for iOS & Android, built with React Native + Expo. Users create personalised lists for family and friends, get AI-generated gift ideas powered by OpenAI/Grok, see real Amazon products with affiliate links, and receive push notifications when an item hits its all-time lowest price.

---

## ✨ Features

| Feature | Status |
|---|---|
| Email/password + Google sign-in | ✅ |
| Add recipients with avatars, age, relationship & delivery address | ✅ |
| AI gift suggestions (OpenAI GPT-4o or Grok) | ✅ |
| Amazon Creators API product search with affiliate links | ✅ |
| Keepa price history charts & all-time-low tracking | ✅ |
| Push notifications (FCM) when price hits all-time low | ✅ |
| Shareable list links | ✅ |
| Dark festive theme with snow animation | ✅ |
| Cloud Functions price-check cron (every 6 hours) | ✅ |
| Offline support via Firestore persistence | ✅ |

---

## 📁 Project Structure

```
HappySanta/
├── App.tsx                          # Root component, font loading, notification listeners
├── app.json                         # Expo config (plugins, permissions, icons)
├── babel.config.js                  # Path aliases + NativeWind + Reanimated
├── tailwind.config.js               # Christmas colour palette
├── tsconfig.json                    # Path aliases (@/, @components/, etc.)
├── .env.example                     # All required env variables documented
├── firestore.rules                  # Firestore security rules
├── firestore.indexes.json           # Composite indexes for queries
├── storage.rules                    # Firebase Storage rules
├── firebase.json                    # Firebase project config + emulator ports
│
├── src/
│   ├── types/index.ts               # All TypeScript types (User, Recipient, GiftList, etc.)
│   ├── utils/
│   │   ├── constants.ts             # Colors, fonts, labels, Amazon URL builder
│   │   └── helpers.ts               # Price formatting, date helpers, Keepa parser, uuid
│   │
│   ├── services/
│   │   ├── firebase/
│   │   │   ├── config.ts            # Firebase init (singleton, offline persistence)
│   │   │   ├── auth.ts              # Email + Google sign-in, auth state subscription
│   │   │   ├── firestore.ts         # All Firestore CRUD + real-time subscriptions
│   │   │   └── notifications.ts     # Expo push token registration, FCM helpers
│   │   ├── ai/
│   │   │   └── openai.ts            # OpenAI GPT-4o / Grok gift suggestion engine
│   │   ├── amazon/
│   │   │   └── creatorsApi.ts       # Amazon Creators API product search + affiliate links
│   │   └── keepa/
│   │       └── keepaApi.ts          # Keepa price history fetch + all-time-low detection
│   │
│   ├── store/
│   │   ├── authStore.ts             # Zustand: auth state, login/register/logout
│   │   ├── recipientsStore.ts       # Zustand: recipients CRUD + real-time sync
│   │   ├── listsStore.ts            # Zustand: lists + items + AI suggestions + price refresh
│   │   └── settingsStore.ts         # Zustand: persisted app settings (music, snow, alerts)
│   │
│   ├── navigation/
│   │   ├── AppNavigator.tsx         # Root navigator (auth gate)
│   │   ├── AuthNavigator.tsx        # Welcome → Login → Register → Onboarding
│   │   └── TabNavigator.tsx         # Bottom tabs (Home, Lists, Family, Profile)
│   │
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── WelcomeScreen.tsx    # Landing page with animated Santa + features
│   │   │   ├── LoginScreen.tsx      # Email + Google login
│   │   │   └── RegisterScreen.tsx   # Registration with validation
│   │   ├── onboarding/
│   │   │   └── OnboardingScreen.tsx # 4-slide feature tour (first-time only)
│   │   ├── home/
│   │   │   └── HomeScreen.tsx       # Dashboard: countdown, stats, quick actions
│   │   ├── recipients/
│   │   │   ├── RecipientsScreen.tsx     # List all recipients
│   │   │   ├── AddRecipientScreen.tsx   # Add/edit with avatar picker + address
│   │   │   └── RecipientDetailScreen.tsx# Profile + their gift lists
│   │   ├── lists/
│   │   │   ├── ListsScreen.tsx          # All / This Year / Past tabs
│   │   │   ├── CreateListScreen.tsx     # 3-step wizard: recipient → budget → interests
│   │   │   ├── ListDetailScreen.tsx     # Items, progress, share, AI re-suggest
│   │   │   └── AISuggestionsScreen.tsx  # AI gift cards with Amazon products
│   │   ├── product/
│   │   │   └── ProductDetailScreen.tsx  # Full product view, price history, buy button
│   │   └── settings/
│   │       ├── SettingsScreen.tsx       # Theme, music, snow, notifications toggles
│   │       └── ProfileScreen.tsx        # Profile tab with stats
│   │
│   └── components/
│       ├── common/
│       │   ├── SnowAnimation.tsx     # Animated falling snowflakes (Animated API)
│       │   ├── SantaLoader.tsx       # Full-screen AI loading state with bobbing Santa
│       │   └── PriceHistoryChart.tsx # react-native-chart-kit 90-day price chart
│       ├── recipients/
│       │   └── RecipientCard.tsx     # Recipient row card with edit/delete actions
│       └── lists/
│           ├── ListCard.tsx          # List summary card with budget progress
│           ├── SuggestionCard.tsx    # AI suggestion + Amazon product card
│           ├── GiftItemRow.tsx       # Gift item row with price, status, actions
│           └── BudgetProgress.tsx    # Animated budget progress bar
│
└── functions/
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── index.ts                  # Exports all Cloud Functions
        └── priceChecker.ts           # Cron: every 6h, Keepa → FCM price-drop alerts
```

---

## 🚀 Setup

### 1. Prerequisites

```bash
node >= 20
npm >= 10
Expo CLI:  npm install -g expo-cli eas-cli
Firebase CLI: npm install -g firebase-tools
```

### 2. Clone & Install

```bash
git clone <repo-url>
cd HappySanta
npm install
cd functions && npm install && cd ..
```

### 3. Environment Variables

```bash
cp .env.example .env
# Fill in all values — see comments in .env.example
```

### 4. Firebase Setup

1. Create a project at https://console.firebase.google.com
2. Enable **Authentication** → Email/Password + Google
3. Enable **Firestore** (start in production mode)
4. Enable **Storage**
5. Enable **Cloud Messaging**
6. Download `google-services.json` (Android) → project root
7. Download `GoogleService-Info.plist` (iOS) → project root
8. Deploy Firestore rules & indexes:

```bash
firebase login
firebase use --add   # select your project
firebase deploy --only firestore:rules,firestore:indexes,storage
```

### 5. Google Sign-In

1. Go to [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
2. Create OAuth 2.0 client IDs for iOS, Android, and Web
3. Add all three client IDs to your `.env`
4. Add your iOS bundle ID (`com.happysanta.app`) and Android package to each client

### 6. Amazon Associates + Creators API

1. Join [Amazon Associates](https://affiliate-program.amazon.com/) — get your tracking ID (e.g. `happysanta-20`)
2. From your Associates dashboard, request access to the **Creators API** (the 2026 successor to PA-API)
3. Once approved, generate an API key from the Creators API portal
4. Add both to `.env`:
   ```
   EXPO_PUBLIC_AMAZON_CREATORS_API_KEY=your_key
   EXPO_PUBLIC_AMAZON_AFFILIATE_TAG=happysanta-20
   ```

> **Note:** Amazon requires your app to be submitted for review to get API production access.
> For development, you can mock responses in `src/services/amazon/creatorsApi.ts`.

### 7. Keepa API (Price History)

1. Sign up at https://keepa.com/#!api
2. Subscribe to the **Startup plan** (~$17/month, 7,200 tokens/day)
3. Each price lookup costs ~5 tokens; the cron batch uses ~1 token per ASIN
4. Add your key to `.env`: `EXPO_PUBLIC_KEEPA_API_KEY=your_key`

### 8. OpenAI API

1. Get an API key from https://platform.openai.com/api-keys
2. Add to `.env`: `EXPO_PUBLIC_OPENAI_API_KEY=sk-...`
3. Or switch to Grok: set `EXPO_PUBLIC_AI_PROVIDER=grok` and add `EXPO_PUBLIC_GROK_API_KEY`

### 9. Run Locally

```bash
# Start Expo dev server
npx expo start

# iOS simulator
npx expo start --ios

# Android emulator
npx expo start --android

# Run Firebase emulators (optional, for local backend testing)
firebase emulators:start
```

### 10. Deploy Cloud Functions

```bash
cd functions
npm run build
cd ..
firebase deploy --only functions
```

This deploys:
- **`priceCheckCron`** — runs every 6 hours, checks Keepa for all-time lows, sends FCM
- **`sendPriceDropAlert`** — HTTP endpoint for manual testing

---

## 📱 Building for Production

```bash
# Configure EAS (first time)
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Submit to App Store / Play Store
eas submit --platform ios
eas submit --platform android
```

---

## 🔔 Push Notifications Architecture

```
User adds item to list
    │
    ▼
Cloud Firestore (items subcollection, ASIN saved)
    │
    ▼ (every 6 hours)
Firebase Cloud Function (priceCheckCron)
    │
    ├── Keepa API → current price + all-time low
    │
    ├── isAtAllTimeLow(current, atl) ?
    │       YES → FCM push → user's device 🔔
    │             Firestore notification doc created
    │       NO  → update price in Firestore silently
    │
    └── Repeat for each active price alert
```

---

## 💰 Revenue Model

| Source | How |
|---|---|
| Amazon affiliate commissions | Every product link includes your affiliate tag. You earn 1–10% on any purchase made within 24h of click. |
| Keepa API cost | ~$17/month for 7,200 tokens/day (sufficient for ~1,400 price checks/day) |
| Scaling | Add Walmart/Target APIs later. Same architecture. |

---

## 🧪 Testing Notes

- **Auth**: Use Firebase Auth emulator locally (`firebase emulators:start`)
- **AI**: Mock `getAISuggestions()` in `src/services/ai/openai.ts` during dev to avoid API costs
- **Amazon**: Mock `searchAmazonProducts()` with sample data during dev
- **Price tracking**: Use the `sendPriceDropAlert` HTTP function to test FCM locally
- **Push notifications**: Must test on a physical device (not simulator)

---

## 🗺️ Roadmap (Post-MVP)

- [ ] Walmart / Target product search (same AI keyword → search pattern)
- [ ] Browser extension to add Amazon items directly to lists
- [ ] Group lists (shared between family members)
- [ ] Wish-list mode (let recipients see their own list)
- [ ] Budget analytics (year-over-year spending charts)
- [ ] Price drop email digest (weekly summary)
- [ ] Apple Pay / Google Pay for 1-tap purchase
- [ ] Charity gift option (donate in recipient's name)

---

## 📄 License

MIT © HappySanta
