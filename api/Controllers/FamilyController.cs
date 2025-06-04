using Microsoft.AspNetCore.Authorization;
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
                var family = await _familyService.CreateFamily(userId, request.Name, request.RelationshipType, request.IncomeTypes);

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
        public async Task<IActionResult> RequestToJoinFamily([FromBody] JoinFamilyRequestDto requestDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var creator = await _userService.GetUserByEmail(requestDto.CreatorEmail);
                if (creator == null)
                    return NotFound($"User with email {requestDto.CreatorEmail} not found");

                var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (currentUserId == null)
                    return Unauthorized();
                    
                var currentUser = await _userService.GetUserById(currentUserId);
                if (currentUser == null)
                    return Unauthorized();

                var family = await _context.Families
                    .FirstOrDefaultAsync(f => f.CreatorId == creator.Id);
                    
                if (family == null)
                    return BadRequest("The creator hasn't created a family yet");

                var request = new JoinFamilyRequest
                {
                    Id = Guid.NewGuid().ToString(),
                    UserId = currentUserId,
                    CreatorEmail = creator.Email,
                    FamilyId = family.Id,
                    Message = requestDto.Message,
                    Status = "pending",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                await _context.JoinFamilyRequests.AddAsync(request);
                await _context.SaveChangesAsync();

                await _notificationService.SendJoinRequestAsync(
                    currentUser.Email,
                    creator.Email,
                    requestDto.Message ?? "I want to join your family");

                return Ok(new
                {
                    Message = "Join request sent to family creator",
                    RequestId = request.Id,
                    Creator = creator.Email,
                    User = currentUser.Email
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error sending join request: {ex.Message}");
            }
        }

        [HttpGet("current")]
        public async Task<IActionResult> GetCurrentFamily()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var family = await _context.Families
                .FirstOrDefaultAsync(f => f.FamilyMembers.Any(fm => fm.UserId == userId));

            return family == null
                ? Ok(new { hasFamily = false, message = "User is not linked to any family" })
                : Ok(new { hasFamily = true, family });
        }
        
        // GET: api/families/requests/incoming
        [HttpGet("requests/incoming")]
        public async Task<ActionResult<IEnumerable<JoinFamilyRequest>>> GetIncomingRequests()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _userService.GetUserById(userId);
            var requests = await _context.JoinFamilyRequests
                .Where(r => r.CreatorEmail == user.Email && r.Status == "pending")
                .Include(r => r.User)
                .ToListAsync();
            
            return Ok(requests);
        }

        // POST: api/families/requests/{id}/accept
        [HttpPost("requests/{id}/accept")]
        public async Task<IActionResult> AcceptRequest(string id, [FromQuery] string memberId)
        {
            var request = await _context.JoinFamilyRequests.FindAsync(id);
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (request == null || request.UserId == currentUserId) return NotFound();

            request.Status = "accepted";
            request.UpdatedAt = DateTime.UtcNow;

            var memberRes = await _context.FamilyMembers.FindAsync(memberId);

            var user = await _userService.GetUserById(request.UserId);
            if (user == null || memberRes == null) return NotFound();

            memberRes.UserId = user.Id;

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Заявка принята"});
        }

        // POST: api/families/requests/{id}/reject
        [HttpPost("requests/{id}/reject")]
        public async Task<IActionResult> RejectRequest(string id)
        {
            var request = await _context.JoinFamilyRequests.FindAsync(id);
            if (request == null) return NotFound();

            request.Status = "rejected";
            request.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Заявка отклонена", request });
        }
    }
}

public class JoinFamilyRequestDto
{
    public string CreatorEmail { get; set; } = null!;
    public string? Message { get; set; }
}