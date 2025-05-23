using BudgetApi.Models;
using Microsoft.AspNetCore.Authorization;
using BudgetApi.Data;
using BudgetApi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context; // Добавляем поле для контекста
    private readonly IAuthService _authService;

    // Конструктор с обоими зависимостями
    public AuthController(AppDbContext context, IAuthService authService)
    {
        _context = context; // Сохраняем контекст в поле
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto registerDto)
    {
        var user = await _authService.Register(registerDto);
        return Ok(new { user.Id });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto loginDto)
    {
        var token = await _authService.Login(loginDto);
        return Ok(new { token });
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await _context.Users // Теперь _context доступен
            .FirstOrDefaultAsync(u => u.Id == userId);
        
        if (user == null) return NotFound();
        
        return Ok(new {
            id = user.Id,
            email = user.Email,
            name = user.Name
        });
    }
    
    [HttpPost("assign-admin/{targetUserId}")]
    [Authorize]
    public async Task<IActionResult> AssignAdminRole(string targetUserId)
    {
        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(currentUserId))
            return Unauthorized();

        var result = await _authService.AssignAdminRole(currentUserId, targetUserId);
        return result ? Ok() : BadRequest();
    }
}