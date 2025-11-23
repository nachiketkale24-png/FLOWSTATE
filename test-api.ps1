# FlowState Backend API Testing Suite
# Complete test coverage for all endpoints

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   FLOWSTATE API TESTING SUITE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:3001"
$headers = @{ "Content-Type" = "application/json" }
$testResults = @()

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [string]$Body = $null,
        [string]$Description
    )
    
    Write-Host "`n[$Method] $Url" -ForegroundColor Yellow
    Write-Host "Test: $Name" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri = "$baseUrl$Url"
            Method = $Method
            Headers = $headers
            TimeoutSec = 10
        }
        
        if ($Body) {
            $params.Body = $Body
        }
        
        $response = Invoke-RestMethod @params -ErrorAction Stop
        
        Write-Host "✅ PASS - Status: 200" -ForegroundColor Green
        Write-Host "Response: $($response | ConvertTo-Json -Depth 2 -Compress)" -ForegroundColor White
        
        $script:testResults += @{
            Name = $Name
            Status = "PASS"
            Method = $Method
            Url = $Url
        }
        
        return $response
    }
    catch {
        Write-Host "❌ FAIL - Error: $($_.Exception.Message)" -ForegroundColor Red
        
        $script:testResults += @{
            Name = $Name
            Status = "FAIL"
            Method = $Method
            Url = $Url
            Error = $_.Exception.Message
        }
        
        return $null
    }
}

# ============================================================================
# 1. HEALTH CHECK & INFO
# ============================================================================

Write-Host "`n" -NoNewline
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "TEST SUITE 1: HEALTH & INFO ENDPOINTS" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

Test-Endpoint -Name "Root Info" -Method "GET" -Url "/" -Description "Get API info"

Test-Endpoint -Name "Health Check" -Method "GET" -Url "/health" -Description "Check server health"

# ============================================================================
# 2. AI CHAT ASSISTANT
# ============================================================================

Write-Host "`n" -NoNewline
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "TEST SUITE 2: AI CHAT ASSISTANT" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

$chatBody1 = @{
    message = "How's my flow today?"
    userId = "demo-user"
} | ConvertTo-Json

Test-Endpoint -Name "AI Chat - Simple" -Method "POST" -Url "/api/ai/message" -Body $chatBody1 -Description "Basic chat message"

$chatBody2 = @{
    message = "Tips to improve focus"
    userId = "demo-user"
    context = @{
        currentMetrics = @{
            flowScore = 75
            flowState = "MONITORING"
            staminaScore = 60
            attentionScore = 80
            distractionEvents = 3
        }
        todayStats = @{
            totalSessions = 5
            avgFlowScore = 72
            totalTime = 180
            currentStreak = 3
        }
        recentSessions = @(
            @{ flowScore = 80; duration = 3600; distractions = 2 }
            @{ flowScore = 70; duration = 2400; distractions = 5 }
            @{ flowScore = 68; duration = 1800; distractions = 3 }
        )
    }
} | ConvertTo-Json -Depth 5

Test-Endpoint -Name "AI Chat - With Context" -Method "POST" -Url "/api/ai/message" -Body $chatBody2 -Description "Chat with full session context"

$chatBody3 = @{
    message = "Analyze my session"
    userId = "demo-user"
} | ConvertTo-Json

Test-Endpoint -Name "AI Chat - Analysis" -Method "POST" -Url "/api/ai/message" -Body $chatBody3 -Description "Session analysis request"

$chatBody4 = @{
    message = "When am I most productive?"
    userId = "demo-user"
} | ConvertTo-Json

Test-Endpoint -Name "AI Chat - Productivity" -Method "POST" -Url "/api/ai/message" -Body $chatBody4 -Description "Productivity pattern query"

# ============================================================================
# 3. SESSION MANAGEMENT
# ============================================================================

Write-Host "`n" -NoNewline
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "TEST SUITE 3: SESSION MANAGEMENT" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

$sessionStartBody = @{
    userId = "demo-user"
    startTime = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    initialMetrics = @{
        flowScore = 0
        staminaScore = 0
        distractionEvents = 0
    }
} | ConvertTo-Json -Depth 3

$sessionResponse = Test-Endpoint -Name "Start Session" -Method "POST" -Url "/api/sessions/start" -Body $sessionStartBody -Description "Start new tracking session"

if ($sessionResponse -and $sessionResponse.data.sessionId) {
    $sessionId = $sessionResponse.data.sessionId
    Write-Host "`nCreated Session ID: $sessionId" -ForegroundColor Green
    
    # Update session
    $sessionUpdateBody = @{
        metrics = @{
            flowScore = 75
            staminaScore = 60
            typingCadence = 120
            distractionEvents = 2
            attentionScore = 85
        }
    } | ConvertTo-Json -Depth 3
    
    Test-Endpoint -Name "Update Session" -Method "POST" -Url "/api/sessions/$sessionId/update" -Body $sessionUpdateBody -Description "Update session metrics"
    
    # End session
    $sessionEndBody = @{
        endTime = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        finalMetrics = @{
            flowScore = 82
            staminaScore = 55
            totalKeystrokes = 1500
            distractionEvents = 3
            blockedCount = 2
        }
    } | ConvertTo-Json -Depth 3
    
    Test-Endpoint -Name "End Session" -Method "POST" -Url "/api/sessions/$sessionId/end" -Body $sessionEndBody -Description "End tracking session"
    
    # Get session details
    Test-Endpoint -Name "Get Session" -Method "GET" -Url "/api/sessions/$sessionId" -Description "Retrieve session details"
}

