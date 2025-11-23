# AI Assistant Page Documentation

## 🎯 Overview

The **AssistantPage** is a fully-functional AI chat interface that provides personalized productivity coaching and real-time insights based on the user's flow tracking data.

---

## ✨ Features

### 1. **Three-Column Layout**

#### Left Sidebar (Session Stats)
- **Current Session Status**: Live flow score, duration, flow state
- **Overall Statistics**: Total sessions, average flow score, best streak
- **Quick Actions**: Pre-defined questions for fast interaction

#### Middle Chat Area
- **Message History**: Scrollable chat with user and AI messages
- **Typing Animation**: Three-dot bounce animation while AI responds
- **Message Bubbles**: Glassmorphic design with avatars
- **Timestamps**: Show message send time
- **Suggestions**: AI can provide follow-up question buttons

#### Bottom Input
- **Text Input**: Full-width input field with glassmorphic styling
- **Send Button**: Gradient button with icon
- **Enter Key Support**: Press Enter to send
- **Mobile Quick Actions**: Horizontal scroll of quick questions

---

## 🔌 Backend Integration

### API Endpoint
```javascript
POST /api/ai/message
```

### Request Format
```json
{
  "message": "How's my flow today?",
  "userId": "demo-user",
  "context": {
    "currentMetrics": {
      "flowScore": 85,
      "staminaScore": 72,
      "flowState": "Deep Flow",
      "typingCadence": 68,
      "distractionEvents": 2
    },
    "isActive": true,
    "sessionDuration": 45,
    "totalSessions": 12,
    "avgFlowScore": 78
  }
}
```

### Response Format
```json
{
  "success": true,
  "data": {
    "message": "Your flow is looking great today! You're maintaining an 85 flow score...",
    "suggestions": [
      "Show me my weekly trends",
      "Tips to reduce distractions",
      "Best time to take a break"
    ]
  }
}
```

---

## 🎨 UI Components

### Message Bubble
```jsx
<div className="bg-purple-500/10 border border-purple-500/20 px-4 py-3 rounded-2xl">
  <p className="text-sm text-white">{content}</p>
</div>
```

### Typing Indicator
```jsx
<div className="flex gap-1">
  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" 
       style={{ animationDelay: '0ms' }} />
  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" 
       style={{ animationDelay: '150ms' }} />
  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" 
       style={{ animationDelay: '300ms' }} />
</div>
```

### Avatar Icons
- **AI**: Bot icon with purple-to-cyan gradient
- **User**: User icon with pink-to-orange gradient

---

## 🧠 Context Awareness

The AI assistant receives rich context about the user's current state:

### Current Metrics
- Flow score
- Stamina score
- Flow state (Deep Flow, Shallow Flow, etc.)
- Typing cadence
- Distraction events

### Session Data
- Is session active?
- Current session duration
- Total completed sessions
- Average flow score across all sessions

This context allows the AI to:
- Give personalized recommendations
- Analyze current performance
- Suggest optimizations based on patterns
- Celebrate achievements
- Provide timely break reminders

---

## 🔄 Message Flow

1. **User types message** → Input value updated
2. **User clicks Send** → Message added to chat
3. **Show typing indicator** → 3-dot animation
4. **API call** → Send message + context to backend
5. **Simulate typing delay** → 800ms pause for realism
6. **Add AI response** → Display message with suggestions
7. **Auto-scroll** → Scroll to bottom of chat

---

## 🛡️ Error Handling

### Network Failure
```javascript
catch (err) {
  setError('Failed to get response. Using offline mode.');
  
  // Show fallback message
  const fallbackMessage = {
    content: "I'm having trouble connecting..."
  };
}
```

### Graceful Degradation
- Shows error banner at top of chat
- Provides fallback response
- Allows user to continue conversation
- Retry available on next message

---

## 📱 Responsive Design

### Desktop (lg+)
- Three-column layout
- Sidebar with stats and quick actions
- Large chat area
- Full-size input

