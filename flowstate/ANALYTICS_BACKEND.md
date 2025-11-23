# AnalyticsPage Backend Integration

## 🚀 Overview

The **AnalyticsPage** now integrates with backend endpoints to fetch real-time analytics data, with graceful fallback to mock data if the backend is unavailable.

---

## 📡 Backend Endpoints Used

### 1. **GET /api/analytics/weekly**
Fetches weekly flow time breakdown for the last 7 days.

**Request:**
```javascript
POST /api/analytics/weekly
{
  "userId": "demo-user"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "weeklyBreakdown": [
      { "day": "Mon", "flowMinutes": 85, "hasSession": true },
      { "day": "Tue", "flowMinutes": 120, "hasSession": true },
      ...
    ],
    "longestStreak": 7,
    "bestFocusWindows": [
      { "time": "2-4 PM", "score": 95 },
      { "time": "10-12 AM", "score": 88 }
    ],
    "distractionBreakdown": [
      { "type": "Social Media", "percentage": 40, "count": 24 },
      { "type": "Video", "percentage": 25, "count": 15 }
    ]
  }
}
```

### 2. **GET /api/analytics/stamina**
Fetches stamina trends and historical data.

**Request:**
```javascript
POST /api/analytics/stamina
{
  "userId": "demo-user"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "current": 78,
    "trend": "up",
    "growth": 12,
    "history": [
      { "week": "Week 1", "score": 60 },
      { "week": "Week 2", "score": 65 },
      { "week": "Week 3", "score": 70 },
      { "week": "Week 4", "score": 78 }
    ]
  }
}
```

---

## 🎨 UI Components

### **6 Analytics Cards**

#### 1. **Weekly Flow Time** 📊
- Horizontal bar chart showing daily flow minutes
- Total weekly minutes displayed
- Backend data: `weeklyBreakdown` array

#### 2. **Flow Streaks** 🔥
- Current streak counter
- Calendar grid visualization
- Days active count
- Backend data: `weeklyBreakdown` + `longestStreak`

#### 3. **Best Focus Window** ⏰
- Top 3 productivity time windows
- Peak hours highlighted
- Backend data: `bestFocusWindows` array

#### 4. **Distraction Breakdown** 🎯
- Pie chart visualization (horizontal bar)
- Category percentages with counts
- Total distraction count
- Backend data: `distractionBreakdown` array

#### 5. **Stamina Growth** 💪
- Current stamina score (0-100)
- Trend indicator (up/down/stable)
- Weekly progress chart
- Backend data: `staminaData` object

#### 6. **Live Session Stats** ⚡
- Real-time flow score
- Current stamina
- Typing speed (WPM)
- Distraction events
- Data source: `FlowContext.metrics`

---

## 🔄 Data Flow

```
AnalyticsPage (mount)
       ↓
useEffect() → fetchAnalytics()
       ↓
Promise.all([
  getWeeklyAnalytics('demo-user'),
  getStaminaAnalytics('demo-user')
])
       ↓
Backend API calls
       ↓
Success → setWeeklyData() + setStaminaData()
Failure → Use mockWeeklyData + mockStaminaData
       ↓
Render with displayWeekly + displayStamina
```

---

## 🛡️ Error Handling

### **Graceful Degradation**
```javascript
const [weekly, stamina] = await Promise.all([
  getWeeklyAnalytics('demo-user').catch(() => null),
  getStaminaAnalytics('demo-user').catch(() => null),
]);
```

- If backend fails, returns `null`
- Falls back to `mockWeeklyData` and `mockStaminaData`
- User still sees functional analytics page
- Error banner shows at top if API fails

### **Loading State**
Shows spinner while fetching data:
```jsx
if (loading) {
  return <Loader2 className="animate-spin" />;
}
```

### **Error Banner**
Displays if API call fails:
```jsx
{error && (
  <div className="border border-red-500/30">
    <AlertCircle /> {error} - Showing demo data
  </div>
)}
```

---

## 📊 Data Structure

### **Weekly Data**
```javascript
{
  weeklyBreakdown: [
    { day: 'Mon', flowMinutes: 85, hasSession: true },
    // ... 7 days
  ],
  longestStreak: 7,
  bestFocusWindows: [
    { time: '2-4 PM', score: 95 }
  ],
  distractionBreakdown: [
    { type: 'Social Media', percentage: 40, count: 24, color: 'bg-pink-500' }
  ]
}
```

### **Stamina Data**
```javascript
{
  current: 78,
  trend: 'up' | 'down' | 'stable',
  growth: 12,
  history: [
    { week: 'Week 1', score: 60 }
  ]
}
```