# ============================================================================
# 4. ANALYSIS & INSIGHTS
# ============================================================================

Write-Host "`n" -NoNewline
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "TEST SUITE 4: ANALYSIS & INSIGHTS" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

$flowAnalysisBody = @{
    metrics = @{
        typingCadence = 120
        activeRatio = 0.85
        flowScore = 75
        flowState = "MONITORING"
        sessionDuration = 3600
        blockedCount = 2
    }
} | ConvertTo-Json -Depth 3

Test-Endpoint -Name "Analyze Flow State" -Method "POST" -Url "/api/analysis/flow" -Body $flowAnalysisBody -Description "Real-time flow analysis"

$insightsBody = @{
    sessionData = @{
        sessionDuration = 3600
        flowDuration = 2800
        staminaScore = 65
        flowScore = 78
        blockedCount = 3
        distractionEvents = 5
        focusStabilityScore = 82
    }
} | ConvertTo-Json -Depth 3

Test-Endpoint -Name "Generate Insights" -Method "POST" -Url "/api/analysis/insights" -Body $insightsBody -Description "AI-powered session insights"

# ============================================================================
# 5. USER STATS & HISTORY
# ============================================================================

Write-Host "`n" -NoNewline
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "TEST SUITE 5: USER STATS & HISTORY" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

Test-Endpoint -Name "Get User Sessions" -Method "GET" -Url "/api/users/demo-user/sessions?limit=5" -Description "Retrieve user session history"

Test-Endpoint -Name "Get User Stats" -Method "GET" -Url "/api/users/demo-user/stats" -Description "Get user statistics"

# ============================================================================
# 6. GOALS & ACHIEVEMENTS
# ============================================================================

Write-Host "`n" -NoNewline
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "TEST SUITE 6: GOALS & ACHIEVEMENTS" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

$createGoalBody = @{
    title = "Complete 5 focused sessions"
    description = "Achieve flow state for 5 consecutive sessions"
    targetValue = 5
    currentValue = 0
    deadline = (Get-Date).AddDays(7).ToString("yyyy-MM-dd")
    category = "productivity"
} | ConvertTo-Json

$goalResponse = Test-Endpoint -Name "Create Goal" -Method "POST" -Url "/api/goals" -Body $createGoalBody -Description "Create new goal"

if ($goalResponse -and $goalResponse.data.goalId) {
    $goalId = $goalResponse.data.goalId
    Write-Host "`nCreated Goal ID: $goalId" -ForegroundColor Green
    
    # Update goal progress
    $updateGoalBody = @{
        currentValue = 3
        status = "in_progress"
    } | ConvertTo-Json
    
    Test-Endpoint -Name "Update Goal" -Method "PUT" -Url "/api/goals/$goalId" -Body $updateGoalBody -Description "Update goal progress"
}

Test-Endpoint -Name "Get All Goals" -Method "GET" -Url "/api/goals" -Description "List all user goals"

Test-Endpoint -Name "Get Achievements" -Method "GET" -Url "/api/achievements" -Description "List unlocked achievements"

$unlockAchievementBody = @{
    achievementId = "first_flow_session"
    title = "First Flow"
    description = "Completed your first flow session"
    category = "milestone"
} | ConvertTo-Json

Test-Endpoint -Name "Unlock Achievement" -Method "POST" -Url "/api/achievements/unlock" -Body $unlockAchievementBody -Description "Award achievement"

# ============================================================================
# 7. ERROR HANDLING TESTS
# ============================================================================

Write-Host "`n" -NoNewline
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "TEST SUITE 7: ERROR HANDLING" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

Test-Endpoint -Name "Invalid Route" -Method "GET" -Url "/api/invalid/endpoint" -Description "Test 404 handling"

$emptyBody = @{} | ConvertTo-Json
Test-Endpoint -Name "Empty Chat Message" -Method "POST" -Url "/api/ai/message" -Body $emptyBody -Description "Test validation error"

Test-Endpoint -Name "Invalid Session ID" -Method "GET" -Url "/api/sessions/invalid-session-123" -Description "Test invalid ID handling"

# ============================================================================
# TEST SUMMARY
# ============================================================================

Write-Host "`n" -NoNewline
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

$passed = ($testResults | Where-Object { $_.Status -eq "PASS" }).Count
$failed = ($testResults | Where-Object { $_.Status -eq "FAIL" }).Count
$total = $testResults.Count

Write-Host "`nTotal Tests: $total" -ForegroundColor White
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor Red
Write-Host "Success Rate: $([math]::Round(($passed / $total) * 100, 2))%" -ForegroundColor Yellow

if ($failed -gt 0) {
    Write-Host "`nFailed Tests:" -ForegroundColor Red
    $testResults | Where-Object { $_.Status -eq "FAIL" } | ForEach-Object {
        Write-Host "  ❌ $($_.Name) - $($_.Method) $($_.Url)" -ForegroundColor Red
        if ($_.Error) {
            Write-Host "     Error: $($_.Error)" -ForegroundColor Gray
        }
    }
}

Write-Host "`n" -NoNewline
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "Testing Complete!" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""
