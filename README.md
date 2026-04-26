# IPL Analytics & Franchise Intelligence Dashboard

A comprehensive end-to-end data analytics project that transforms raw IPL match data into actionable franchise intelligence. This platform provides deep insights into the performance, strategies, and historical trends of all 10 IPL franchises.

## 🚀 Project Overview

This project was developed as a complete analytics pipeline, starting from raw data extraction to interactive visual storytelling. The goal was to build a 'Franchise Intelligence' dashboard that goes beyond basic stats to provide narrative-driven insights.

### 🛠 The End-to-End Workflow

1.  **Data Acquisition**: Sourced comprehensive IPL match datasets (19 seasons) from **cricsheet.org**.
2.  **API Analysis & Exploration**: Used **Postman** to analyze API responses and explore data structures, ensuring robust data mapping for the frontend.
3.  **KPI Formulation**: Defined and calculated critical performance metrics (KPIs) including:
    *   **All-time Win Rates** and Season-over-Season trends.
    *   **Phase-of-Play Strengths** (Powerplay, Death Overs, Fielding).
    *   **Venue Performance Analysis** (Home vs. Away dominance).
    *   **Rivalry Net Ratings** (Head-to-head dominance).
4.  **UI/UX Development**: Built a premium, responsive dashboard using **React.js** (developed within a high-speed iterative environment) to visualize these insights.
5.  **Insight Generation**: Implemented logic-based narrative generation to provide a "Franchise Summary" for every team.

---

## 💻 Technology Stack

| Layer | Technology | Purpose |
| --- | --- | --- |
| **Frontend** | React 19 + Vite + TypeScript | Modern, ultra-fast UI framework. |
| **Styling** | Tailwind CSS v4 + shadcn/ui | Beautiful, responsive, and consistent design system. |
| **Charts** | Recharts | Interactive data visualizations (Donuts, Areas, Radars). |
| **Backend** | Node.js + Express (TypeScript) | Scalable API layer for serving processed insights. |
| **Data Validation** | Zod | Ensures type-safe data communication between client and server. |
| **State Management** | TanStack React Query | Optimized data fetching and caching. |

---

## 📊 Key Features

*   **Franchise Hero Dashboard**: Branded interface that adapts its UI theme (colors, logos) to the selected team.
*   **Dynamic Performance Metrics**: Real-time calculation of win percentages, performance trends, and season-by-season form.
*   **Strategic Radar Charts**: Visualizing team strengths across different phases of the game (Batting, Bowling, Fielding).
*   **H2H Rivalry Analysis**: Deep dive into how a team performs against specific opponents.
*   **Automated Insights**: Deterministic narrative generation that summarizes a team's performance based on its historical data.

---

## 🛠 How to Run Locally

### Prerequisites
- Node.js (v18+)
- pnpm (Recommended)
- Python 3.10+ (Optional, only for data analysis scripts in `analysis/`)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/knganapati/IPL-analytics.git
   cd IPL-analytics
   ```

2. Install UI dependencies:
   ```bash
   pnpm install
   ```

3. (Optional) Install analysis dependencies:
   ```bash
   pip install -r analysis/requirements.txt
   ```

3. Build and Start:
   ```bash
   # Start the backend and frontend in development mode
   pnpm run dev
   ```

---

## 🌐 Deployment

The project is optimized for deployment on **Vercel**.

### Deploy to Vercel
1. Push your changes to GitHub.
2. Link your GitHub repository to Vercel.
3. Vercel will automatically detect the monorepo structure.
4. Set the root directory if prompted, and the build commands (`pnpm install && pnpm run build`) will handle the rest.

A `vercel.json` configuration is included to manage the routing between the React frontend and the Express backend serverless functions.

---

## 📑 Data Attribution
- Historical Match Data: [Cricsheet](https://cricsheet.org)
- Real-time Scoreboard (Optional): [CricketData API](https://cricketdata.org)

---

## 📄 License
This project is licensed under the MIT License.