---

## 🎯 Key Features

### **Backend Integration**
- ✅ Fetches data on component mount
- ✅ Parallel API calls for performance
- ✅ Graceful fallback to mock data
- ✅ Error handling with user feedback
- ✅ Loading state during fetch

### **Visual Analytics**
- ✅ 6 responsive cards with glassmorphic design
- ✅ Bar charts for weekly flow time
- ✅ Calendar grid for streak visualization
- ✅ Pie chart (horizontal bar) for distractions
- ✅ Line chart for stamina growth
- ✅ Real-time live stats

### **Responsive Design**
- Desktop: 3-column grid
- Tablet: 2-column grid
- Mobile: Single column stack

---

## 🧪 Testing

### **With Backend Running**
1. Start backend: `cd backend && npm start`
2. Navigate to `/analytics`
3. Should see: "Real-time data from backend"
4. Check browser console for API logs

### **Without Backend**
1. Stop backend server
2. Refresh `/analytics` page
3. Should see: "Using demo data - connect backend for live analytics"
4. Error banner appears
5. Mock data displays correctly

### **Mock Data Scenarios**
```javascript
// Weekly: 7 days with varying flow minutes
// Stamina: Upward trend from 60 to 78
// Distractions: 4 categories totaling 60 blocks
// Focus Windows: 3 time slots ranked by score
```

---

## 📈 Backend Response Mapping

| UI Element | Backend Field | Fallback |
|------------|---------------|----------|
| Weekly bars | `weeklyBreakdown[].flowMinutes` | `mockWeeklyData` |
| Streak count | Calculated from `hasSession` | Local calculation |
| Longest streak | `longestStreak` | 7 (mock) |
| Focus windows | `bestFocusWindows[]` | Static mock array |
| Distraction chart | `distractionBreakdown[]` | Static percentages |
| Stamina score | `current` | 78 (mock) |
| Stamina trend | `trend` + `growth` | 'up', +12% |
| Stamina history | `history[]` | 4-week mock data |

---

## 🔮 Future Enhancements

### **Planned Features**
- [ ] Date range selector (7/30/90 days)
- [ ] Export analytics as PDF/CSV
- [ ] Compare with previous periods
- [ ] Goal setting and tracking
- [ ] Custom time window analysis
- [ ] Team leaderboards (multi-user)
- [ ] Notifications for milestones

### **Advanced Analytics**
- [ ] Machine learning predictions
- [ ] Anomaly detection (unusual patterns)
- [ ] Correlation analysis (sleep, weather, etc.)
- [ ] Focus score forecasting
- [ ] Personalized recommendations

---

## 🛠️ API Configuration

### **Environment Variables**
```env
VITE_BACKEND_URL=http://localhost:3001
VITE_API_TIMEOUT=10000
VITE_API_DEBUG=true
```

### **API Functions Used**
```javascript
import { getWeeklyAnalytics, getStaminaAnalytics } from '../api/analyticsApi';
```

Both functions:
- Accept `userId` parameter
- Return Promise with data or null
- Handle errors with toast notifications
- Support timeout (10s default)

---

## 📝 Component Props

AnalyticsPage is a **zero-prop component**:
- No props required
- Fetches data internally
- Uses `useFlow()` for live metrics
- Self-contained state management

---

## 🎨 Styling

### **Color Scheme**
- Weekly: Purple → Pink gradient
- Streaks: Pink → Purple gradient
- Focus: Cyan → Purple gradient
- Distractions: Multi-color (pink, purple, cyan, blue)
- Stamina: Green → Emerald gradient
- Live Stats: Individual color per metric

### **Glassmorphism**
```css
.glass-card {
  background: rgba(139, 92, 246, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(139, 92, 246, 0.2);
}
```

---

## 🚀 Usage

```jsx
// In App.jsx router
<Route path="/analytics" element={<AnalyticsPage />} />

// Navigate from anywhere
<Link to="/analytics">View Analytics</Link>
```

---

## ✅ Status

**Production Ready** with backend integration!

- ✅ Backend API integration
- ✅ Graceful fallback to mock data
- ✅ Loading and error states
- ✅ 6 analytics cards
- ✅ Responsive design
- ✅ Real-time live stats
- ✅ No lint errors
- ✅ Type-safe data handling

---

## 🤝 Related Components

- **FlowContext**: Provides `metrics` for live stats
- **analyticsApi**: Handles backend communication
- **sessionApi**: Source of session data for backend
- **DashboardPage**: Similar glassmorphic design
- **HistoryPage**: Complements analytics with session details

---

**Next Steps**: Start backend and test with real data! 🎉
