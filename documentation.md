# Technical Documentation: Camemark

## 1. Overview
Camemark is an enchanting e-commerce platform designed to bridge the gap between local producers (farmers), sellers, and buyers across Cameroon. It focuses on the 10 unique economic blocs of the country, providing a secure and seamless shopping experience with integrated financial tools.

## 2. Technology Stack

### Frontend
- **Framework**: React 18 (Vite + TypeScript)
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI (Radix UI)
- **Animations**: Framer Motion
- **State Management**: TanStack Query (React Query) v5
- **Routing**: React Router Dom v6
- **Internationalization**: i18next + react-i18next
- **Forms**: React Hook Form + Zod

### Backend & Infrastructure
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (Buckets: `avatars`, `products`, `site_assets`)
- **RLS**: Row Level Security policies enforced for all data access.

## 3. Project Architecture

### Directory Structure
- `/src/pages`: Key views like `BuyerDashboard`, `MarketZone`, `AdminDashboard`.
- `/src/components/camemark`: Project-specific components organized by feature.
- `/src/hooks`: Custom hooks for auth and data fetching.
- `/supabase/migrations`: SQL schema definitions and RLS policies.

### Core Features
- **Economic Blocs**: Regional filtering for products and sellers.
- **CamRency Wallet**: Integrated financial system for payments and transfers.
- **CaMark Cards**: Generation of virtual and physical Visa cards.
- **KYC System**: Advanced user verification with ID upload and profile approval.

## 4. Database Schema (Key Tables)

| Table Name | Description |
| :--- | :--- |
| `profiles` | User accounts with roles (`buyer`, `seller`, `farmer`, `admin`) and KYC status. |
| `wallets` | Balance and currency tracking for users. |
| `cards` | Virtual/Physical card details (card number, expiry, CVV). |
| `products` | Marketplace items with categories and bargain status. |
| `orders` | Transaction records linking buyers and products. |
| `deliveries` | Tracking and status updates for orders. |
| `notifications` | In-app alerts for orders, wallet actions, and system updates. |

## 5. Financial Infrastructure

### CamRency Wallet
The wallet system supports multi-currency (XAF, NGN, USD, GBP) and allows users to:
- **Add Money**: Top up balance via integrated gateways.
- **Pay Merchants**: Instant payment for marketplace orders.
- **Send Money**: Peer-to-peer transfers.
- **Withdraw**: Transfer funds to external accounts.

### CaMark Cards
Users can generate Visa cards directly from their dashboard:
- **Virtual Cards**: Instant generation for online shopping (Fee: 2,500 FCFA).
- **Physical Cards**: Delivered to the user's address (Fee: 5,000 FCFA).

## 6. Internationalization (i18n)
The app uses `react-i18next` for multilingual support. Language detection is configured to automatically set the user's preferred language based on browser settings or profile preference.
