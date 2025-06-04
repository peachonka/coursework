using BudgetApi.Models;
using BudgetApi.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using System.ComponentModel.DataAnnotations;

namespace BudgetApi.Controllers
{
    [ApiController]
    [Route("api/familymembers")]
    public class FamilyMembersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FamilyMembersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("current")]
        public async Task<IActionResult> GetCurrentMember()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var member = await _context.FamilyMembers
                .FirstOrDefaultAsync(m => m.UserId == userId);

            return member == null
                ? Ok(new { isMember = false, message = "User is not linked to any member" })
                : Ok(new { isMember = true, member });
        }

        // GET: api/familymembers
        [HttpGet]
        public async Task<ActionResult<IEnumerable<FamilyMember>>> GetFamilyMembers([FromQuery] string familyId)
        {
            return await _context.FamilyMembers.Where(f => f.FamilyId == familyId).ToListAsync();
        }

        // POST: api/familymembers
        [HttpPost]
        public async Task<ActionResult<FamilyMember>> PostFamilyMember([FromBody] FamilyMemberDto memberDto)
        {
            // Валидация
            if (!ModelState.IsValid || memberDto.Name == null || memberDto.RelationshipType == null || memberDto.FamilyId == null)
                return BadRequest(ModelState);

            if (memberDto.UserId == "")
            {
                memberDto.UserId = null;
            }

            // Создаем нового члена семьи
            var member = new FamilyMember
            {
                Name = memberDto.Name,
                RelationshipType = memberDto.RelationshipType,
                IncomeTypes = memberDto.IncomeTypes ?? new List<string>(),
                UserId = memberDto.UserId,
                FamilyId = memberDto.FamilyId,
                Role = memberDto.Role ?? "member"
            };

            _context.FamilyMembers.Add(member);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetFamilyMembers), new { id = member.Id }, member);
        }

        [HttpPut]
        public async Task<IActionResult> UpdateFamilyMember([FromQuery] string memberId, [FromBody] FamilyMemberDto memberDto)
        {
            // Валидация
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (memberDto.UserId == "")
            {
                memberDto.UserId = null;
            }

            var member = await _context.FamilyMembers.FindAsync(memberId);

            if (member == null)
                return NotFound();

            if (memberDto.Name != null)
                member.Name = memberDto.Name;
            if (memberDto.RelationshipType != null)
                member.RelationshipType = memberDto.RelationshipType;
            if (memberDto.IncomeTypes != null)
                member.IncomeTypes = memberDto.IncomeTypes;
            if (memberDto.Role != null)
                member.Role = memberDto.Role;

            _context.SaveChanges();

            return Ok(new { Message = "Член семьи обновлен" });
        }

        // DELETE:
        [HttpDelete]
        public async Task<IActionResult> DeleteFamilyMember([FromQuery] string memberId)
        {
            var member = await _context.FamilyMembers.FindAsync(memberId);
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (member == null || member.UserId != currentUserId) return NotFound();

            _context.FamilyMembers.Remove(member);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}

public class FamilyMemberDto
{
    [StringLength(50)]
    public string? Name { get; set; } = null!;
    
    public string? RelationshipType { get; set; } = null!;

    public List<string>? IncomeTypes { get; set; }
    
    public string? UserId { get; set; }
    
    public string? FamilyId { get; set; } = null!;

    public string? Role { get; set; }
}