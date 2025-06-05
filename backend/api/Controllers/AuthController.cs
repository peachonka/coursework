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
    private readonly AppDbContext _context;
    private readonly IAuthService _authService;
    private readonly IFamilyService _familyService;

    public AuthController(AppDbContext context, IAuthService authService, IFamilyService familyService)
    {
        _context = context; 
        _authService = authService;
        _familyService = familyService;
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

        Response.Cookies.Append("jwt_token", token, new CookieOptions
        {
            HttpOnly = true,
            Secure = true, // Для localhost можно false, в production - true
            SameSite = SameSiteMode.None,
            Expires = DateTime.UtcNow.AddDays(1),
            Path = "/",
            Domain = "localhost" // Для локальной разработки
        });

        return Ok(new { token });
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await _context.Users // Теперь _context доступен
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) return NotFound();

        return Ok(new
        {
            id = user.Id,
            email = user.Email,
        });
    }
    
    [HttpPost("logout")]
    [Authorize]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("jwt_token");
        return Ok(new { message = "Logged out successfully" });
    }
}