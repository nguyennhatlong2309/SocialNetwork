$loginResponse = Invoke-RestMethod -Uri "http://localhost:5231/api/Auth/login" -Method Post -Body (@{ username = "alex_m"; password = "Password123!" } | ConvertTo-Json) -ContentType "application/json"
$token = $loginResponse.data.accessToken
Write-Host "Token: $token"

# Test get posts
$posts = Invoke-RestMethod -Uri "http://localhost:5231/api/Posts" -Method Get -Headers @{ Authorization = "Bearer $token" }
Write-Host "Posts: $($posts.data.Count)"

# Test like
$likeResponse = Invoke-RestMethod -Uri "http://localhost:5231/api/Posts/1/like" -Method Post -Headers @{ Authorization = "Bearer $token" }
Write-Host "Like response: $($likeResponse | ConvertTo-Json -Depth 3)"

# Test comment
$commentResponse = Invoke-RestMethod -Uri "http://localhost:5231/api/Posts/1/comments" -Method Post -Headers @{ Authorization = "Bearer $token" } -Body (@{ content = "Test comment" } | ConvertTo-Json) -ContentType "application/json"
Write-Host "Comment response: $($commentResponse | ConvertTo-Json -Depth 3)"
