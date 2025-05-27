// using BudgetApi.Models;
using Microsoft.AspNetCore.Authorization;
// using BudgetApi.Data;
using BudgetApi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using BudgetApi.Models;
using BudgetApi.Data;



namespace BudgetApi.Controllers
{
    [ApiController]
    [Route("api/families")]
    [Authorize]
    public class FamilyController : ControllerBase
    {
        private readonly IFamilyService _familyService;
        private readonly IUserService _userService;
        private readonly INotificationService _notificationService;

        private readonly AppDbContext _context;

        public FamilyController(
            IFamilyService familyService,
            IUserService userService,
            INotificationService notificationService,
            AppDbContext context)
        {
            _familyService = familyService;
            _userService = userService;
            _notificationService = notificationService;
            _context = context;
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateFamily([FromBody] CreateFamilyRequest request)
        {
            Console.WriteLine("Create family - controller");
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            try
            {
                var family = await _familyService.CreateFamily(userId, request.RelationshipType, request.IncomeTypes);

                return Ok(new
                {
                    family.Id,
                    family.CreatorId
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("request-join")]
        public async Task<IActionResult> RequestToJoinFamily([FromBody] JoinFamilyRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                // Проверяем существование пользователя-создателя
                var creator = await _userService.GetUserByEmail(request.CreatorEmail);
                if (creator == null)
                    return NotFound($"Пользователь с email {request.CreatorEmail} не найден");

                // Проверяем существование текущего пользователя
                var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (currentUserId == null)
                    return Unauthorized();
                var currentUser = await _userService.GetUserById(currentUserId);
                if (currentUser == null)
                    return Unauthorized();

                // Отправляем уведомление
                await _notificationService.SendJoinRequestAsync(
                    currentUser.Email,
                    creator.Email,
                    request.Message ?? "Хочу присоединиться к вашей семье");

                return Ok(new
                {
                    Message = "Заявка отправлена создателю семьи",
                    Creator = creator.Email,
                    User = currentUser.Email
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ошибка при отправке заявки: {ex.Message}");
            }
        }

        // FamilyController.cs
[       HttpGet("current")]
        public async Task<IActionResult> GetCurrentFamily()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var family = await _context.Families
                .FirstOrDefaultAsync(f => f.FamilyMembers.Any(fm => fm.UserId == userId));
            
            if (family == null)
                return NotFound();
            
            return Ok(family);
        }
    }

    public class JoinFamilyRequest
    {
        public string CreatorEmail { get; set; } = string.Empty;
        public string? Message { get; set; }
    }
}