### Tablet (md)
- Collapsible sidebar
- Medium chat area
- Icons visible on send button

### Mobile (sm)
- Single column layout
- Stats cards stack above chat
- Chat takes full width
- Mobile quick actions scroll horizontally
- Compact input with icon-only send button

---

## 🎭 Quick Actions

Pre-defined questions for common queries:

1. **"How's my flow today?"** → Analyze current session
2. **"Tips to improve focus"** → Get productivity advice
3. **"Analyze my session"** → Deep dive into metrics
4. **"Best time to work"** → Find peak productivity hours

Click a quick action to auto-fill the input field.

---

## 🔮 Future Enhancements

### Planned Features
- [ ] **Voice Input**: Speak to the AI assistant
- [ ] **Message History Persistence**: Save conversations in Firebase
- [ ] **Multi-turn Context**: AI remembers conversation history
- [ ] **Markdown Support**: Render formatted text, code blocks
- [ ] **Image/Chart Responses**: AI generates visual insights
- [ ] **Smart Suggestions**: Context-aware follow-up questions
- [ ] **Emotion Detection**: Analyze user sentiment
- [ ] **Proactive Tips**: AI initiates conversation based on metrics

### Backend AI Enhancements
- [ ] RAG (Retrieval Augmented Generation) for knowledge base
- [ ] Fine-tuned model on productivity research
- [ ] Session analysis with historical data
- [ ] Predictive flow state modeling
- [ ] Personalized coaching strategies

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] Send a message and receive response
- [ ] Click quick action buttons
- [ ] Test Enter key to send
- [ ] Verify typing animation appears
- [ ] Check auto-scroll to bottom
- [ ] Test with backend offline (fallback)
- [ ] Verify timestamps are correct
- [ ] Test on mobile viewport
- [ ] Check horizontal scroll on mobile quick actions
- [ ] Verify session stats update in real-time

### Example Test Messages
```
"What's my current flow score?"
"How can I improve my focus?"
"Show me today's progress"
"When should I take a break?"
"Analyze my productivity patterns"
```

---

## 📊 Analytics Integration

The assistant pulls live data from:

### FlowContext
```javascript
const { 
  metrics,        // Current flow metrics
  isActive,       // Session active?
  sessionDuration, // Total minutes
  flowState,      // Current flow state
  history         // Past sessions
} = useFlow();
```

### Calculated Stats
- **Total Sessions**: `history.length`
- **Avg Flow Score**: Mean of all session flow scores
- **Best Streak**: Maximum flow score achieved
- **Current Duration**: `sessionDuration / 60` minutes

---

## 🎨 Styling

### Color Scheme
- **AI Messages**: Purple/cyan gradient background
- **User Messages**: Pink/orange gradient background
- **Sidebar**: Dark glassmorphic cards
- **Input**: Dark with purple border
- **Send Button**: Purple-to-cyan gradient

### Glassmorphism Effects
```css
.glass-card {
  background: rgba(139, 92, 246, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(139, 92, 246, 0.2);
}
```

---

## 🚀 Usage Example

```jsx
// Navigate to assistant page
<Link to="/assistant">AI Assistant</Link>

// Component auto-connects to FlowContext
// Start chatting immediately
// AI provides personalized insights based on your data
```

---

## 🤝 Contributing

To enhance the AI assistant:

1. **Add new quick actions** in the `quickActions` array
2. **Customize context** in the `context` object sent to API
3. **Style message bubbles** in the message mapping section
4. **Add suggestion types** in the backend response handler

---

## 📝 Notes

- Currently uses `'demo-user'` as userId (add auth later)
- Typing animation delay: 800ms (adjust in `handleSendMessage`)
- Auto-scroll uses `smooth` behavior
- Error banner auto-appears on API failure
- Suggestions render as clickable buttons below AI messages

---

**Status**: ✅ **Production Ready**

The AI Assistant page is fully functional and ready for user testing!
