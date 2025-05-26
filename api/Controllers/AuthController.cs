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
    private readonly IFamilyService _familyService;

    // Конструктор с обоими зависимостями
    public AuthController(AppDbContext context, IAuthService authService, IFamilyService familyService)
    {
        _context = context; // Сохраняем контекст в поле
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

    // AuthController.cs
    // [HttpPost("create-family")]
    // [Authorize]
    // public async Task<IActionResult> CreateFamily(
    //     [FromBody] CreateFamilyRequest request)
    // {
    //     var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    //     if (string.IsNullOrEmpty(userId))
    //         return Unauthorized();

    //     try
    //     {
    //         var family = await _familyService.CreateFamily(
    //             creatorId: userId,
    //             relationshipType: request.RelationshipType,
    //             incomeTypes: request.IncomeTypes);

    //         return Ok(new 
    //         {
    //             family.Id,
    //             family.CreatorId,
    //             isAdmin = true
    //         });
    //     }
    //     catch (Exception ex)
    //     {
    //         return BadRequest(new { error = ex.Message });
    //     }
    // }
}